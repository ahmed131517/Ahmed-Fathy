import { useState } from "react";
import { Bell, Lock, Globe, Monitor, Palette, Users, Settings as SettingsIcon, Stethoscope, CreditCard, HardDrive, Link, Sparkles, FileText } from "lucide-react";
import { GeneralSettings } from "./settings/GeneralSettings";
import { NotificationSettings } from "./settings/NotificationSettings";
import { SecuritySettings } from "./settings/SecuritySettings";
import { LanguageSettings } from "./settings/LanguageSettings";
import { AppearanceSettings } from "./settings/AppearanceSettings";
import { UserManagementSettings } from "./settings/UserManagementSettings";
import { SystemConfigurationSettings } from "./settings/SystemConfigurationSettings";
import { MedicalSettings } from "./settings/MedicalSettings";
import { BillingSettings } from "./settings/BillingSettings";
import { BackupSettings } from "./settings/BackupSettings";
import { AuditLogSettings } from "./settings/AuditLogSettings";
import { IntegrationSettings } from "./settings/IntegrationSettings";
import { AISettings } from "./settings/AISettings";

export function Settings() {
  const [activeTab, setActiveTab] = useState<string>('general');

  const tabs = [
    { id: 'general', name: 'General', icon: Monitor, component: GeneralSettings },
    { id: 'appearance', name: 'Appearance', icon: Palette, component: AppearanceSettings },
    { id: 'users', name: 'User Management', icon: Users, component: UserManagementSettings },
    { id: 'system', name: 'System Config', icon: SettingsIcon, component: SystemConfigurationSettings },
    { id: 'notifications', name: 'Notifications', icon: Bell, component: NotificationSettings },
    { id: 'medical', name: 'Medical Settings', icon: Stethoscope, component: MedicalSettings },
    { id: 'billing', name: 'Billing & Payment', icon: CreditCard, component: BillingSettings },
    { id: 'security', name: 'Security & Privacy', icon: Lock, component: SecuritySettings },
    { id: 'backup', name: 'Backup & Restore', icon: HardDrive, component: BackupSettings },
    { id: 'audit', name: 'Audit Logs', icon: FileText, component: AuditLogSettings },
    { id: 'integration', name: 'Integration & API', icon: Link, component: IntegrationSettings },
    { id: 'ai', name: 'AI Settings', icon: Sparkles, component: AISettings },
    { id: 'language', name: 'Language & Region', icon: Globe, component: LanguageSettings },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || GeneralSettings;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-1 lg:sticky lg:top-24 h-fit">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none translate-x-1' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:translate-x-1'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
              {tab.name}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="lg:col-span-3">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
