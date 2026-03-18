import { User, Activity, AlertCircle } from "lucide-react";
import { usePatient } from "../lib/PatientContext";
import { useSettings } from "../lib/SettingsContext";
import { cn } from "../lib/utils";

export function PatientContextBar() {
  const { selectedPatient } = usePatient();
  const { compactMode, showPatientIds } = useSettings();
  
  if (!selectedPatient) return null;

  const initials = selectedPatient.name.split(' ').map(n => n[0]).join('');

  return (
    <div className={cn(
      "glass-panel flex items-center justify-between shadow-sm",
      compactMode ? "p-2" : "p-4"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold",
          "font-mono",
          compactMode ? "w-8 h-8 text-sm" : "w-12 h-12 text-lg"
        )}>
          {initials}
        </div>
        <div>
          <h2 className={cn("font-bold text-slate-900 dark:text-white", compactMode && "text-sm", "mono-label")}>{selectedPatient.name}</h2>
          <p className={cn("text-slate-500 dark:text-slate-400", compactMode ? "text-xs" : "text-sm", "font-mono")}>
            {showPatientIds && `ID: ${selectedPatient.id} • `}Age: {selectedPatient.age} • {selectedPatient.gender}
          </p>
        </div>
      </div>
      <div className="flex gap-6">
        <div className={cn("flex items-center gap-2 text-slate-600 dark:text-slate-300", compactMode ? "text-xs" : "text-sm")}>
          <Activity className={cn("text-indigo-500 dark:text-indigo-400", compactMode ? "w-3 h-3" : "w-4 h-4")} />
          <span>Blood Type: {selectedPatient.bloodType}</span>
        </div>
      </div>
    </div>
  );
}
