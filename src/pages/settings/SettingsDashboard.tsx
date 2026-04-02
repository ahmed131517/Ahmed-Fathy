import { 
  Monitor, 
  Palette, 
  Users, 
  Settings as SettingsIcon, 
  Bell, 
  Stethoscope, 
  CreditCard, 
  Lock, 
  HardDrive, 
  FileText, 
  Link as LinkIcon, 
  Sparkles, 
  Globe,
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

export function SettingsDashboard() {
  const categories = [
    { 
      title: "General & Appearance", 
      items: [
        { name: "General Settings", path: "/settings", icon: Monitor, desc: "Basic system configuration and info" },
        { name: "Appearance", path: "/settings/appearance", icon: Palette, desc: "Themes, colors, and visual styles" },
        { name: "Language & Region", path: "/settings/language", icon: Globe, desc: "Timezones and localization" },
      ]
    },
    { 
      title: "Staff & Operations", 
      items: [
        { name: "Staff Management", path: "/settings/users", icon: Users, desc: "Manage roles and permissions" },
        { name: "Pharmacy Operations", path: "/settings/pharmacy", icon: Stethoscope, desc: "Pharmacy-specific workflows" },
        { name: "System Configuration", path: "/settings/system", icon: SettingsIcon, desc: "Advanced system parameters" },
      ]
    },
    { 
      title: "Security & Data", 
      items: [
        { name: "Security & Privacy", path: "/settings/security", icon: Lock, desc: "Authentication and data protection" },
        { name: "Backup & Restore", path: "/settings/backup", icon: HardDrive, desc: "Database snapshots and recovery" },
        { name: "Audit Logs", path: "/settings/audit", icon: FileText, desc: "Track all system activities" },
      ]
    },
    { 
      title: "Advanced Features", 
      items: [
        { name: "AI Settings", path: "/settings/ai", icon: Sparkles, desc: "Configure clinical AI assistants" },
        { name: "Integrations", path: "/settings/integration", icon: LinkIcon, desc: "Connect with external suppliers" },
        { name: "Billing & Payment", path: "/settings/billing", icon: CreditCard, desc: "Subscription and invoicing" },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Security Status</h3>
            <p className="text-lg font-bold text-slate-900">Optimal</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">System Version</h3>
            <p className="text-lg font-bold text-slate-900">v10.4.2</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Last Backup</h3>
            <p className="text-lg font-bold text-slate-900">2 hours ago</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categories.map((cat, i) => (
          <div key={i} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">{cat.title}</h3>
            <div className="grid grid-cols-1 gap-3">
              {cat.items.map((item, j) => (
                <Link 
                  key={j} 
                  to={item.path}
                  className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-lg flex items-center justify-center transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{item.name}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
