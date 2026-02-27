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
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutGrid },
  { name: "Appointments", path: "/appointments", icon: Calendar },
  { name: "New Patient", path: "/new-patient", icon: UserPlus },
  { name: "Symptom Analysis", path: "/symptom-analysis", icon: Activity },
  { name: "Physical Exam", path: "/physical-exam", icon: ClipboardList },
  { name: "Lab Requests", path: "/lab-requests", icon: FilePlus },
  { name: "Final Diagnosis", path: "/final-diagnosis", icon: CheckCircle },
  { name: "Prescriptions", path: "/prescriptions", icon: FileText },
  { name: "Pharmacies", path: "/pharmacies", icon: ShoppingBag },
  { name: "Medical Records", path: "/medical-records", icon: Folder },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex flex-col">
          <span className="font-bold text-lg text-indigo-600 leading-tight">Clinic System</span>
          <span className="text-xs text-slate-500 font-medium">v10</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <button className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
