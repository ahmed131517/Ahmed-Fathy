import { useState } from "react";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Check, 
  Send, 
  Volume2, 
  Clock, 
  ShieldAlert, 
  FlaskConical, 
  Pill 
} from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { sendPushNotification } from "../../services/notificationService";
import { toast } from "sonner";

export function NotificationSettings() {
  const { 
    emailNotifications, 
    smsNotifications, 
    pushNotifications, 
    appointmentReminders,
    updateSettings 
  } = useSettings();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [criticalLabAlerts, setCriticalLabAlerts] = useState(true);
  const [controlledSubstanceAlerts, setControlledSubstanceAlerts] = useState(true);

  const handleTestDesktopPush = async () => {
    if (!("Notification" in window)) {
      toast.error("Desktop Browser Notifications are not supported in this browser.");
      return;
    }

    if (Notification.permission === "granted") {
      sendPushNotification("Medical EMR Test Notification", "Clinical alert notification system is fully active.");
      toast.success("Test desktop notification dispatched!");
    } else {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        sendPushNotification("Medical EMR Test Notification", "Clinical alert notification system is fully active.");
        toast.success("Browser permission granted & test notification dispatched!");
      } else {
        toast.error("Browser notification permission was denied.");
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Notification Channels Panel */}
      <div className="card-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Channels</h2>
          </div>
          <button
            onClick={handleTestDesktopPush}
            className="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test Desktop Alert</span>
          </button>
        </div>

        <div className="space-y-4">
          
          {/* Email Channel */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Email Notifications</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Receive summaries, lab reports, and critical updates via email.</p>
              </div>
            </div>
            <button 
              onClick={() => updateSettings({ emailNotifications: !emailNotifications })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${emailNotifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-xs transition-transform ${emailNotifications ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>

          {/* SMS Channel */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">SMS / Text Alerts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Get instant text messages for urgent triage and call duty.</p>
              </div>
            </div>
            <button 
              onClick={() => updateSettings({ smsNotifications: !smsNotifications })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${smsNotifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-xs transition-transform ${smsNotifications ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>

          {/* Desktop Push Channel */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Browser Desktop Push</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Receive native OS desktop notifications while application is in background.</p>
                {pushNotifications && typeof window !== 'undefined' && "Notification" in window && Notification.permission !== 'granted' && (
                  <button 
                    onClick={handleTestDesktopPush}
                    className="mt-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Click to grant browser notification permission
                  </button>
                )}
              </div>
            </div>
            <button 
              onClick={() => updateSettings({ pushNotifications: !pushNotifications })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${pushNotifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-xs transition-transform ${pushNotifications ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>

        </div>
      </div>

      {/* Clinical Thresholds & Triggers */}
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Clinical & Pharmacy Alert Thresholds</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Critical Lab Panic Values</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Trigger immediate high-priority alert when lab results exceed panic limits (e.g. K+ &gt; 6.0).</p>
              </div>
            </div>
            <button 
              onClick={() => setCriticalLabAlerts(!criticalLabAlerts)}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${criticalLabAlerts ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-xs transition-transform ${criticalLabAlerts ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Pharmacy Reorder & Controlled Substance Alerts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Notify pharmacists when drug inventory reaches reorder level or controlled drugs are dispensed.</p>
              </div>
            </div>
            <button 
              onClick={() => setControlledSubstanceAlerts(!controlledSubstanceAlerts)}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${controlledSubstanceAlerts ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-xs transition-transform ${controlledSubstanceAlerts ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Automated Patient Appointment Reminders</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Send automatic reminders to patients 24h prior to their scheduled clinical visit.</p>
              </div>
            </div>
            <button 
              onClick={() => updateSettings({ appointmentReminders: !appointmentReminders })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${appointmentReminders ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-xs transition-transform ${appointmentReminders ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
