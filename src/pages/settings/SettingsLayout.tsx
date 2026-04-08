import { Outlet, Link, useLocation } from "react-router-dom";
import { ArrowLeft, Settings as SettingsIcon, Bell, Lock, Globe, Monitor, Palette, Users, Stethoscope, CreditCard, HardDrive, FileText, Link as LinkIcon, Sparkles, LogOut, Grid, Shield } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { useUser } from "../../lib/UserContext";
import { useTranslation, TranslationKey } from "../../lib/i18n";

export function SettingsLayout() {
  const { profile, hasRole } = useUser();
  const location = useLocation();
  const { t, isRTL } = useTranslation();

  const isActive = (path: string) => {
    if (path === '/settings') return location.pathname === '/settings' || location.pathname === '/settings/';
    return location.pathname.includes(path);
  };

  if (!hasRole('admin') && !hasRole('doctor')) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md mx-4">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">{t('accessDenied')}</h2>
          <p className="text-slate-500 mt-2">You do not have administrative permissions to access the system settings.</p>
          <Link to="/" className="inline-block mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            {t('backToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: string; name: string; key: TranslationKey; icon: any; path: string }[] = [
    { id: 'overview', name: 'Overview', key: 'overview', icon: Grid, path: '/settings' },
    { id: 'general', name: 'General', key: 'general', icon: Monitor, path: '/settings/general' },
    { id: 'appearance', name: 'Appearance', key: 'appearance', icon: Palette, path: '/settings/appearance' },
    { id: 'users', name: 'Staff Management', key: 'staffManagement', icon: Users, path: '/settings/users' },
    { id: 'system', name: 'Inventory & System', key: 'inventorySystem', icon: SettingsIcon, path: '/settings/system' },
    { id: 'notifications', name: 'Notifications', key: 'notifications', icon: Bell, path: '/settings/notifications' },
    { id: 'pharmacy', name: 'Pharmacy Operations', key: 'pharmacyOperations', icon: Stethoscope, path: '/settings/pharmacy' },
    { id: 'billing', name: 'Billing & Payment', key: 'billingPayment', icon: CreditCard, path: '/settings/billing' },
    { id: 'security', name: 'Security & Privacy', key: 'securityPrivacy', icon: Lock, path: '/settings/security' },
    { id: 'backup', name: 'Backup & Restore', key: 'backupRestore', icon: HardDrive, path: '/settings/backup' },
    { id: 'audit', name: 'Audit Logs', key: 'auditLogs', icon: FileText, path: '/settings/audit' },
    { id: 'integration', name: 'Supplier & Integration', key: 'supplierIntegration', icon: LinkIcon, path: '/settings/integration' },
    { id: 'ai', name: 'AI Settings', key: 'aiAssistant', icon: Sparkles, path: '/settings/ai' },
    { id: 'language', name: 'Language & Region', key: 'language', icon: Globe, path: '/settings/language' },
  ];

  return (
    <div className={cn("flex h-screen bg-slate-50", isRTL && "flex-row-reverse")}>
      {/* Sidebar */}
      <aside className={cn("w-64 bg-white border-slate-200 flex flex-col", isRTL ? "border-l" : "border-r")}>
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <div>
            <h1 className="font-bold text-slate-900">{t('settings')}</h1>
            <p className="text-xs text-slate-500">{t('systemConfiguration')}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              to={tab.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(tab.path)
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {t(tab.key)}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Link 
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors mb-1"
          >
            <ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
            {t('backToDashboard')}
          </Link>
          <button 
            onClick={() => toast.success("Signed out successfully")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('signOut')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-900">
            {t(tabs.find(t => isActive(t.path))?.key || 'settings')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                {profile.avatarInitials}
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-900">{profile.firstName} {profile.lastName}</p>
                <p className="text-xs text-slate-500 capitalize">{profile.role} Portal</p>
              </div>
            </div>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
