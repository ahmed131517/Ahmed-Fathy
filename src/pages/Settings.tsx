import { useState } from "react";
import { Bell, Lock, Globe, Monitor } from "lucide-react";
import { GeneralSettings } from "./settings/GeneralSettings";
import { NotificationSettings } from "./settings/NotificationSettings";
import { SecuritySettings } from "./settings/SecuritySettings";
import { LanguageSettings } from "./settings/LanguageSettings";

export function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'language'>('general');

  const tabs = [
    { id: 'general', name: 'General', icon: Monitor, component: GeneralSettings },
    { id: 'notifications', name: 'Notifications', icon: Bell, component: NotificationSettings },
    { id: 'security', name: 'Security', icon: Lock, component: SecuritySettings },
    { id: 'language', name: 'Language & Region', icon: Globe, component: LanguageSettings },
  ] as const;

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || GeneralSettings;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="md:col-span-3">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
