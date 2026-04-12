import { useState, useRef } from "react";
import { Heart, Stethoscope, FlaskConical, Pill, ClipboardList, AlertCircle, Check, Clock, Package, ShieldCheck, Upload, FileJson, Database } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { EditTemplateModal } from "../../components/modals/EditTemplateModal";
import { medicationService } from "../../services/medicationService";

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
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        const success = await medicationService.bulkImport(data);
        if (success) {
          toast.success("Medication database expanded successfully!");
        }
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Invalid JSON file format.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

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
          <Database className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Medication Database Management</h2>
        </div>
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <FileJson className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Bulk Import Medications</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Upload a JSON file containing drugs, brands, and interactions to expand your clinical database.
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isImporting ? (
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {isImporting ? "Importing..." : "Upload JSON File"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Database Integrity</h3>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-400">All imported data is validated against clinical standards.</p>
              </div>
            </div>
            <button 
              onClick={() => medicationService.reseed()}
              className="px-3 py-1.5 text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wider"
            >
              Reset to Defaults
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
