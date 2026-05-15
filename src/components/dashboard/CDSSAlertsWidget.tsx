import React from 'react';
import { useCDSS } from '../../lib/CDSSContext';
import { useSettings } from '../../lib/SettingsContext';
import { AlertTriangle, AlertCircle, X, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function CDSSAlertsWidget({ patientId }: { patientId?: string }) {
  const { alerts, dismissAlert, getAlertsForPatient } = useCDSS();
  const { showPatientIds } = useSettings();
  
  const displayAlerts = patientId ? getAlertsForPatient(patientId) : alerts;

  if (displayAlerts.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-400';
      case 'medium': return 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400';
      case 'low': return 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-400';
      default: return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300';
    }
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'low': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-indigo-500" />
          Clinical Alerts
        </h3>
        <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
          {displayAlerts.length} Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayAlerts.map(alert => (
          <div 
            key={alert.id} 
            className={cn(
              "p-4 rounded-xl border flex items-start gap-3 relative group transition-all hover:shadow-md",
              getSeverityColor(alert.severity)
            )}
          >
            <div className="shrink-0 mt-0.5">
              {getIcon(alert.severity)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-tight">{alert.message}</p>
              {alert.details && (
                <p className="text-[10px] mt-1 opacity-70 truncate">{alert.details}</p>
              )}
              <p className="text-[9px] mt-2 font-bold uppercase tracking-widest opacity-50">
                {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
              </p>
            </div>
            <button 
              onClick={() => dismissAlert(alert.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
