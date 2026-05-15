import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity, FileText, ChevronRight, Send, User, ChevronDown, Plus, AlertCircle, HeartPulse, ShieldAlert, Award, Lightbulb, Zap, Wind } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAISettings } from '@/lib/AISettingsContext';

import { Scenario, ChatMessage, SimulationState, VitalSigns, PatientCondition } from './osceTypes';
import { generatePatientResponse, evaluatePerformance, generateScenario, getClinicalHint, generateHandoverResponse } from './osceEngine';
import { SAMPLE_SCENARIOS } from './scenarioDatabase';
import { VitalsSidebar } from './components/VitalsSidebar';
import { ClinicalToolsSidebar } from './components/ClinicalToolsSidebar';

export function OSCESimulator() {
  const { settings: aiSettings } = useAISettings();
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  
  const [state, setState] = useState<SimulationState>({
    isActive: false,
    scenario: null,
    mode: 'OSCE',
    timeRemaining: 15 * 60, // 15 mins
    turnCount: 0,
    messages: [],
    currentVitals: { bp: '', hr: 0, rr: 0, temp: 0, spo2: 0 },
    condition: 'Stable',
    orderedInvestigations: [],
    findings: [],
    doctorNotes: '',
    differentials: [],
    provisionalDiagnosis: '',
    finalDiagnosis: '',
    evaluation: null
  });

  const [selectedMode, setSelectedMode] = useState<SimulationState['mode']>('OSCE');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [focusKeywords, setFocusKeywords] = useState('');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [mentorHint, setMentorHint] = useState<string | null>(null);

  const handleGetHint = async () => {
    if (!state.scenario || isGettingHint) return;
    setIsGettingHint(true);
    const hint = await getClinicalHint(
      state.scenario,
      state.messages.filter(m => m.role !== 'system'),
      state.differentials,
      aiSettings
    );
    setMentorHint(hint);
    setIsGettingHint(false);
    
    // Auto-clear hint after 10 seconds
    setTimeout(() => setMentorHint(null), 10000);
  };

  const handleEmergencyAction = async (action: string) => {
    if (!state.isActive || !state.scenario) return;

    const actionMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'doctor',
      content: `*ACTION: ${action}*`,
      timestamp: new Date()
    };

    setState(s => ({
      ...s,
      messages: [...s.messages, actionMsg],
      // If action is oxygen or fluids, maybe improve vitals slightly
      currentVitals: action === 'High-flow Oxygen' ? { ...s.currentVitals, spo2: Math.min(100, s.currentVitals.spo2 + 2) } : 
                     action === 'IV Fluid Bolus' ? { ...s.currentVitals, bp: `${parseInt(s.currentVitals.bp.split('/')[0]) + 5}/${parseInt(s.currentVitals.bp.split('/')[1]) + 2}` } : 
                     s.currentVitals
    }));

    setIsTyping(true);
    const botResponse = await generatePatientResponse(
      state.scenario,
      [...state.messages, actionMsg].filter(m => m.role !== 'system'),
      state.mode,
      aiSettings
    );

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'patient',
      content: botResponse,
      timestamp: new Date()
    };

    setState(s => ({ ...s, messages: [...s.messages, botMsg] }));
    setIsTyping(false);
  };

  const filteredScenarios = SAMPLE_SCENARIOS.filter(sc => {
    const matchesSpecialty = selectedSpecialty === 'All' || sc.specialty === selectedSpecialty;
    const matchesDifficulty = selectedDifficulty === 'All' || sc.difficulty === selectedDifficulty;
    const matchesKeywords = !focusKeywords.trim() || 
      sc.title.toLowerCase().includes(focusKeywords.toLowerCase()) || 
      sc.chiefComplaint.toLowerCase().includes(focusKeywords.toLowerCase());
    return matchesSpecialty && matchesDifficulty && matchesKeywords;
  });

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, isTyping]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.isActive && state.timeRemaining > 0 && !showEvaluation) {
      timer = setInterval(() => {
        setState(s => {
          let newVitals = { ...s.currentVitals };
          let newCondition = s.condition;
          
          // Dynamic Disease Progression in Emergency Mode
          if (s.mode === 'Emergency' && s.timeRemaining % 30 === 0 && s.timeRemaining < (15 * 60) - 10) {
             newVitals.hr = Math.min(200, newVitals.hr + Math.floor(Math.random() * 5));
             newVitals.bp = `${parseInt(newVitals.bp.split('/')[0]) - 2}/${parseInt(newVitals.bp.split('/')[1]) - 1}`;
             newVitals.spo2 = Math.max(70, newVitals.spo2 - Math.floor(Math.random() * 3));
             newVitals.rr = Math.min(45, newVitals.rr + 1);
             
             if (s.timeRemaining < 10 * 60) newCondition = 'Critical';
             else if (s.timeRemaining < 13 * 60) newCondition = 'Deteriorating';
          }

          return { 
            ...s, 
            timeRemaining: s.timeRemaining - 1,
            currentVitals: newVitals,
            condition: newCondition
          };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state.isActive, state.timeRemaining, showEvaluation]);

  const handleGenerateAIScenario = async () => {
    setIsGeneratingScenario(true);
    const newScenario = await generateScenario(selectedMode, selectedSpecialty, selectedDifficulty, focusKeywords, aiSettings);
    setIsGeneratingScenario(false);
    if (newScenario) {
      startScenario(newScenario);
    } else {
      alert("Failed to generate scenario. Please try again.");
    }
  };

  const startScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    let initialTime = 15 * 60;
    if (selectedMode === 'Emergency') initialTime = 10 * 60;
    if (selectedMode === 'Communication') initialTime = 20 * 60;

    setState({
      isActive: true,
      scenario,
      mode: selectedMode,
      timeRemaining: initialTime,
      turnCount: 0,
      messages: [{ id: 'sys-1', role: 'system', content: `Scenario started: ${scenario.title}. You have 15 minutes. Greet the patient to begin.`, timestamp: new Date() }],
      currentVitals: { ...scenario.initialVitals },
      condition: scenario.patientInfo.startingCondition,
      orderedInvestigations: [],
      findings: [],
      doctorNotes: '',
      differentials: [],
      provisionalDiagnosis: '',
      finalDiagnosis: '',
      evaluation: null
    });
    setShowEvaluation(false);
  };

  const endScenario = async () => {
    setState(s => ({ ...s, isActive: false }));
    if (!state.scenario) return;
    
    setIsEvaluating(true);
    const evalResult = await evaluatePerformance(
      state.scenario,
      state.messages.filter(m => m.role !== 'system'),
      state.finalDiagnosis,
      state.differentials,
      state.orderedInvestigations,
      state.doctorNotes,
      aiSettings
    );
    setIsEvaluating(false);
    
    setState(s => ({ ...s, evaluation: evalResult }));
    setShowEvaluation(true);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !state.isActive || !state.scenario) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'doctor',
      content: input,
      timestamp: new Date()
    };

    setState(s => ({ ...s, messages: [...s.messages, newMsg], turnCount: s.turnCount + 1 }));
    setInput('');
    setIsTyping(true);

    // Deterioration Logic: Check if trainee is missing key actions in Emergency mode
    if (state.mode === 'Emergency' && state.turnCount > 5) {
      const criticallyMissing = !state.findings.some(f => f.toLowerCase().includes('respiratory')) && 
                               !state.messages.some(m => m.content.toLowerCase().includes('oxygen') || m.content.toLowerCase().includes('fluid'));
      
      if (criticallyMissing && state.condition !== 'Critical') {
        setState(s => ({
          ...s,
          condition: 'Critical',
          currentVitals: {
            ...s.currentVitals,
            spo2: Math.max(80, s.currentVitals.spo2 - 5),
            bp: `${parseInt(s.currentVitals.bp.split('/')[0]) - 10}/${parseInt(s.currentVitals.bp.split('/')[1]) - 5}`
          },
          messages: [
            ...s.messages,
            { id: Date.now().toString() + '-crash', role: 'system', content: "CRITICAL: The patient is becoming unresponsive and their vitals are crashing. Immediate intervention required!", timestamp: new Date() }
          ]
        }));
      }
    }

    if (state.mode === 'Handover') {
      const seniorResponse = await generateHandoverResponse(
        state.scenario,
        newMsg.content,
        state.messages.filter(m => m.role !== 'system'),
        aiSettings
      );
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'patient', // Reusing role but content is from Senior
        content: seniorResponse,
        timestamp: new Date()
      };
      setState(s => ({ ...s, messages: [...s.messages, botMsg] }));
      setIsTyping(false);
      return;
    }

    const botResponse = await generatePatientResponse(
      state.scenario,
      [...state.messages, newMsg].filter(m => m.role !== 'system'),
      state.mode,
      aiSettings
    );

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'patient',
      content: botResponse,
      timestamp: new Date()
    };

    setState(s => ({ ...s, messages: [...s.messages, botMsg] }));
    setIsTyping(false);
    
    // Simulate some logic for investigations
    checkForExaminations(newMsg.content);
  };

  const checkForExaminations = (msgContent: string) => {
    if (!state.scenario) return;
    const lower = msgContent.toLowerCase();
    
    let newFindings: string[] = [];
    
    if (lower.includes('general inspection') || lower.includes('look at you')) {
      newFindings.push(`General: ${state.scenario.physicalExamFindings.general}`);
    }
    if (lower.includes('listen to your heart') || lower.includes('listen to heart') || lower.includes('cardiovascular')) {
      newFindings.push(`Cardiovascular: ${state.scenario.physicalExamFindings.cardiovascular}`);
    }
    if (lower.includes('listen to your chest') || lower.includes('listen to your lungs') || lower.includes('listen to lungs') || (lower.includes('chest') && lower.includes('breathe')) || lower.includes('respiratory')) {
      newFindings.push(`Respiratory: ${state.scenario.physicalExamFindings.respiratory}`);
    }
    if (lower.includes('abdomen') || lower.includes('stomach') || lower.includes('belly') || lower.includes('abdominal')) {
      newFindings.push(`Abdominal: ${state.scenario.physicalExamFindings.abdominal}`);
    }
    if (lower.includes('neurological') || lower.includes('neuro exam')) {
      newFindings.push(`Neurological: ${state.scenario.physicalExamFindings.neurological}`);
    }
    if (lower.includes('extremities') || lower.includes('legs') || lower.includes('arms') || lower.includes('check extremities')) {
      const ext = state.scenario.physicalExamFindings.extremities;
      newFindings.push(`Extremities: ${ext ? ext : 'Normal. No edema, warm to touch.'}`);
    }

    if (newFindings.length > 0) {
      setState(s => ({
        ...s,
        findings: [...s.findings, ...newFindings.filter(f => !s.findings.includes(f))],
        messages: [
          ...s.messages,
          {
            id: Date.now().toString() + '-' + Math.random(),
            role: 'system',
            content: `EXAMINATION FINDINGS: ${newFindings.join(' | ')}`,
            timestamp: new Date()
          }
        ]
      }));
    }
  };

  const orderInvestigation = (type: string) => {
    if (!state.isActive || !state.scenario) return;
    if (state.orderedInvestigations.includes(type)) return;

    setState(s => ({
      ...s,
      orderedInvestigations: [...s.orderedInvestigations, type],
      messages: [
        ...s.messages,
        {
          id: Date.now().toString() + '-ix',
          role: 'system',
          content: `ORDERED: ${type} - Result: ${s.scenario?.investigations[type] || 'Pending / Not strictly abnormal'}`,
          timestamp: new Date()
        }
      ]
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full min-h-[600px] bg-slate-50 rounded-2xl flex flex-col relative transition-all duration-300">
      {isEvaluating ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <h2 className="text-2xl font-bold text-slate-800">Evaluating Performance...</h2>
          <p className="text-slate-500 max-w-md text-center">
            The AI examiner is reviewing your clinical reasoning, diagnostic accuracy, and communication skills.
          </p>
        </div>
      ) : (!state.isActive && !showEvaluation) ? (
        <div className="flex-1 flex gap-6 p-6 min-h-0 overflow-hidden">
          {/* Config Sidebar */}
          <aside className="w-80 flex flex-col gap-6 shrink-0 h-full overflow-y-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Simulator Settings</h3>
              <p className="text-xs text-slate-500">Configure your training session</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Training Mode</label>
                <div className="relative group">
                  <select 
                    value={selectedMode} 
                    onChange={(e) => setSelectedMode(e.target.value as any)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="Normal">Normal Mode</option>
                    <option value="OSCE">OSCE Mode (Timed)</option>
                    <option value="Emergency">Emergency Mode</option>
                    <option value="Communication">Communication Mode</option>
                    <option value="Diagnostic Challenge">Diagnostic Challenge</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Specialty</label>
                <div className="relative group">
                  <select 
                    value={selectedSpecialty} 
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="All">All Specialties</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="ENT">ENT</option>
                    <option value="Dermatology">Dermatology</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Difficulty</label>
                <div className="relative group">
                  <select 
                    value={selectedDifficulty} 
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Focus Keywords</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="e.g. pain, dyspnea..."
                    value={focusKeywords}
                    onChange={(e) => setFocusKeywords(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerateAIScenario}
              disabled={isGeneratingScenario}
              className="mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              {isGeneratingScenario ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Generate Custom Scenario
                </>
              )}
            </button>
          </aside>

          {/* Scenarios Grid Area */}
          <main className="flex-1 flex flex-col min-w-0 h-full">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Activity className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Clinical Simulator</h2>
                  <p className="text-slate-500 text-sm font-medium">Select a scenario to begin your clinical training session</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
                {filteredScenarios.length > 0 ? (
                  filteredScenarios.map(sc => (
                    <div key={sc.id} className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                         onClick={() => startScenario(sc)}>
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">{sc.specialty}</span>
                            <span className="bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-100">{sc.difficulty}</span>
                          </div>
                          <div className="bg-slate-100 p-2 rounded-full group-hover:bg-indigo-100 transition-colors shrink-0">
                            <Play className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 leading-tight">{sc.title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2 italic leading-relaxed">"{sc.chiefComplaint}"</p>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-50 mt-auto flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Patient Trainee Simulation</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center text-slate-500 bg-white/50 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-3xl">
                    <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-400">No scenarios match your criteria</h3>
                    <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or search keywords</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 min-h-0 pt-2 px-2 pb-2 overflow-hidden">
          <VitalsSidebar 
            scenario={state.scenario}
            timeRemaining={state.timeRemaining}
            currentVitals={state.currentVitals}
            orderedInvestigations={state.orderedInvestigations}
            isActive={state.isActive}
            onOrderInvestigation={orderInvestigation}
          />

          {/* Main Area */}
          <div className="flex-1 flex flex-col bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-0 relative">
            {!showEvaluation && state.isActive && (
              <div className={cn(
                "absolute top-0 left-0 right-0 z-30 px-4 py-2 border-b transition-colors duration-500",
                state.condition === 'Critical' ? "bg-red-500 border-red-600" : 
                state.condition === 'Deteriorating' ? "bg-amber-500 border-amber-600" : 
                "bg-slate-800 border-slate-900"
              )}>
                <div className="flex justify-between items-center text-white">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", state.isActive ? "bg-green-400 animate-pulse" : "bg-slate-400")} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{state.mode} Simulation</span>
                    </div>
                    <div className="h-4 w-px bg-white/20" />
                    <div className="flex items-center gap-2">
                       <ShieldAlert className="w-3.5 h-3.5" />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Status: {state.condition}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-red-300" />
                      <span className="text-xs font-mono font-bold tracking-tighter tabular-nums">HR {state.currentVitals.hr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className={cn("w-3.5 h-3.5", state.currentVitals.spo2 < 92 ? "text-red-300" : "text-blue-300")} />
                      <span className="text-xs font-mono font-bold tracking-tighter tabular-nums">SpO2 {state.currentVitals.spo2}%</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-md border border-white/10">
                      <Play className="w-3.5 h-3.5 text-indigo-300" />
                      <span className="text-xs font-mono font-bold tabular-nums">T-{formatTime(state.timeRemaining)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showEvaluation ? (
              <div className="p-8 h-full overflow-y-auto">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Award className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900">Simulation Evaluation</h2>
                    <p className="text-slate-500">Case: {state.scenario?.title}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Score</div>
                    <div className="text-4xl font-extrabold text-indigo-600">{state.evaluation?.score}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'History', value: state.evaluation?.historyTaking },
                    { label: 'Diff Dx', value: state.evaluation?.differentialDiagnosis },
                    { label: 'Investigations', value: state.evaluation?.investigations },
                    { label: 'Communication', value: state.evaluation?.communication },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
                      <div className="text-sm font-bold text-slate-500 mb-2">{s.label}</div>
                      <div className="text-2xl font-bold text-slate-800">{s.value}%</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5"/> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {state.evaluation?.strengths.map((str, i) => (
                        <li key={i} className="flex gap-2 text-slate-700 bg-green-50 p-3 rounded-lg border border-green-100">
                          <span className="text-green-500 font-bold">•</span>
                          <span className="text-sm">{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-700 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5"/> Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {state.evaluation?.weaknesses.map((wk, i) => (
                        <li key={i} className="flex gap-2 text-slate-700 bg-red-50 p-3 rounded-lg border border-red-100">
                          <span className="text-red-500 font-bold">•</span>
                          <span className="text-sm">{wk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-bold text-slate-900 mb-3">Detailed Feedback</h4>
                  <div className="bg-blue-50 text-blue-900 p-5 rounded-xl border border-blue-100 leading-relaxed text-sm">
                    {state.evaluation?.feedback}
                  </div>
                </div>
                
                {state.evaluation?.missedRedFlags && state.evaluation.missedRedFlags.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-bold text-slate-900 mb-3">Missed Red Flags</h4>
                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-200">
                      <ul className="list-disc pl-5 space-y-1 text-orange-800 text-sm">
                        {state.evaluation.missedRedFlags.map((rf, i) => <li key={i}>{rf}</li>)}
                      </ul>
                    </div>
                  </div>
                )}

                {state.evaluation?.suggestedDifferentials && state.evaluation.suggestedDifferentials.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-bold text-slate-900 mb-3 text-sm">Key Differentials to Consider</h4>
                    <div className="flex flex-wrap gap-2">
                      {state.evaluation.suggestedDifferentials.map((sd, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-blue-200">
                          {sd}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-12 mb-6">
                  <button 
                    onClick={() => { setState(s => ({...s, isActive: false})); setShowEvaluation(false); setActiveScenario(null); }}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Return to Simulator Homepage
                  </button>
                </div>

              </div>
            ) : (
              <>
                <div className="bg-slate-50 border-b border-slate-200 p-3 pt-12 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700 text-sm">{state.scenario?.patientInfo.name}</span>
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{state.scenario?.patientInfo.age}Y • {state.scenario?.patientInfo.gender}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {state.mode !== 'Handover' && (
                      <button 
                        onClick={() => setState(s => ({ 
                          ...s, 
                          mode: 'Handover',
                          messages: [...s.messages, { id: 'sys-handover', role: 'system', content: "PHASE 2: HANDOVER. You are now speaking with the Senior Consultant. Please provide your SBAR handover.", timestamp: new Date() }]
                        }))}
                        className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-200 shadow-sm"
                      >
                        <User className="w-3.5 h-3.5" />
                        Senior Handover
                      </button>
                    )}
                    <button 
                      onClick={handleGetHint}
                      disabled={isGettingHint}
                      className="flex items-center gap-2 bg-white text-amber-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-200 shadow-sm"
                    >
                      <Lightbulb className={cn("w-3.5 h-3.5", isGettingHint && "animate-pulse")} />
                      {isGettingHint ? 'Consulting...' : 'Ask Hint'}
                    </button>
                    <button 
                      onClick={endScenario}
                      className="flex items-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-200"
                    >
                      <Square className="w-3.5 h-3.5" fill="currentColor" />
                      Finish
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 min-h-0 relative scroll-smooth" ref={scrollRef}>
                  {mentorHint && (
                    <div className="sticky top-0 z-10 mx-auto max-w-md bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-lg animate-in slide-in-from-top-4 duration-300">
                      <div className="flex gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg h-fit">
                          <Lightbulb className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-amber-600 mb-1 tracking-tight">Mentor's Guidance</div>
                          <p className="text-xs text-amber-900 leading-relaxed italic">"{mentorHint}"</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {state.messages.map(msg => (
                    <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.role === 'doctor' ? "ml-auto items-end" : msg.role === 'system' ? "mx-auto items-center text-center max-w-[90%]" : "mr-auto items-start")}>
                      {msg.role === 'system' ? (
                        <div className="bg-slate-100 text-slate-500 text-[9px] font-bold px-4 py-1.5 rounded-full border border-slate-200 uppercase tracking-[0.2em] my-4 shadow-sm backdrop-blur-sm bg-white/50">
                          {msg.content}
                        </div>
                      ) : (
                        <>
                          <div className={cn(
                            "p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed",
                            msg.role === 'doctor' 
                              ? "bg-indigo-600 text-white rounded-tr-sm font-medium" 
                              : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                          )}>
                            {msg.content}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider px-1">
                            {msg.role === 'doctor' ? 'Clinical Action' : state.scenario?.patientInfo.name} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="mr-auto items-start flex gap-2">
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm flex gap-1">
                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                  {state.mode === 'Emergency' && (
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 invisible-scrollbar">
                      {[
                        { label: 'High-flow Oxygen', icon: Wind },
                        { label: 'IV Fluid Bolus', icon: HeartPulse },
                        { label: 'ECG Monitor', icon: Activity },
                        { label: 'Adrenaline', icon: Zap },
                        { label: 'Aspirin/GTN', icon: HeartPulse }
                      ].map(action => (
                        <button
                          key={action.label}
                          onClick={() => handleEmergencyAction(action.label)}
                          className="flex items-center gap-1.5 whitespace-nowrap bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors"
                        >
                          <action.icon className="w-3 h-3" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask a question, request an examination (e.g. 'listen to your chest')..."
                      className="flex-1 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
                      disabled={isTyping}
                    />
                    <button 
                      type="submit"
                      disabled={!input.trim() || isTyping}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl px-5 flex items-center justify-center transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
                
                <div className="border-t border-slate-200 bg-slate-50 p-4 shrink-0">
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Final Diagnosis (e.g. Acute Appendicitis)" 
                      className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                      value={state.finalDiagnosis}
                      onChange={(e) => setState(s => ({...s, finalDiagnosis: e.target.value}))}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar - Tools & Notes */}
          {state.isActive && !showEvaluation && (
            <ClinicalToolsSidebar 
              findings={state.findings}
              doctorNotes={state.doctorNotes}
              differentials={state.differentials}
              onFindingsCheck={checkForExaminations}
              onNotesChange={(notes) => setState(s => ({...s, doctorNotes: notes}))}
              onDifferentialsChange={(diffs) => setState(s => ({...s, differentials: diffs}))}
            />
          )}
        </div>
      )}
    </div>
  );
}
