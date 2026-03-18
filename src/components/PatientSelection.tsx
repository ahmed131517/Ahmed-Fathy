import React from 'react';
import { User, ChevronDown } from 'lucide-react';
import { usePatient } from '../lib/PatientContext';
import { useSettings } from '../lib/SettingsContext';
import { cn } from '../lib/utils';

interface PatientSelectionProps {
  variant?: 'default' | 'compact';
  showDetails?: boolean;
}

export function PatientSelection({ variant = 'compact', showDetails = true }: PatientSelectionProps) {
  const { selectedPatient, setSelectedPatient, patients } = usePatient();
  const { compactMode, showPatientIds } = useSettings();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p.id === patientId) || null;
    setSelectedPatient(patient);
  };

  return (
    <div className={cn(
      "card-panel",
      compactMode ? "p-3 mb-4" : "p-6 mb-6",
      variant === 'compact' && (compactMode ? "p-3 flex items-center gap-3 lg:gap-6 flex-wrap" : "p-4 flex items-center gap-4 lg:gap-8 flex-wrap")
    )}>
      <h3 className={cn(
        "flex items-center gap-2 font-semibold text-slate-900 dark:text-white",
        "mono-label",
        variant === 'default' ? "mb-5 text-lg" : "mb-0 text-base whitespace-nowrap"
      )}>
        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        Patient Selection
      </h3>
      
      <div className={cn(
        "flex",
        variant === 'default' ? "flex-col gap-4" : "flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-full sm:min-w-[300px]"
      )}>
        <div className={cn(
          "relative",
          variant === 'default' ? "w-full" : "w-full sm:max-w-[350px]"
        )}>
          <select
            value={selectedPatient?.id || ""}
            onChange={handleSelect}
            className="w-full appearance-none bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 pr-8 transition-colors cursor-pointer"
          >
            <option value="" className="dark:bg-slate-900">-- Select Patient --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id} className="dark:bg-slate-900">
                {p.name} {showPatientIds && `(${p.id})`}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
          <span className={cn(
            "w-2.5 h-2.5 rounded-full shadow-[0_0_0_2px_white] dark:shadow-[0_0_0_2px_#0f172a]",
            selectedPatient ? "bg-emerald-500 shadow-[0_0_0_2px_white,0_0_0_4px_rgba(16,185,129,0.2)] dark:shadow-[0_0_0_2px_#0f172a,0_0_0_4px_rgba(16,185,129,0.2)]" : "bg-slate-300 dark:bg-slate-600 opacity-40"
          )} />
          <span>{selectedPatient ? `Selected: ${selectedPatient.name}` : 'No patient selected'}</span>
        </div>
      </div>

      {showDetails && (
        <div className={cn(
          "grid gap-4 sm:gap-6",
          variant === 'default' 
            ? "grid-cols-2 sm:grid-cols-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800" 
            : "grid-cols-2 lg:flex lg:flex-row lg:flex-2 lg:justify-end mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-none border-slate-100 dark:border-slate-800 w-full lg:w-auto flex-1"
        )}>
          <div className={cn("flex", variant === 'default' ? "flex-col gap-1" : "flex-col lg:flex-row lg:items-center gap-1 lg:gap-2")}>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient ID</span>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{selectedPatient?.id || '-'}</span>
          </div>
          <div className={cn("flex", variant === 'default' ? "flex-col gap-1" : "flex-col lg:flex-row lg:items-center gap-1 lg:gap-2")}>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Age</span>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{selectedPatient?.age ? `${selectedPatient.age} years` : '-'}</span>
          </div>
          <div className={cn("flex", variant === 'default' ? "flex-col gap-1" : "flex-col lg:flex-row lg:items-center gap-1 lg:gap-2")}>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gender</span>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{selectedPatient?.gender || '-'}</span>
          </div>
          <div className={cn("flex", variant === 'default' ? "flex-col gap-1" : "flex-col lg:flex-row lg:items-center gap-1 lg:gap-2")}>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Blood Type</span>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{selectedPatient?.bloodType || 'N/A'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
