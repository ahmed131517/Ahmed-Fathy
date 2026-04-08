import React from 'react';
import { useCDSS } from '../../lib/CDSSContext';
import { useSettings } from '../../lib/SettingsContext';
import { AlertTriangle, AlertCircle, X, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        Clinical Decision Support Alerts
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {displayAlerts.map(alert => (
          <div 
            key={alert.id} 
            className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} flex items-start gap-3 relative group`}
          >
            {getIcon(alert.severity)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{alert.message}</p>
              {alert.details && (
                <p className="text-xs mt-1 opacity-80">{alert.details}</p>
              )}
              <p className="text-[10px] mt-2 opacity-60">
                {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                {showPatientIds && !patientId && ` • Patient ID: ${alert.patientId}`}
              </p>
            </div>
            <button 
              onClick={() => dismissAlert(alert.id)}
              className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
