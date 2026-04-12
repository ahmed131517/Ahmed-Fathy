import React from 'react';
import { Cpu, X, Sparkles, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiSuggestionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  confirmedDiagnosis: string;
  aiSuggestions: any[];
  isAiLoading: boolean;
  handleAiSuggest: () => void;
  handleGetAlternative: (suggestion: any, idx: number) => void;
  applyAiSuggestion: (suggestion: any) => void;
  toggleSuggestion: (idx: number) => void;
  selectedSuggestions: number[];
  applySelectedSuggestions: () => void;
  setAiSuggestions: (s: any[]) => void;
}

export function AiSuggestionsDialog({
  isOpen,
  onClose,
  confirmedDiagnosis,
  aiSuggestions,
  isAiLoading,
  handleAiSuggest,
  handleGetAlternative,
  applyAiSuggestion,
  toggleSuggestion,
  selectedSuggestions,
  applySelectedSuggestions,
  setAiSuggestions
}: AiSuggestionsDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" /> AI Clinical Assistant
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {!aiSuggestions.length && !isAiLoading && (
            <div className="mb-6">
              <p className="text-sm text-slate-600">
                AI will suggest medications based on the confirmed diagnosis: 
                <span className="font-bold text-indigo-900"> {confirmedDiagnosis}</span>
              </p>
            </div>
          )}
          
          {(isAiLoading || !aiSuggestions.length) && (
            <button 
              onClick={handleAiSuggest}
              disabled={isAiLoading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Generate Suggestions
                </>
              )}
            </button>
          )}

          {aiSuggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recommended Medications</h4>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {setAiSuggestions([]); handleAiSuggest();}}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    Regenerate
                  </button>
                  {selectedSuggestions.length > 0 && (
                    <button 
                      onClick={applySelectedSuggestions}
                      className="text-xs text-emerald-600 font-bold hover:underline"
                    >
                      Add Selected ({selectedSuggestions.length})
                    </button>
                  )}
                </div>
              </div>
              {aiSuggestions.map((suggestion, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "p-4 border rounded-xl transition-all cursor-pointer",
                    selectedSuggestions.includes(idx) 
                      ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" 
                      : "border-indigo-100 bg-indigo-50/30 hover:border-indigo-300"
                  )}
                  onClick={() => toggleSuggestion(idx)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors",
                        selectedSuggestions.includes(idx)
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white border-slate-300"
                      )}>
                        {selectedSuggestions.includes(idx) && <CheckCircle className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="font-bold text-indigo-900">{suggestion.medication}</p>
                        <p className="text-xs text-indigo-600">{suggestion.dosage} • {suggestion.frequency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetAlternative(suggestion, idx);
                        }}
                        className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Get alternative"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          applyAiSuggestion(suggestion);
                        }}
                        className="px-3 py-1 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic ml-8">
                    <span className="font-bold not-italic">Reasoning:</span> {suggestion.reasoning}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {isAiLoading && (
            <div className="py-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <Cpu className="absolute inset-0 m-auto w-6 h-6 text-indigo-600 animate-pulse" />
              </div>
              <p className="text-slate-500 text-sm animate-pulse">Consulting clinical knowledge base...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
