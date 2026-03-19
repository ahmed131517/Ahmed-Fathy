import { useState } from "react";
import { Settings, Database, Server, Shield, RefreshCw, HardDrive, Cpu, Globe } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { cn } from "../../lib/utils";

export function SystemConfigurationSettings() {
  const { autoBackup, syncInterval, logLevel, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Database Configuration</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Auto-Backup</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Automatically backup database every 24 hours.</p>
            </div>
            <button 
              onClick={() => updateSettings({ autoBackup: !autoBackup })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${autoBackup ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${autoBackup ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sync Interval (minutes)</label>
              <select 
                value={syncInterval} 
                onChange={(e) => updateSettings({ syncInterval: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm"
              >
                <option value="5">Every 5 minutes</option>
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every hour</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Log Level</label>
              <select 
                value={logLevel} 
                onChange={(e) => updateSettings({ logLevel: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-sm"
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">System Status</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
              <Cpu className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">CPU Usage</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">12%</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
              <HardDrive className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Storage</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">45.2 GB Free</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Uptime</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">15 days, 4h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
