import React, { useState, useEffect, useMemo } from 'react';
import { Wind, Activity, Zap, AlertCircle, Settings, Info, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ChartContainer } from '@/components/ui/ChartContainer';

import { useAISettings } from '@/lib/AISettingsContext';
import { clinicalAIRequest } from '@/services/aiWorkflowService';

type VentMode = 'AC-VC' | 'AC-PC' | 'PSV' | 'SIMV';

interface VentSettings {
  mode: VentMode;
  respiratoryRate: number;
  tidalVolume: number;
  peep: number;
  fio2: number;
  pressureControl: number;
  pressureSupport: number;
  inspiratoryTime: number;
  compliance: number; // mL/cmH2O
  resistance: number; // cmH2O/L/s
}

export function MechanicalVentilationSimulator() {
  const [settings, setSettings] = useState<VentSettings>({
    mode: 'AC-VC',
    respiratoryRate: 12,
    tidalVolume: 450,
    peep: 5,
    fio2: 0.4,
    pressureControl: 15,
    pressureSupport: 10,
    inspiratoryTime: 1.0,
    compliance: 50,
    resistance: 10
  });

  const [activeTab, setActiveTab] = useState<'patient' | 'waveforms' | 'education'>('waveforms');
  const [isWaveformsMaximized, setIsWaveformsMaximized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { settings: aiSettings } = useAISettings();
  const [patient, setPatient] = useState({
    gender: 'male',
    height: 175, // cm
    weight: 80, // kg
    abgPCO2: 55,
    targetPCO2: 40,
    clinicalScenario: '',
  });
  const [isGeneratingCase, setIsGeneratingCase] = useState(false);

  const generateClinicalCase = async () => {
    setIsGeneratingCase(true);
    try {
      const prompt = `Generate a random, medically realistic mechanical ventilation clinical scenario for a respiratory therapy student. 
Return ONLY a valid JSON object matching this structure:
{
  "gender": "male" or "female",
  "height": <number in cm, adult>,
  "weight": <number in kg, realistic for height>,
  "abgPCO2": <number, current pCO2 from ABG, typically 35-70>,
  "targetPCO2": <number, typically 40 or permissive like 50>,
  "clinicalScenario": "<A brief 2-3 sentence clinical history and reason for intubation>"
}`;

      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      
      let jsonText = responseText || '{}';
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      const match = jsonText.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        setPatient({
          gender: data.gender || 'male',
          height: data.height || 175,
          weight: data.weight || 80,
          abgPCO2: data.abgPCO2 || 50,
          targetPCO2: data.targetPCO2 || 40,
          clinicalScenario: data.clinicalScenario || 'No scenario details provided.',
        });
      }
    } catch (error) {
      console.error('Error generating case:', error);
      alert('Failed to generate clinical case.');
    } finally {
      setIsGeneratingCase(false);
    }
  };

  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const getInterpretation = async () => {
    setIsInterpreting(true);
    try {
      const prompt = `Interpret these mechanical ventilation settings for a patient.
      Settings: ${JSON.stringify(settings)}
      Patient: ${JSON.stringify(patient)}
      Values: ${JSON.stringify(calculatedValues)}
      
      Provide a concise clinical interpretation focusing on:
      1. Adherence to lung-protective ventilation strategies (e.g. driving pressure, Vt/PBW).
      2. Risks (e.g. VILI, air trapping, overdistension).
      3. Suggestions for improvement if applicable.`;

      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      setInterpretation(responseText);
    } catch (error) {
      console.error('Error getting interpretation:', error);
      setInterpretation('Error generating interpretation. Please try again.');
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage = { role: 'user', content: newMessage } as const;
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setNewMessage('');
    setIsSending(true);

    try {
      const context = `Context: 
      Settings: ${JSON.stringify(settings)}
      Patient: ${JSON.stringify(patient)}
      Values: ${JSON.stringify(calculatedValues)}`;

      const responseText = await clinicalAIRequest(
        [
          { role: 'system', content: `You are a mechanical ventilation expert. ${context}` },
          ...newMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }) as any)
        ],
        aiSettings
      );
      setMessages([...newMessages, { role: 'assistant', content: responseText }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsSending(false);
    }
  };

  // Predicted Body Weight (PBW) / Ideal Body Weight (IBW)
  const pbw = useMemo(() => {
    if (patient.gender === 'male') {
      return 50 + 0.91 * (patient.height - 152.4);
    } else {
      return 45.5 + 0.91 * (patient.height - 152.4);
    }
  }, [patient]);

  // Derived Values
  const minuteVentilation = useMemo(() => (settings.respiratoryRate * settings.tidalVolume) / 1000, [settings]);
  
  // Simplified calculation for PIP and Plateau
  const calculatedValues = useMemo(() => {
    const vtL = settings.tidalVolume / 1000;
    const pplat = settings.peep + (settings.tidalVolume / settings.compliance);
    const flow = vtL / settings.inspiratoryTime; // L/s
    const pip = pplat + (flow * settings.resistance);
    const drivingPressure = pplat - settings.peep;
    
    return {
      pplat: Math.round(pplat),
      pip: Math.round(pip),
      drivingPressure: Math.round(drivingPressure),
      flow: Math.round(flow * 60) // L/min
    };
  }, [settings]);

  // Generate Waveform Data
  const waveformData = useMemo(() => {
    const data = [];
    const pointsPerCycle = 60;
    const numCycles = 3;
    const cycleTime = 60 / settings.respiratoryRate;
    const ti = settings.inspiratoryTime;
    const te = cycleTime - ti;

    for (let c = 0; c < numCycles; c++) {
      for (let i = 0; i < pointsPerCycle; i++) {
        const timeInCycle = (i / pointsPerCycle) * cycleTime;
        const absoluteTime = (c * cycleTime) + timeInCycle;
        let pressure = settings.peep;
        let flow = 0;
        let volume = 0;

        if (timeInCycle <= ti) {
          // Inspiration
          const tIn = timeInCycle / ti;
          if (settings.mode === 'AC-VC' || settings.mode === 'SIMV') {
            flow = (settings.tidalVolume / 1000) / ti;
            // Linear increase in pressure
            pressure = settings.peep + (calculatedValues.pip - settings.peep) * tIn;
            volume = (settings.tidalVolume) * tIn;
          } else {
            // Pressure Control / PSV
            const targetPressure = settings.peep + (settings.mode === 'PSV' ? settings.pressureSupport : settings.pressureControl);
            pressure = targetPressure;
            // Decelerating flow
            flow = ((targetPressure - settings.peep) / settings.resistance) * Math.exp(-tIn * 5);
            volume = settings.tidalVolume * (1 - Math.exp(-tIn * 5));
          }
        } else {
          // Expiration
          const tEx = (timeInCycle - ti) / te;
          // Exponential decay
          pressure = settings.peep + (calculatedValues.pplat - settings.peep) * Math.exp(-tEx * 10);
          if (pressure < settings.peep) pressure = settings.peep; // Clamp to PEEP
          
          flow = -((calculatedValues.pplat - settings.peep) / settings.resistance) * Math.exp(-tEx * 10);
          volume = settings.tidalVolume * Math.exp(-tEx * 10);
        }

        data.push({
          time: absoluteTime,
          pressure: Math.max(0, pressure),
          flow: flow,
          volume: Math.max(0, volume)
        });
      }
    }
    
    // Final point
    data.push({
      time: numCycles * cycleTime,
      pressure: settings.peep,
      flow: 0,
      volume: 0
    });

    return data;
  }, [settings, calculatedValues]);

  return (
    <div className={cn("flex flex-col h-full space-y-4", isFullScreen && "fixed inset-0 z-50 bg-white p-4")}>
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Wind className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Mechanical Ventilation Simulator</h2>
            <p className="text-sm text-slate-500">Interactive physiological model of invasive ventilation</p>
          </div>
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1">
          {[
            { id: 'waveforms', label: 'Waveforms' },
            { id: 'patient', label: 'Patient Data' },
            { id: 'education', label: 'Clinical Info' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-semibold transition-all",
                activeTab === tab.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
          {activeTab === 'waveforms' && (
            <button
              onClick={() => setIsWaveformsMaximized(!isWaveformsMaximized)}
              className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 transition-all hover:bg-white"
            >
              {isWaveformsMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 transition-all hover:bg-white"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className={cn("grid grid-cols-12 gap-6 flex-1 min-h-0", (activeTab === 'waveforms' && isWaveformsMaximized) && "gap-0")}>
        {/* Left Control Panel */}
        {!(activeTab === 'waveforms' && isWaveformsMaximized) && (
          <div className="col-span-12 lg:col-span-4 flex flex-col space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Mode & Basics
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Ventilation Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['AC-VC', 'AC-PC', 'PSV', 'SIMV'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSettings(s => ({ ...s, mode }))}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold border transition-all",
                        settings.mode === mode 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputRange 
                  label="Rate (RR)" 
                  value={settings.respiratoryRate} 
                  min={4} max={40} unit="bpm" 
                  onChange={v => setSettings(s => ({ ...s, respiratoryRate: v }))} 
                />
                <InputRange 
                  label="Tidal Vol (Vt)" 
                  value={settings.tidalVolume} 
                  min={200} max={800} step={10} unit="mL"
                  onChange={v => setSettings(s => ({ ...s, tidalVolume: v }))} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputRange 
                  label="PEEP" 
                  value={settings.peep} 
                  min={0} max={25} unit="cmH2O"
                  onChange={v => setSettings(s => ({ ...s, peep: v }))} 
                />
                <InputRange 
                  label="FiO2" 
                  value={settings.fio2 * 100} 
                  min={21} max={100} unit="%"
                  onChange={v => setSettings(s => ({ ...s, fio2: v / 100 }))} 
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Advanced Settings
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputRange 
                  label="PC Above PEEP" 
                  value={settings.pressureControl} 
                  min={5} max={40} unit="cmH2O"
                  disabled={settings.mode === 'AC-VC'}
                  onChange={v => setSettings(s => ({ ...s, pressureControl: v }))} 
                />
                <InputRange 
                  label="Insp. Time (Ti)" 
                  value={settings.inspiratoryTime} 
                  min={0.5} max={3.0} step={0.1} unit="s"
                  onChange={v => setSettings(s => ({ ...s, inspiratoryTime: v }))} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputRange 
                  label="Compliance" 
                  value={settings.compliance} 
                  min={10} max={100} unit="mL/cm"
                  onChange={v => setSettings(s => ({ ...s, compliance: v }))} 
                />
                <InputRange 
                  label="Resistance" 
                  value={settings.resistance} 
                  min={5} max={50} unit="cm/L/s"
                  onChange={v => setSettings(s => ({ ...s, resistance: v }))} 
                />
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Right Content Area */}
        <div className={cn("flex flex-col space-y-4 min-h-0", (activeTab === 'waveforms' && isWaveformsMaximized) ? "col-span-12" : "col-span-12 lg:col-span-8")}>
          {/* Quick Monitor Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MonitorCard label="PIP" value={calculatedValues.pip} unit="cmH2O" color="text-red-600" />
            <MonitorCard label="Pplat" value={calculatedValues.pplat} unit="cmH2O" color="text-orange-500" />
            <MonitorCard label="P_drive" value={calculatedValues.drivingPressure} unit="cmH2O" color="text-indigo-600" />
            <MonitorCard label="Min Vent (Ve)" value={minuteVentilation.toFixed(1)} unit="L/min" color="text-blue-600" />
          </div>

          <div className="flex-1 bg-slate-900 rounded-2xl p-6 shadow-inner relative flex flex-col min-h-0">
             {activeTab === 'waveforms' && (
               <div className="flex-1 flex flex-col space-y-4">
                 <div className="w-full min-w-0 flex-1 min-h-0">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Pressure (cmH2O)</p>
                    <ChartContainer className="h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart syncId="ventWaveforms" data={waveformData}>
                          <defs>
                            <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis 
                            dataKey="time" 
                            type="number" 
                            domain={['dataMin', 'dataMax']} 
                            hide 
                          />
                          <YAxis domain={[0, 80]} hide />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                            isAnimationActive={false}
                          />
                          <Area type="monotone" dataKey="pressure" name="Pressure" stroke="#ef4444" fillOpacity={1} fill="url(#colorPressure)" strokeWidth={2} isAnimationActive={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                 </div>
                 <div className="w-full min-w-0 flex-1 min-h-0 border-t border-slate-800 pt-2">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Flow (L/s)</p>
                    <ChartContainer className="h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart syncId="ventWaveforms" data={waveformData}>
                          <defs>
                            <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis 
                            dataKey="time" 
                            type="number" 
                            domain={['dataMin', 'dataMax']} 
                            hide 
                          />
                          <YAxis domain={[-15, 15]} hide />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                            isAnimationActive={false}
                          />
                          <Area type="monotone" dataKey="flow" name="Flow" stroke="#22c55e" fillOpacity={1} fill="url(#colorFlow)" strokeWidth={2} isAnimationActive={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                 </div>
                 <div className="w-full min-w-0 flex-1 min-h-0 border-t border-slate-800 pt-2">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Volume (mL)</p>
                    <ChartContainer className="h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart syncId="ventWaveforms" data={waveformData}>
                          <defs>
                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis 
                            dataKey="time" 
                            type="number" 
                            domain={['dataMin', 'dataMax']} 
                            hide 
                          />
                          <YAxis domain={[0, 1000]} hide />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                            isAnimationActive={false}
                          />
                          <Area type="monotone" dataKey="volume" name="Volume" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVolume)" strokeWidth={2} isAnimationActive={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                 </div>
               </div>
             )}

             {activeTab === 'patient' && (
               <div className="p-6 text-white space-y-6 h-full overflow-y-auto">
                 <div className="flex justify-between items-end mb-4">
                   <h3 className="text-xl font-bold">Patient Parameters</h3>
                   <button 
                     onClick={generateClinicalCase}
                     disabled={isGeneratingCase}
                     className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white font-bold text-xs disabled:opacity-50 flex items-center gap-2 transition-colors"
                   >
                     {isGeneratingCase ? (
                       <>
                         <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                         Generating Case...
                       </>
                     ) : (
                       <>
                         <Zap className="w-3 h-3" />
                         Generate MedC-Study Case
                       </>
                     )}
                   </button>
                 </div>
                 
                 {patient.clinicalScenario && (
                   <div className="bg-indigo-900/40 p-5 rounded-xl border border-indigo-500/30 text-indigo-100">
                     <h4 className="flex items-center gap-2 font-bold mb-2 text-indigo-300">
                       <AlertCircle className="w-4 h-4" /> Clinical Scenario
                     </h4>
                     <p className="text-sm leading-relaxed">{patient.clinicalScenario}</p>
                   </div>
                 )}

                 <div className="grid grid-cols-2 gap-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Gender</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setPatient(p => ({...p, gender: 'male'}))}
                          className={cn("px-4 py-2 rounded-lg text-sm font-bold flex-1 transition-all", patient.gender === 'male' ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600")}
                        >Male</button>
                        <button 
                          onClick={() => setPatient(p => ({...p, gender: 'female'}))}
                          className={cn("px-4 py-2 rounded-lg text-sm font-bold flex-1 transition-all", patient.gender === 'female' ? "bg-pink-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600")}
                        >Female</button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Height (cm)</label>
                      <input 
                        type="number" 
                        value={patient.height ?? ''}
                        onChange={(e) => setPatient(p => ({...p, height: Number(e.target.value)}))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white font-bold"
                      />
                    </div>
                 </div>

                 <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                    <h4 className="font-bold text-slate-300">Predicted Body Weight (PBW): <span className="text-blue-400 text-xl">{pbw.toFixed(1)} kg</span></h4>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-slate-700 p-4 rounded-lg text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ARDS (4 mL/kg)</p>
                        <p className="text-xl font-black text-amber-400 mt-1">{(pbw * 4).toFixed(0)} mL</p>
                      </div>
                      <div className="bg-slate-700 p-4 rounded-lg text-center border-2 border-indigo-500 shadow-lg shadow-indigo-500/20">
                        <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Target (6 mL/kg)</p>
                        <p className="text-xl font-black text-indigo-400 mt-1">{(pbw * 6).toFixed(0)} mL</p>
                      </div>
                      <div className="bg-slate-700 p-4 rounded-lg text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Max (8 mL/kg)</p>
                        <p className="text-xl font-black text-red-400 mt-1">{(pbw * 8).toFixed(0)} mL</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-slate-700 flex justify-between items-center bg-slate-900/50 p-4 rounded-xl">
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-slate-300 block">Current Tidal Volume (Set)</span>
                        <span className="text-xs text-slate-500">{settings.tidalVolume} mL on the ventilator</span>
                      </div>
                      <div className="text-right">
                        <span className={cn("text-2xl font-black", settings.tidalVolume > pbw * 8 ? "text-red-400" : settings.tidalVolume < pbw * 4 ? "text-amber-400" : "text-green-400")}>
                          { (settings.tidalVolume / pbw).toFixed(1) }
                        </span>
                        <span className="text-sm text-slate-400 font-bold ml-1">mL/kg</span>
                      </div>
                    </div>
                 </div>

                 <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4 shadow-lg shadow-black/20">
                    <h4 className="font-bold text-slate-300 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-pink-400" /> ABG Correction (pCO2)
                    </h4>
                    <p className="text-xs text-slate-400">Calculate required adjustments to minute ventilation (Ve) or respiratory rate (RR) to reach target pCO2.</p>
                    
                    <div className="grid grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Current pCO2 (mmHg)</label>
                        <input 
                          type="number" 
                          value={patient.abgPCO2 ?? ''}
                          onChange={(e) => setPatient(p => ({...p, abgPCO2: Number(e.target.value)}))}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Target pCO2 (mmHg)</label>
                        <input 
                          type="number" 
                          value={patient.targetPCO2 ?? ''}
                          onChange={(e) => setPatient(p => ({...p, targetPCO2: Number(e.target.value)}))}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
                      <div className="bg-slate-900/50 p-4 rounded-lg">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Required Minute Vent (Ve)</p>
                        <p className="text-2xl font-black text-white mt-1">{((patient.abgPCO2 * minuteVentilation) / patient.targetPCO2).toFixed(1)} L/min</p>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">Currently: {minuteVentilation.toFixed(1)} L/min</p>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-lg">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Required RR (at curr Vt)</p>
                        <p className="text-2xl font-black text-pink-400 mt-1">{Math.round((patient.abgPCO2 * settings.respiratoryRate) / patient.targetPCO2)} bpm</p>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">Currently: {settings.respiratoryRate} bpm</p>
                      </div>
                    </div>
                 </div>
               </div>
             )}

              {activeTab === 'education' && (
               <div className="h-full flex text-sm leading-relaxed overflow-hidden">
                 {/* Scrollable Interpretation Area */}
                 <div className="flex-[2] overflow-y-auto p-4 space-y-4 custom-scrollbar">
                   <h3 className="text-xl font-bold text-white flex items-center justify-between">
                     Clinical Interpretation
                     <button 
                      onClick={getInterpretation}
                      disabled={isInterpreting}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-white font-bold flex items-center gap-1 disabled:opacity-50"
                     >
                       {isInterpreting ? 'Analyzing...' : 'Get AI Interpretation'}
                     </button>
                   </h3>
                   
                   {interpretation ? (
                     <div className="p-4 bg-slate-800 rounded-lg whitespace-pre-wrap text-slate-200">
                       {interpretation}
                     </div>
                   ) : (
                      <div className="p-8 text-center text-slate-500 italic">
                        Click the button above to get a clinical interpretation of the current ventilation settings.
                      </div>
                   )}
                 </div>

                 {/* Chat Sidebar Section */}
                 <div className="flex-1 border-l border-slate-700 bg-slate-900 flex flex-col min-h-0">
                   <h4 className="font-bold text-white p-4">Chat with Expert AI</h4>
                   
                   <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                     {messages.map((m, i) => (
                       <div key={i} className={cn("p-3 rounded-lg text-xs", m.role === 'user' ? "bg-indigo-900/50 text-indigo-100 ml-8" : "bg-slate-700 text-slate-200 mr-8")}>
                         {m.content}
                       </div>
                     ))}
                   </div>
                   
                   <div className="p-4 border-t border-slate-700">
                     <div className="flex gap-2">
                       <input 
                         value={newMessage ?? ''}
                         onChange={(e) => setNewMessage(e.target.value)}
                         onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                         disabled={isSending}
                         placeholder="Ask about these vent settings..."
                         className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-xs"
                       />
                       <button 
                         onClick={handleSendMessage}
                         disabled={isSending}
                         className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white font-bold text-xs disabled:opacity-50"
                       >
                         {isSending ? '...' : 'Send'}
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             <div className="absolute top-4 right-6 flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full animate-ping", 
                  calculatedValues.pip > 35 ? "bg-red-500" : "bg-green-500"
                )} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">System Status: Active</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonitorCard({ label, value, unit, color }: { label: string, value: string | number, unit: string, color: string }) {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-xl font-black", color)}>{value}</span>
        <span className="text-[10px] font-bold text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

function InputRange({ label, value, min, max, unit, step = 1, disabled = false, onChange }: { 
  label: string, value: number, min: number, max: number, unit: string, step?: number, disabled?: boolean, onChange: (v: number) => void 
}) {
  return (
    <div className={cn("space-y-1.5", disabled && "opacity-40 pointer-events-none")}>
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</label>
        <span className="text-xs font-bold text-indigo-600">{value}{unit}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
    </div>
  );
}
