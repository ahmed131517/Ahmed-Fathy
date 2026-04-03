import React from 'react';
import { Symptom } from '@/lib/SymptomContext';
import { COMMON_DIAGNOSES, Diagnosis } from '@/data/diagnosisMappings';
import { cn } from '@/lib/utils';
import { Grid, Info, AlertTriangle, BookOpen, ExternalLink, CheckCircle2, X } from 'lucide-react';

interface DifferentialDiagnosisGridProps {
  symptoms: Symptom[];
}

export const DifferentialDiagnosisGrid: React.FC<DifferentialDiagnosisGridProps> = ({ symptoms }) => {
  const [selectedDiagnosis, setSelectedDiagnosis] = React.useState<Diagnosis | null>(null);

  const matchedDiagnoses = COMMON_DIAGNOSES.filter(diag => 
    diag.commonSymptoms.some(sId => symptoms.some(s => s.id === sId))
  ).map(diag => {
    const matchedCount = diag.commonSymptoms.filter(sId => symptoms.some(s => s.id === sId)).length;
    const matchPercentage = (matchedCount / diag.commonSymptoms.length) * 100;
    return { ...diag, matchPercentage };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage)
  .slice(0, 6); // Only show top 6 clinical conditions

  if (matchedDiagnoses.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <Grid className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-slate-800">Visual Differential Diagnosis Grid</h3>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {matchedDiagnoses.map((diag) => (
            <div 
              key={diag.id}
              onClick={() => setSelectedDiagnosis(diag)}
              className={cn(
                "p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                selectedDiagnosis?.id === diag.id ? "border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500" : "border-slate-100 bg-white hover:border-indigo-300"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-xs font-bold text-slate-800 leading-tight">{diag.name}</h4>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold text-indigo-600">{Math.round(diag.matchPercentage)}% Match</span>
                  <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500" 
                      style={{ width: `${diag.matchPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2">{diag.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {diag.commonSymptoms.map(sId => {
                  const isMatched = symptoms.some(s => s.id === sId);
                  return (
                    <span 
                      key={sId} 
                      className={cn(
                        "text-[8px] px-1.5 py-0.5 rounded-full font-medium",
                        isMatched ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {sId.replace(/_/g, ' ')}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {selectedDiagnosis && (
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{selectedDiagnosis.category}</span>
                <h4 className="text-sm font-bold text-slate-900">{selectedDiagnosis.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">ICD-10: {selectedDiagnosis.icd10}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDiagnosis(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed mb-4">{selectedDiagnosis.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Key Features
                </h5>
                <ul className="space-y-1">
                  {selectedDiagnosis.commonSymptoms.map(s => (
                    <li key={s} className="text-[10px] text-slate-700 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      {s.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>
              </div>
              {selectedDiagnosis.redFlags.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" /> Red Flags
                  </h5>
                  <ul className="space-y-1">
                    {selectedDiagnosis.redFlags.map(f => (
                      <li key={f} className="text-[10px] text-red-700 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-red-300" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
              <div className="flex gap-2">
                <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Clinical Guidelines
                </button>
                <button className="text-[10px] font-bold text-slate-500 hover:text-slate-600 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> UpToDate
                </button>
              </div>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700">
                Add to SOAP Note
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 italic text-center">
          Visual grid based on structured medical data. AI is used as a reviewer for complex cases.
        </p>
      </div>
    </div>
  );
};
