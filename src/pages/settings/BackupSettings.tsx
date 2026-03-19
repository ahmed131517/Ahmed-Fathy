import { useState } from "react";
import { HardDrive, Cloud, Download, Upload, RefreshCw, Check, AlertCircle, Trash2, FileText } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { backupDatabase, restoreDatabase } from "../../lib/backup";
import { toast } from "sonner";

export function BackupSettings() {
  const { autoBackup, updateSettings } = useSettings();
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = async () => {
    try {
      await backupDatabase();
      toast.success("Backup downloaded successfully");
    } catch (error) {
      toast.error("Failed to backup database");
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsRestoring(true);
      try {
        await restoreDatabase(e.target.files[0]);
        toast.success("Database restored successfully");
      } catch (error) {
        toast.error("Failed to restore database");
      } finally {
        setIsRestoring(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Backup & Restore</h2>
          </div>
          <button onClick={handleBackup} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Database
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Auto-Backup Status</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {autoBackup ? "Automatically backing up every 24 hours." : "Automatic backups are currently disabled."}
            </p>
          </div>
          <button 
            onClick={() => updateSettings({ autoBackup: !autoBackup })}
            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${autoBackup ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${autoBackup ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
          </button>
        </div>
      </div>

      <div className="card-panel p-6 border-red-100 dark:border-red-900/30">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Restore System</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Restoring the system will overwrite all current data with the selected backup. This action cannot be undone.
        </p>
        <label className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors cursor-pointer">
          {isRestoring ? "Restoring..." : "Select Backup to Restore"}
          <input type="file" className="hidden" onChange={handleRestore} accept=".json" disabled={isRestoring} />
        </label>
      </div>
    </div>
  );
}
