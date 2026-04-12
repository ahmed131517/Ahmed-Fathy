import React from 'react';
import { Search, PlusCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MedicationCatalogProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  dbMeds: any[];
  isSearching: boolean;
  onSelectMedication: (med: any) => void;
  onAddCustomMedication: () => void;
  selectedMedId?: string;
}

export function MedicationCatalog({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  dbMeds,
  isSearching,
  onSelectMedication,
  onAddCustomMedication,
  selectedMedId
}: MedicationCatalogProps) {
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'antibiotics', label: 'Antibiotics' },
    { id: 'analgesics', label: 'Analgesics' },
    { id: 'cardiovascular', label: 'Cardio' },
    { id: 'respiratory', label: 'Resp' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col flex-1 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-slate-500" /> Medications
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors text-slate-900 dark:text-white" 
            placeholder="Search drug name..." 
          />
        </div>
      </div>
      
      <div className="flex overflow-x-auto p-3 gap-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 scrollbar-hide">
        {categories.map((cat) => (
          <button 
            key={cat.id} 
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
              selectedCategory === cat.id 
                ? "bg-indigo-600 text-white" 
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {isSearching ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-slate-500">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
            <p className="text-sm">Searching database...</p>
          </div>
        ) : dbMeds.length > 0 ? (
          <div className="space-y-2">
            {dbMeds.map(med => {
              const query = searchQuery?.toLowerCase() || '';
              const matchedSideEffect = query && med.sideEffects?.find((se: string) => se?.toLowerCase().includes(query));
              const matchedInteraction = query && med.interactions?.find((int: string) => int?.toLowerCase().includes(query));

              return (
                <div 
                  key={med.id} 
                  onClick={() => onSelectMedication(med)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all border",
                    selectedMedId === med.id
                      ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-300"
                      : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  )}
                >
                  <p className="font-medium text-sm text-slate-900 dark:text-white">{med.name}</p>
                  {(matchedSideEffect || matchedInteraction) && (
                    <div className="mt-1 text-[10px] text-slate-500">
                      {matchedSideEffect && <p>Matches side effect: <span className="font-medium text-indigo-600 dark:text-indigo-400">{matchedSideEffect}</span></p>}
                      {matchedInteraction && <p>Matches interaction: <span className="font-medium text-indigo-600 dark:text-indigo-400">{matchedInteraction}</span></p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Search className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm">No medications found.</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <button 
          onClick={onAddCustomMedication}
          className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Add Custom Medication
        </button>
      </div>
    </div>
  );
}
