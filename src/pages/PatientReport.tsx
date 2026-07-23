import React, { useState, useEffect } from 'react';
import { getPatientStatusTags, getStatusTagClass, getCriticalFinding } from '../utils/patientUtils';
import { usePatient } from '../lib/PatientContext';
import { cn } from '../lib/utils';
import { Printer, FileText, Activity, Pill, FlaskConical, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { clinicalAIRequest } from "@/services/aiWorkflowService";
import { useAISettings } from "@/lib/AISettingsContext";

export function PatientReport() {
  const { selectedPatient } = usePatient();
  const { settings: aiSettings } = useAISettings();
  const [summary, setSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  useEffect(() => {
    if (selectedPatient) {
      generateAISummary();
    }
  }, [selectedPatient?.id]);

  const generateAISummary = async () => {
    if (!selectedPatient) return;
    setLoadingSummary(true);
    try {
      const prompt = `Summarize this patient data: ${JSON.stringify(selectedPatient)}. 
      Include a section "### Summary of Clinical Approach" organized in a Markdown table with columns: | Category | Finding | Clinical Significance |.`;
      const systemInstruction = "You are a senior clinical analyst. Provide a professional, concise medical summary of the patient data provided. Focus on key trends and urgent issues. Format as professional clinical notes.";
      
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings,
        systemInstruction
      );
      
      setSummary(responseText || 'Summary unavailable.');
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Failed to load AI clinical summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  if (!selectedPatient) {
    return <div className="p-8 font-sans">No patient selected. Please select a patient to view report.</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 pb-24 max-w-5xl mx-auto bg-white min-h-screen">
      {/* Header - Print Optimized */}
      <div className="flex items-center justify-between border-b pb-6 mb-8 print:border-black">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patient Clinical Report</h1>
          <p className="text-slate-500">Generated on: {new Date().toLocaleDateString()}</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg print:hidden hover:bg-primary-container transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
      </div>

      {/* Patient Info */}
      <div className="grid grid-cols-2 gap-8 mb-8 border-b pb-8">
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Patient Information</h2>
          <p className="text-xl font-bold">{selectedPatient.firstName} {selectedPatient.lastName}</p>
          <p className="text-slate-600">Age: {selectedPatient.age} | Gender: {selectedPatient.gender}</p>
          <p className="text-slate-600">DOB: {selectedPatient.dob}</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Clinical Context</h2>
          <p className="text-slate-600 mb-1">MRN: {selectedPatient.mrn}</p>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-slate-600">Status:</span>
            <div className="flex gap-2">
              {getPatientStatusTags(selectedPatient).map((tag) => (
                 <span key={tag} className={cn("text-xs font-bold", getStatusTagClass(tag))}>
                   {tag}
                 </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Critical Findings:</span>
            {(() => {
              const finding = getCriticalFinding(selectedPatient);
              const isNormal = finding === "No critical findings reported." || finding === "No patient selected";
              return (
                 <span className={cn("text-sm font-semibold", isNormal ? "text-emerald-600" : "text-error")}>
                   {finding}
                 </span>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Report Sections */}
      <div className="space-y-8">
        <section>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-500" /> AI Clinical Assessment
          </h3>
          <div className="bg-slate-50 p-6 rounded-lg text-slate-700 border border-slate-200">
            {loadingSummary ? (
              <div className="flex items-center gap-2 text-slate-500 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating intelligent clinical summary...
              </div>
            ) : (
              <div className="prose prose-slate max-w-none prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
            <FileText className="w-5 h-5" /> Patient Medical Profile
          </h3>
          <div className="bg-white p-6 rounded-lg text-slate-700 border border-slate-100">
             <p className="font-semibold text-slate-900 mb-2">Conditions</p>
             <ul className="list-disc list-inside">
                {selectedPatient.chronicConditions?.map((condition, i) => (
                    <li key={i}>{condition}</li>
                )) || <li>No chronic conditions recorded.</li>}
             </ul>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-8">
            <section>
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                <Activity className="w-5 h-5" /> Recent Vitals
              </h3>
              {selectedPatient.vitalsHistory && selectedPatient.vitalsHistory.length > 0 ? (
                <ul className="space-y-2">
                    {selectedPatient.vitalsHistory.slice(-3).map((vital, i) => (
                        <li key={i} className="border-b py-2 text-sm text-slate-600">
                            <span className="font-semibold text-slate-900">{vital.date}</span>:BP {vital.bloodPressure}, HR {vital.heartRate} bpm
                        </li>
                    ))}
                </ul>
              ) : <p className="text-sm text-slate-500">No vitals history.</p>}
            </section>
            
            <section>
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                <Pill className="w-5 h-5" /> Medications
              </h3>
              {selectedPatient.medications && selectedPatient.medications.length > 0 ? (
                <ul className="space-y-2">
                    {selectedPatient.medications.filter(m => m.status === 'active').map((med, i) => (
                        <li key={i} className="border-b py-2 font-medium">
                            {med.name} {med.dosage} - {med.frequency}
                        </li>
                    ))}
                </ul>
              ) : <p className="text-sm text-slate-500">No active medications.</p>}
            </section>
        </div>
      </div>
    </div>
  );
}
