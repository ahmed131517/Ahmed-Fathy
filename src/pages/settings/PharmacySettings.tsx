import { useState } from "react";
import { Heart, Stethoscope, FlaskConical, Pill, ClipboardList, AlertCircle, Check, Clock, Package, ShieldCheck } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { EditTemplateModal } from "../../components/modals/EditTemplateModal";

export function PharmacySettings() {
  const { 
    autoDiagnosis, 
    labIntegration, 
    drugInteractionCheck, 
    defaultAppointmentDuration,
    dispensingTemplates,
    updateSettings 
  } = useSettings();

  const [editingTemplate, setEditingTemplate] = useState<{ key: keyof typeof dispensingTemplates, name: string } | null>(null);

  const handleSaveTemplate = (newContent: string) => {
    if (editingTemplate) {
      updateSettings({
        dispensingTemplates: {
          ...dispensingTemplates,
          [editingTemplate.key]: newContent
        }
      });
      toast.success(`Template ${editingTemplate.name} updated`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pharmacy Workflow</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">AI-Assisted Prescription Review</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Enable AI suggestions for prescription verification and safety checks.</p>
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
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Inventory Sync Integration</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Automatically sync stock levels from connected suppliers.</p>
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
                Default Dispensing Time
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Set the standard time allocated for dispensing a prescription.</p>
            </div>
            <select 
              value={defaultAppointmentDuration}
              onChange={(e) => updateSettings({ defaultAppointmentDuration: parseInt(e.target.value) })}
              className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm font-medium"
            >
              {[5, 10, 15, 20, 30].map(val => (
                <option key={val} value={val}>{val} minutes</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Safety & Compliance</h2>
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
          <Package className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dispensing Templates</h2>
        </div>
        <div className="space-y-2">
          {[
            { key: 'standard', name: 'Standard Prescription' },
            { key: 'controlled', name: 'Controlled Substance' },
            { key: 'refill', name: 'Refill Request' },
            { key: 'consultation', name: 'Consultation Note' }
          ].map((template) => (
            <div key={template.key} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{template.name}</span>
              <button 
                onClick={() => setEditingTemplate({ key: template.key as keyof typeof dispensingTemplates, name: template.name })}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {editingTemplate && (
        <EditTemplateModal
          isOpen={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          templateName={editingTemplate.name}
          content={dispensingTemplates[editingTemplate.key]}
          onSave={handleSaveTemplate}
        />
      )}
    </div>
  );
}
