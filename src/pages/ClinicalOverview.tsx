import React, { useState, useEffect } from 'react';
import { usePatient } from '../lib/PatientContext';
import { cn } from '../lib/utils';
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, FlaskConical, Pill, Calendar, ArrowLeft } from 'lucide-react';
import { generateContentWithRetry } from "../utils/gemini";
import { db } from "../lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { PatientHistoryService } from "../services/PatientHistoryService";
import Markdown from 'react-markdown';
import { Link } from 'react-router-dom';

import { ClinicalTrends } from '../components/ClinicalTrends';

export function ClinicalOverview() {
  const { selectedPatient } = usePatient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState("");

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
    if (!selectedPatient || records.length === 0) return;
    setIsGenerating(true);
    try {
      const prompt = `Analyze the complete medical history of this patient: ${JSON.stringify(records)}. 
      Provide a comprehensive clinical summary including:
      1. Key Diagnoses
      2. Chronic Conditions
      3. Recent Trends (Labs/Vitals)
      4. Outstanding Items/Risks
      
      Format the response with professional clinical headings and bullet points. Use markdown bolding for key terms.`;
      
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setSummary(response.text || "Failed to generate summary.");
    } catch (error) {
      setSummary("Error generating summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (selectedPatient && records.length > 0 && !summary) {
      generateSummary();
    }
  }, [selectedPatient, records.length]);

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Persistent Patient Header - Sticky */}
      <div className="sticky top-0 z-10 glass-header bg-white/70 border-b border-outline-variant/10 px-8 py-4 flex items-center justify-between no-print">
        <div className="flex items-center gap-5">
          <img 
            className="h-14 w-14 rounded-full border-2 border-white shadow-sm object-cover" 
            alt="Patient portrait"
            referrerPolicy="no-referrer"
            src={selectedPatient?.photo || "https://lh3.googleusercontent.com/aida-public/AB6AXuA4FEqzDaJhfjOMj4aIaExeEm7dMPhdWL3wxM8Ubcjvrbjw4VbquC0rR03GqSZRLK-FLVZYuUCMdWxRAfa4tSfKbCaW91D1VH3x8iRF17ZsMgktjsTlCh6IujONGAlJODQww3Hm7Yo4zfJf_vXkjStVY1FFAQ8jx7B81j2-M2Bohn-xaXxdsrNiNdibFevgLvNAET1sZXA6NuvSGNFLwYjXa2bqz_kbtAUqvSEjSURzOY9qrdIHOMoT-gjD-s6Ja3O2CZszyYkgUzUR"}
          />
          <div>
            <h1 className="font-headline font-bold text-xl text-on-surface tracking-tight">
              {selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "Patient Overview"}
            </h1>
            <div className="flex gap-4 text-xs text-on-surface-variant font-medium mt-0.5">
              <span>MRN: <b className="text-on-surface">{selectedPatient?.mrn || "N/A"}</b></span>
              <span>{selectedPatient?.age}y {selectedPatient?.gender}</span>
              <span>DOB: {selectedPatient?.dob}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Current Status</span>
            <div className="flex gap-3 mt-1 text-xs font-bold">
               <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">Stable</span>
               <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">Follow-up Pending</span>
            </div>
          </div>
          <div className="h-10 w-px bg-outline-variant/30"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-error font-bold uppercase tracking-tighter flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">warning</span> Critical Findings
            </span>
            <p className="text-sm font-bold text-error mt-1">HbA1c: 8.4% (Elevated)</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8 space-y-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="font-headline text-2xl font-bold text-blue-900">Clinical Overview</h2>
              <div className="flex bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                 <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                 <span className="text-xs font-bold text-blue-700">AI Synthesized</span>
              </div>
            </div>
            <Link 
              to="/medical-records"
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              back to Medical Records
            </Link>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={generateSummary}
              className="px-4 py-2 text-xs font-bold text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")} />
              Regenerate
            </button>
            <button className="px-6 py-2 text-xs font-bold text-white bg-primary rounded-lg shadow-md hover:bg-primary-container transition-colors">
              Print Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Main Summary Section */}
          <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-8 border border-outline-variant/10">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-400" />
                </div>
                <p className="mt-6 text-slate-500 font-medium">Analyzing complete patient history...</p>
                <p className="text-slate-400 text-sm mt-2">Correlating diagnoses, lab trends, and medications.</p>
              </div>
            ) : (
              <div className="prose prose-blue max-w-none prose-sm md:prose-base dark:prose-invert">
                {summary ? (
                  <Markdown>{summary}</Markdown>
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
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Clinical Trends</h3>
              </div>
              <ClinicalTrends events={trendEvents} />
            </section>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Medication Adherence</h4>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-emerald-600">92%</span>
                   <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
                </div>
                <p className="text-xs text-slate-500 mt-2">Consistent Lisinopril & Metformin use</p>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Profile</h4>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-amber-600">Moderate</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Elevated cardiovascular risk factors</p>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Care Gaps</h4>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-red-600">2</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">HbA1c & Diabetic Eye Exam overdue</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
