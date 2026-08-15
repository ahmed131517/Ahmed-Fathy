import React, { useState } from 'react';
import { Symptom } from '@/lib/SymptomContext';
import { clinicalScoringService, ScoringResult } from '@/services/clinicalScoringService';
import { cn } from '@/lib/utils';
import { ClipboardList, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Info, Copy, Sparkles, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface ClinicalScoresWidgetProps {
  symptoms: Symptom[];
  patientHistory: any;
  vitals?: any;
}

export const ClinicalScoresWidget: React.FC<ClinicalScoresWidgetProps> = ({ symptoms, patientHistory, vitals }) => {
  const [expandedScore, setExpandedScore] = useState<string | null>(null);
  const [showAllScores, setShowAllScores] = useState(false);

  const allScores: ScoringResult[] = [];
  const currentVitals = vitals || { temp: 37, hr: 80, rr: 16, sbp: 120, dbp: 80 };

  // Dynamically calculate all scores
  Object.keys(clinicalScoringService).forEach(key => {
    if (key.startsWith('calculate')) {
      const fn = (clinicalScoringService as any)[key];
      try {
        const result = fn(symptoms, patientHistory, currentVitals);
        if (result) {
          allScores.push(result);
        }
      } catch (e) {
        // Ignore errors for scores expecting different parameters
      }
    }
  });

  // Filter significant scores unless "showAllScores" is enabled
  const visibleScores = showAllScores 
    ? allScores 
    : allScores.filter(result => 
        result.riskLevel !== 'Low' || 
        (result.name.includes('GCS') || result.name.includes('Glasgow') ? result.score < 15 : result.score > 0)
      );

  const handleCopyScore = (score: ScoringResult) => {
    const text = `[${score.name}] Score: ${score.score} (${score.riskLevel} Risk)\nInterpretation: ${score.interpretation}\nCriteria:\n${score.criteria.map(c => `- ${c.label}: ${c.met ? `MET (+${c.points})` : 'NOT MET'}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${score.name} summary to clipboard!`);
  };

  if (allScores.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800">Clinical Scoring Systems</h3>
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
            {visibleScores.length} Active
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowAllScores(!showAllScores)}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
        >
          <Filter className="w-3 h-3" />
          {showAllScores ? "Show High Risk Only" : "View All Evaluated"}
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {visibleScores.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            No high-risk clinical score triggers detected. Click "View All Evaluated" above to view baseline standard scoring systems.
          </div>
        ) : (
          visibleScores.map((score) => (
            <div key={score.name} className="p-4" role="region" aria-labelledby={`score-title-${score.name.replace(/\s+/g, '-')}`}>
              <div 
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => setExpandedScore(expandedScore === score.name ? null : score.name)}
                role="button"
                aria-expanded={expandedScore === score.name}
                aria-controls={`score-details-${score.name.replace(/\s+/g, '-')}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 id={`score-title-${score.name.replace(/\s+/g, '-')}`} className="text-sm font-bold text-slate-700">{score.name}</h4>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                      score.riskLevel === 'Low' ? "bg-emerald-100 text-emerald-700" :
                      score.riskLevel === 'Moderate' ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700 animate-pulse"
                    )}>
                      {score.riskLevel} Risk
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Score: <span className="font-bold text-slate-700">{score.score}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyScore(score);
                    }}
                    title="Copy clinical score for documentation"
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-slate-400 group-hover:text-slate-600 transition-colors" aria-hidden="true">
                    {expandedScore === score.name ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {expandedScore === score.name && (
                <div id={`score-details-${score.name.replace(/\s+/g, '-')}`} className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className={cn(
                    "p-3 rounded-lg text-xs flex gap-2",
                    score.riskLevel === 'Low' ? "bg-emerald-50 text-emerald-800 border border-emerald-100" :
                    score.riskLevel === 'Moderate' ? "bg-amber-50 text-amber-800 border border-amber-100" :
                    "bg-red-50 text-red-800 border border-red-200"
                  )}>
                    {score.riskLevel === 'High' ? (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="font-medium leading-relaxed">{score.interpretation}</p>
                  </div>

                  <div className="space-y-1.5" role="list" aria-label="Criteria breakdown">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Criteria Breakdown</p>
                    {score.criteria.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0" role="listitem">
                        <span className={cn(c.met ? "text-slate-800 font-medium" : "text-slate-400")}>{c.label}</span>
                        <div className="flex items-center gap-2" aria-label={c.met ? `Criteria met with ${c.points} points` : `Criteria not met`}>
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
          ))
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 italic text-center">
          Rule-based scoring derived from validated clinical guidelines (HEART, PERC, Wells, CURB-65, ABCD2, Alvarado, NIHSS, NEWS2). Always use medical judgment.
        </p>
      </div>
    </div>
  );
};
