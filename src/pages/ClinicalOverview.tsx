import React, { useState, useEffect } from 'react';
import { usePatient } from '../lib/PatientContext';
import { cn } from '../lib/utils';
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, FlaskConical, Pill, Calendar, ArrowLeft, ChevronDown, UserCheck, Users } from 'lucide-react';
import { db } from "../lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { PatientHistoryService } from "../services/PatientHistoryService";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

import { ClinicalTrends } from '../components/ClinicalTrends';
import { getPatientStatusTags, getStatusTagClass, getCriticalFinding } from '../utils/patientUtils';

import { clinicalAIRequest } from "../services/aiWorkflowService";
import { useAISettings } from "../lib/AISettingsContext";

export function ClinicalOverview() {
  const { settings: aiSettings } = useAISettings();
  const { selectedPatient, setSelectedPatient, patients } = usePatient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState("");

  // Clear summary on patient change so it auto-regenerates
  useEffect(() => {
    setSummary("");
  }, [selectedPatient?.id]);

  const timelineEvents = useLiveQuery(
    async () => {
      if (!selectedPatient) return [];
      return await PatientHistoryService.getPatientHistory(selectedPatient.id);
    },
    [selectedPatient]
  ) || [];

  // Filter for valid trends (events that have numerical vitals or specific labs)
  const trendEvents = timelineEvents.filter(e => e.type === 'Vitals' || e.type === 'Lab Result');

  const records = timelineEvents.map(event => event.details);

  const generateSummary = async () => {
    if (!selectedPatient) return;
    setIsGenerating(true);
    try {
      const prompt = `Analyze the complete medical history and patient profile of this patient:
Patient Name: ${selectedPatient.name || `${selectedPatient.firstName} ${selectedPatient.lastName}`}
Demographics: Age ${selectedPatient.age}, Gender ${selectedPatient.gender}, Blood Type ${selectedPatient.bloodType || 'N/A'}, MRN ${selectedPatient.mrn || 'N/A'}
Chronic Conditions: ${selectedPatient.chronicConditions?.join(', ') || 'None'}
Active Maintenance Meds: ${selectedPatient.medications?.map(m => `${m.name} ${m.dosage || ''}`).join(', ') || 'None'}
Known Allergies: ${selectedPatient.allergies?.map(a => a.name).join(', ') || 'NKDA'}

Clinical Records History: ${JSON.stringify(records)}. 

Provide a comprehensive clinical summary including:
1. Summary of Clinical Approach (ORGANIZED IN A MARKDOWN TABLE with columns: | Aspect | Details | Priority |)
2. Key Diagnoses & History
3. Active Chronic Conditions & Risk Profiles
4. Recent Trends (Labs/Vitals Analysis)
5. Outstanding Items/Care Gaps & Risks

Format the response with professional clinical headings and bullet points. Use markdown bolding for key terms.`;
      
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      setSummary(responseText || "Failed to generate summary.");
    } catch (error) {
      setSummary("Error generating summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (selectedPatient && !summary && !isGenerating) {
      generateSummary();
    }
  }, [selectedPatient?.id, summary, isGenerating]);

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Persistent Patient Header - Sticky with Standard Patient Selection */}
      <div className="sticky top-0 z-10 glass-header bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <img 
            className="h-12 w-12 rounded-full border-2 border-indigo-100 dark:border-indigo-900 shadow-sm object-cover" 
            alt="Patient portrait"
            referrerPolicy="no-referrer"
            src={selectedPatient?.photo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"}
          />
          <div>
            <div className="flex items-center gap-2">
              <label htmlFor="clinical-overview-patient-select" className="sr-only">Select Patient</label>
              <div className="relative inline-flex items-center">
                <select
                  id="clinical-overview-patient-select"
                  value={selectedPatient?.id || ""}
                  onChange={(e) => {
                    const p = patients.find(pat => pat.id === e.target.value) || null;
                    setSelectedPatient(p);
                  }}
                  className="appearance-none font-headline font-bold text-lg text-slate-900 dark:text-white bg-indigo-50/60 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-100 dark:border-indigo-800/60 rounded-lg pl-3 pr-8 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                >
                  <option value="" disabled>-- Select Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id} className="text-slate-900 dark:text-slate-200 dark:bg-slate-900 text-sm font-normal">
                      {p.name || `${p.firstName} ${p.lastName}`} (MRN: {p.mrn})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 w-4 h-4 text-indigo-600 dark:text-indigo-400 pointer-events-none" />
              </div>
              <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Standard Context
              </span>
            </div>
            
            {selectedPatient && (
              <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 pl-1">
                <span>MRN: <b className="text-slate-800 dark:text-slate-200">{selectedPatient.mrn || "N/A"}</b></span>
                <span>{selectedPatient.age}y {selectedPatient.gender}</span>
                <span>DOB: {selectedPatient.dob || 'N/A'}</span>
                <span>Blood Type: <b className="text-indigo-600 dark:text-indigo-400">{selectedPatient.bloodType || 'N/A'}</b></span>
              </div>
            )}
          </div>
        </div>

        {selectedPatient && (
          <div className="flex gap-6 items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Current Status</span>
              <div className="flex gap-2 mt-1 text-xs font-bold">
                 {getPatientStatusTags(selectedPatient, timelineEvents).map((tag) => (
                   <span key={tag} className={getStatusTagClass(tag)}>
                     {tag}
                   </span>
                 ))}
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-800"></div>
            {(() => {
              const finding = getCriticalFinding(selectedPatient, timelineEvents);
              const isNormal = finding === "No critical findings reported." || finding === "No patient selected";
              return (
                <div className="flex flex-col">
                  {isNormal ? (
                    <>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span> No Alerts
                      </span>
                      <p className="text-xs font-bold text-emerald-600 mt-1">{finding}</p>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-red-600 font-bold uppercase tracking-tighter flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">warning</span> Critical Findings
                      </span>
                      <p className="text-xs font-bold text-red-600 mt-1">{finding}</p>
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-8 space-y-6 pb-24">
        {!selectedPatient ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select a Patient for Clinical Overview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 mb-6">
              Please choose a patient from the standard directory below to generate and view their AI-synthesized clinical overview and timeline analysis.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/30 transition-all flex items-center gap-4 group"
                >
                  <img
                    src={p.photo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      MRN: {p.mrn} • {p.age}y {p.gender}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h2 className="font-headline text-2xl font-bold text-blue-900 dark:text-blue-200">Clinical Overview</h2>
                  <div className="flex bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900">
                     <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                     <span className="text-xs font-bold text-blue-700 dark:text-blue-300">AI Synthesized</span>
                  </div>
                </div>
                <Link 
                  to="/medical-records"
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  back to Medical Records
                </Link>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={generateSummary}
                  disabled={isGenerating}
                  className="px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")} />
                  Regenerate
                </button>
                <Link 
                  to="/patient-report"
                  className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  Detailed Report
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Main Summary Section */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-8 border border-slate-200 dark:border-slate-800">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-400" />
                    </div>
                    <p className="mt-6 text-slate-500 font-medium">Analyzing complete patient history...</p>
                    <p className="text-slate-400 text-sm mt-2">Correlating diagnoses, lab trends, and medications for {selectedPatient.name}.</p>
                  </div>
                ) : (
                  <div className="prose prose-blue max-w-none prose-sm md:prose-base dark:prose-invert">
                    {summary ? (
                      <Markdown remarkPlugins={[remarkGfm]}>{summary}</Markdown>
                    ) : (
                      <p className="text-slate-500 italic">No summary generated yet. Click regenerate to analyze patient history.</p>
                    )}
                  </div>
                )}
              </section>

              {/* Data Trends Visualization */}
              {trendEvents.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Clinical Trends</h3>
                  </div>
                  <ClinicalTrends events={trendEvents} />
                </section>
              )}

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Medication Adherence</h4>
                    <div className="flex items-end gap-2">
                       <span className="text-3xl font-bold text-emerald-600">92%</span>
                       <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Consistent active home medication use</p>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Profile</h4>
                    <div className="flex items-end gap-2">
                       <span className="text-3xl font-bold text-amber-600">Moderate</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Elevated clinical risk factors</p>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Care Gaps</h4>
                    <div className="flex items-end gap-2">
                       <span className="text-3xl font-bold text-red-600">2</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Routine screening & labs due</p>
                 </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

