import React, { useState } from 'react';
import { PERTINENT_NEGATIVES_LIBRARY, PertinentNegativeItem, getSuggestedRuleOutsForSymptoms } from '@/data/pertinentNegativesDictionary';
import { Symptom } from '@/lib/SymptomContext';
import { ShieldAlert, Ban, CheckCircle2, Plus, X, Search, Activity, Sparkles, Filter, ChevronDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PertinentNegativesPanelProps {
  activePositiveSymptoms: Symptom[];
  activePertinentNegatives: PertinentNegativeItem[];
  onToggleNegative: (item: PertinentNegativeItem) => void;
  onClearAll: () => void;
}

export const PertinentNegativesPanel: React.FC<PertinentNegativesPanelProps> = ({
  activePositiveSymptoms,
  activePertinentNegatives,
  onToggleNegative,
  onClearAll
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  const positiveIds = activePositiveSymptoms.map(s => s.id);
  const suggestedRuleOuts = getSuggestedRuleOutsForSymptoms(positiveIds);

  const categories = ['All', 'CVS', 'RES', 'NEU', 'GI', 'GEN', 'GU'];

  const filteredLibrary = PERTINENT_NEGATIVES_LIBRARY.filter(item => {
    const matchesCat = selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;
    const matchesQuery = item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.associatedRuleOuts.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">Pertinent Negatives & Rule-Out Engine</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                LR⁻ Weighting
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Confirm absent symptoms to apply Likelihood Ratio Negative (LR⁻) multipliers and penalize false positives.
            </p>
          </div>
        </div>

        {activePertinentNegatives.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Clear Negatives ({activePertinentNegatives.length})
          </button>
        )}
      </div>

      {/* Suggested Quick Rule-Outs Based on Active Positive Symptoms */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Suggested High-Yield Rule-Outs for Presenting Presentation:
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestedRuleOuts.map(item => {
            const isChecked = activePertinentNegatives.some(n => n.id === item.id);
            return (
              <button
                key={item.id}
                onClick={() => onToggleNegative(item)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5",
                  isChecked
                    ? "bg-rose-950/80 border-rose-500 text-rose-200 shadow-xs"
                    : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600 hover:text-white"
                )}
              >
                {isChecked ? <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                <span>{item.label}</span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/50 px-1 rounded border border-rose-900/50">
                  LR⁻ {item.lrNegative}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search full rule-out library (e.g., diaphoresis, radiation, dyspnea)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500/50"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-medium transition-colors border whitespace-nowrap",
                selectedCategoryFilter === cat
                  ? "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Extended Library Selector */}
      {searchQuery && (
        <div className="max-h-40 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-2 space-y-1">
          {filteredLibrary.length === 0 ? (
            <p className="text-xs text-slate-500 p-2 text-center">No matching negative symptoms found in library.</p>
          ) : (
            filteredLibrary.map(item => {
              const isChecked = activePertinentNegatives.some(n => n.id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => onToggleNegative(item)}
                  className={cn(
                    "p-2 rounded cursor-pointer transition-colors flex items-center justify-between text-xs border",
                    isChecked
                      ? "bg-rose-950/50 border-rose-800/80 text-rose-200"
                      : "bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-rose-400 font-mono text-[10px]">[{item.category}]</span>
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-slate-400">Rules Down: {item.associatedRuleOuts.join(', ')}</span>
                    <span className="text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-900">
                      LR⁻ {item.lrNegative}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Active Pertinent Negatives Summary Bar */}
      {activePertinentNegatives.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-900/60 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Active Rule-Out Multipliers Applied ({activePertinentNegatives.length} Confirmed Negatives):
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {activePertinentNegatives.map(neg => (
              <span
                key={neg.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-900/40 border border-rose-700/60 text-rose-200 text-xs font-medium"
              >
                <span>{neg.label}</span>
                <span className="font-mono text-[10px] text-rose-300 bg-rose-950 px-1 rounded">
                  LR⁻ {neg.lrNegative}
                </span>
                <button
                  onClick={() => onToggleNegative(neg)}
                  className="hover:text-white text-rose-400 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
