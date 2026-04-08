import { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone, Check } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";

export function NotificationSettings() {
  const { 
    emailNotifications, 
    smsNotifications, 
    pushNotifications, 
    appointmentReminders,
    updateSettings 
  } = useSettings();

  return (
    <div className="space-y-6">
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Channels</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Email Notifications</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Receive summaries and important alerts via email.</p>
              </div>
            </div>
            <button 
              onClick={() => updateSettings({ emailNotifications: !emailNotifications })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${emailNotifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${emailNotifications ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">SMS Notifications</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Get instant text messages for critical updates.</p>
              </div>
            </div>
            <button 
              onClick={() => updateSettings({ smsNotifications: !smsNotifications })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${smsNotifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${smsNotifications ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Push Notifications</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Receive desktop and mobile browser notifications.</p>
                {pushNotifications && Notification.permission !== 'granted' && (
                  <button 
                    onClick={() => Notification.requestPermission().then(() => window.location.reload())}
                    className="mt-2 text-[10px] font-bold text-indigo-600 hover:underline"
                  >
                    Request Browser Permission
                  </button>
                )}
              </div>
            </div>
            <button 
              onClick={() => updateSettings({ pushNotifications: !pushNotifications })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${pushNotifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${pushNotifications ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Appointment Alerts</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Patient Reminders</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Send automatic reminders to patients 24h before their appointment.</p>
            </div>
            <button 
              onClick={() => updateSettings({ appointmentReminders: !appointmentReminders })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${appointmentReminders ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${appointmentReminders ? 'right-0.5 translate-x-0' : 'left-0.5 dark:bg-slate-400'}`}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
