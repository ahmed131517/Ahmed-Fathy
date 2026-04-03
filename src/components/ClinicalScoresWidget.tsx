import React from 'react';
import { Symptom } from '@/lib/SymptomContext';
import { clinicalScoringService, ScoringResult } from '@/services/clinicalScoringService';
import { cn } from '@/lib/utils';
import { ClipboardList, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface ClinicalScoresWidgetProps {
  symptoms: Symptom[];
  patientHistory: any;
}

export const ClinicalScoresWidget: React.FC<ClinicalScoresWidgetProps> = ({ symptoms, patientHistory }) => {
  const [expandedScore, setExpandedScore] = React.useState<string | null>(null);

  const scores: ScoringResult[] = [];

  // Dynamically calculate all scores
  Object.keys(clinicalScoringService).forEach(key => {
    if (key.startsWith('calculate')) {
      const fn = (clinicalScoringService as any)[key];
      try {
        // Pass all possible arguments: symptoms, patientHistory, vitals
        const result = fn(symptoms, patientHistory, { temp: 37, hr: 80, rr: 16, sbp: 120, dbp: 80 });
        if (result) {
          scores.push(result);
        }
      } catch (e) {
        // Ignore errors for scores that expect different arguments
      }
    }
  });

  if (scores.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-slate-800">Clinical Scoring Systems</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {scores.map((score) => (
          <div key={score.name} className="p-4">
            <div 
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => setExpandedScore(expandedScore === score.name ? null : score.name)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-700">{score.name}</h4>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                    score.riskLevel === 'Low' ? "bg-emerald-100 text-emerald-700" :
                    score.riskLevel === 'Moderate' ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {score.riskLevel} Risk
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Score: <span className="font-bold text-slate-700">{score.score}</span>
                </div>
              </div>
              <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                {expandedScore === score.name ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {expandedScore === score.name && (
              <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className={cn(
                  "p-3 rounded-lg text-xs flex gap-2",
                  score.riskLevel === 'Low' ? "bg-emerald-50 text-emerald-800 border border-emerald-100" :
                  score.riskLevel === 'Moderate' ? "bg-amber-50 text-amber-800 border border-amber-100" :
                  "bg-red-50 text-red-800 border border-red-100"
                )}>
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <p className="font-medium">{score.interpretation}</p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Criteria Breakdown</p>
                  {score.criteria.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                      <span className={cn(c.met ? "text-slate-800 font-medium" : "text-slate-400")}>{c.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn("font-mono", c.met ? "text-indigo-600 font-bold" : "text-slate-300")}>
                          {c.points > 0 ? `+${c.points}` : c.points}
                        </span>
                        {c.met ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-200" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 italic text-center">
          Rule-based scoring derived from clinical guidelines. Always use clinical judgment.
        </p>
      </div>
    </div>
  );
};
