import { useState } from "react";
import { HardDrive, Cloud, Download, Upload, RefreshCw, Check, AlertCircle, Trash2, FileText, History, Database } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { backupDatabase, restoreDatabase } from "../../lib/backup";
import { toast } from "sonner";
import { db } from "../../lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export function BackupSettings() {
  const { autoBackup, updateSettings } = useSettings();
  const [isRestoring, setIsRestoring] = useState(false);

  const backups = useLiveQuery(() => db.backups.orderBy('timestamp').reverse().toArray());

  const handleBackup = async () => {
    try {
      await backupDatabase();
      toast.success("Backup downloaded successfully");
    } catch (error) {
      toast.error("Failed to backup database");
    }
  };

  const downloadBackup = async (backup: any) => {
    try {
      const response = await fetch(backup.data);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical_backup_${new Date(backup.timestamp).toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded");
    } catch (error) {
      toast.error("Failed to download backup");
    }
  };

  const deleteBackup = async (id: number) => {
    try {
      await db.backups.delete(id);
      toast.success("Backup deleted");
    } catch (error) {
      toast.error("Failed to delete backup");
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
        
        <div className="flex items-center justify-between mb-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
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

        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Weekly Security Ritual</h3>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            For critical clinical data, browser-based storage is not enough. We recommend that a designated staff member <strong>manually exports a database backup to a secure external drive every Friday</strong>. This ensures that even in the event of hardware failure or browser cache clearing, your patient records remain safe.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            <History className="w-4 h-4" />
            <h3>Recent Automated Backups</h3>
          </div>
          
          <div className="space-y-2">
            {backups && backups.length > 0 ? (
              backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                      <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(backup.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        Size: {(backup.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => downloadBackup(backup)}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteBackup(backup.id!)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                <p className="text-sm text-slate-400">No automated backups yet.</p>
              </div>
            )}
          </div>
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
