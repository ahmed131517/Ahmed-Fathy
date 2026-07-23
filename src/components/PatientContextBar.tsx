import { User, Activity, AlertCircle, ChevronDown } from "lucide-react";
import { usePatient } from "../lib/PatientContext";
import { useSettings } from "../lib/SettingsContext";
import { cn } from "../lib/utils";

export function PatientContextBar() {
  const { selectedPatient, setSelectedPatient, patients } = usePatient();
  const { compactMode, showPatientIds } = useSettings();

  if (!selectedPatient) {
    return (
      <div className={cn(
        "glass-panel flex items-center justify-between shadow-sm gap-4",
        compactMode ? "p-3" : "p-4"
      )}>
        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            "rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0",
            compactMode ? "w-8 h-8" : "w-12 h-12"
          )}>
            <User className={compactMode ? "w-4 h-4" : "w-6 h-6"} />
          </div>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              No patient selected:
            </span>
            <div className="relative inline-flex items-center w-full sm:w-auto">
              <select
                value=""
                onChange={(e) => {
                  const patient = patients.find(p => p.id === e.target.value) || null;
                  setSelectedPatient(patient);
                }}
                className="w-full sm:w-64 appearance-none bg-indigo-50/80 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 font-semibold text-indigo-700 dark:text-indigo-400 text-sm rounded-lg pl-3 pr-8 py-1.5 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled className="dark:bg-slate-900 text-slate-400">-- Select Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id} className="text-slate-900 dark:text-slate-200 dark:bg-slate-900 text-sm font-normal">
                    {p.name} {showPatientIds && `(${p.id})`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 w-4 h-4 text-indigo-500 dark:text-indigo-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initials = selectedPatient.name.split(' ').map(n => n[0]).join('');

  return (
    <div className={cn(
      "glass-panel flex items-center justify-between shadow-sm",
      compactMode ? "p-2" : "p-4"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shrink-0",
          "font-mono",
          compactMode ? "w-8 h-8 text-sm" : "w-12 h-12 text-lg"
        )}>
          {initials}
        </div>
        <div className="flex flex-col">
          <div className="relative inline-flex items-center">
            <select
              value={selectedPatient?.id || ""}
              onChange={(e) => {
                const patient = patients.find(p => p.id === e.target.value) || null;
                setSelectedPatient(patient);
              }}
              className="appearance-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border-none font-bold text-slate-900 dark:text-white text-sm md:text-base lg:text-lg focus:ring-2 focus:ring-indigo-500 rounded-md pl-1 pr-7 py-0.5 cursor-pointer transition-colors font-sans focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id} className="text-slate-900 dark:text-slate-200 dark:bg-slate-900 font-sans text-sm font-normal">
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
          </div>
          <p className={cn("text-slate-500 dark:text-slate-400 pl-1", compactMode ? "text-xs" : "text-sm", "font-mono")}>
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
