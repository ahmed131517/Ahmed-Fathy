import { useState } from "react";
import { Heart, Stethoscope, FlaskConical, Pill, ClipboardList, AlertCircle, Check, Clock } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

export function MedicalSettings() {
  const { 
    autoDiagnosis, 
    labIntegration, 
    drugInteractionCheck, 
    defaultAppointmentDuration,
    updateSettings 
  } = useSettings();

  const handleEditTemplate = (templateName: string) => {
    toast.info(`Editing template: ${templateName}`);
  };

  return (
    <div className="space-y-6">
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Clinical Workflow</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">AI-Assisted Diagnosis</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Enable AI suggestions for potential diagnoses based on symptoms.</p>
            </div>
            <button 
              onClick={() => updateSettings({ autoDiagnosis: !autoDiagnosis })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${autoDiagnosis ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${autoDiagnosis ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Laboratory Integration</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Automatically sync lab results from connected diagnostic centers.</p>
            </div>
            <button 
              onClick={() => updateSettings({ labIntegration: !labIntegration })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${labIntegration ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${labIntegration ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Default Appointment Duration
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Set the standard duration for new appointments in minutes.</p>
            </div>
            <select 
              value={defaultAppointmentDuration}
              onChange={(e) => updateSettings({ defaultAppointmentDuration: parseInt(e.target.value) })}
              className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm font-medium"
            >
              {[15, 30, 45, 60, 90].map(val => (
                <option key={val} value={val}>{val} minutes</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pharmacy & Medications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Drug Interaction Check</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Warn about potential drug-drug or drug-condition interactions during prescription.</p>
            </div>
            <button 
              onClick={() => updateSettings({ drugInteractionCheck: !drugInteractionCheck })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${drugInteractionCheck ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${drugInteractionCheck ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Custom Templates</h2>
        </div>
        <div className="space-y-2">
          {['General Physical Exam', 'Pediatric Assessment', 'Cardiology Follow-up', 'Neurological Exam'].map((template) => (
            <div key={template} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{template}</span>
              <button 
                onClick={() => handleEditTemplate(template)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
