import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Calendar,
  UserPlus,
  Activity,
  ClipboardList,
  FilePlus,
  CheckCircle,
  FileText,
  ShoppingBag,
  Folder,
  BookOpen,
  LogOut,
  Settings,
  Users,
  Bot,
  ListTodo,
  Stethoscope,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation, TranslationKey } from "@/lib/i18n";
import { toast } from "sonner";

const navItems: { name: string; key: TranslationKey; path: string; icon: any }[] = [
  { name: "Dashboard", key: "dashboard", path: "/", icon: LayoutGrid },
  { name: "Appointments", key: "appointments", path: "/appointments", icon: Calendar },
  { name: "New Patient", key: "newPatient", path: "/new-patient", icon: UserPlus },
  { name: "Symptom Analysis", key: "symptomAnalysis", path: "/symptom-analysis", icon: Activity },
  { name: "Physical Exam", key: "physicalExam", path: "/physical-exam", icon: ClipboardList },
  { name: "Lab Requests", key: "labRequests", path: "/lab-requests", icon: FilePlus },
  { name: "Final Diagnosis", key: "finalDiagnosis", path: "/final-diagnosis", icon: CheckCircle },
  { name: "Prescriptions", key: "prescriptions", path: "/prescriptions", icon: FileText },
  { name: "Pharmacies", key: "pharmacies", path: "/pharmacies", icon: ShoppingBag },
  { name: "Medical Records", key: "medicalRecords", path: "/medical-records", icon: Folder },
  { name: "Knowledge", key: "knowledge", path: "/knowledge", icon: BookOpen },
  { name: "Ask AI", key: "askAI", path: "/ask-ai", icon: Bot },
  { name: "Staff Communication", key: "staff", path: "/staff-communication", icon: Users },
  { name: "Settings", key: "settings", path: "/settings", icon: Settings },
];

export function Sidebar() {
  const { t, isRTL } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
  }, [isCollapsed]);

  return (
    <aside className={cn(
      "flex flex-col h-full hidden md:flex transition-all duration-300",
      isCollapsed ? "w-20" : "w-64",
      "bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900"
    )}>
      <div className={cn(
        "h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400 leading-tight truncate">Clinic System</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono text-[10px] uppercase tracking-widest">v10</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? t(item.key) : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-lg text-sm font-medium transition-all duration-200 outline-none focus:outline-none",
                isCollapsed ? "justify-center py-3" : "py-2.5 px-3",
                isActive
                  ? isCollapsed 
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" 
                    : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-l-2 border-indigo-500 rounded-none"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
              )
            }
          >
            <item.icon className={cn(
              "w-5 h-5 flex-shrink-0 transition-all duration-300", 
              !isCollapsed && (isRTL ? "ml-3" : "mr-3")
            )} />
            {!isCollapsed && <span className="truncate">{t(item.key)}</span>}
          </NavLink>
        ))}
      </nav>
      <div className={cn(
        "p-4 border-t border-slate-200 dark:border-slate-800"
      )}>
        <button 
          onClick={() => toast.success("Signed out successfully")}
          title={isCollapsed ? t('logout') : undefined}
          className={cn(
            "flex items-center rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors",
            isCollapsed ? "justify-center py-3 w-full" : "px-3 py-2.5 w-full"
          )}
        >
          <LogOut className={cn(
            "w-5 h-5 flex-shrink-0 transition-all duration-300", 
            !isCollapsed && (isRTL ? "ml-3" : "mr-3")
          )} />
          {!isCollapsed && <span className="truncate">{t('logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
