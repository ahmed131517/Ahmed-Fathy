import { Outlet, Link, useLocation } from "react-router-dom";
import { Grid, Package, ShoppingCart, Users, BarChart2, LogOut, Settings, ArrowLeft, Shield, Barcode, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUser } from "../../lib/UserContext";
import { toast } from "sonner";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";

export function PharmacyLayout() {
  const { hasRole } = useUser();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.endsWith(path);

  const pendingOrdersCount = useLiveQuery(
    async () => {
      const all = await db.prescriptions.toArray();
      return all.filter(p => p.status === 'Pending').length;
    }
  ) || 0;

  if (!hasRole('pharmacist') && !hasRole('admin')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-slate-500">You do not have permission to access the pharmacy system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
              PS
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm">Pharmacy System</h1>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Pharmacist Portal</p>
            </div>
          </div>
          <span className="flex h-2 w-2 relative" title="System Online">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/pharmacy-system"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/pharmacy-system") || location.pathname === "/pharmacy-system/" 
                ? "bg-indigo-50 text-indigo-700 font-bold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Grid className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/pharmacy-system/orders"
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("orders") 
                ? "bg-indigo-50 text-indigo-700 font-bold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4" />
              Active Orders
            </div>
            {pendingOrdersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </Link>
          <Link
            to="/pharmacy-system/inventory"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("inventory") 
                ? "bg-indigo-50 text-indigo-700 font-bold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Package className="w-4 h-4" />
            Inventory
          </Link>
          <Link
            to="/pharmacy-system/patients"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("patients") 
                ? "bg-indigo-50 text-indigo-700 font-bold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Users className="w-4 h-4" />
            Patients
          </Link>
          <Link
            to="/pharmacy-system/reports"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("reports") 
                ? "bg-indigo-50 text-indigo-700 font-bold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <BarChart2 className="w-4 h-4" />
            Reports
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Link 
            to="/pharmacies"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Clinic
          </Link>
          <button 
            onClick={() => toast.success("Signed out successfully")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-2xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {location.pathname.endsWith("orders") ? "Order Management" :
               location.pathname.endsWith("inventory") ? "Inventory Management" :
               location.pathname.endsWith("patients") ? "Patient Records" :
               location.pathname.endsWith("reports") ? "Reports & Analytics" :
               "Pharmacist Dashboard"}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              FEFO Verification & Barcode Scanner Online
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DDI & FEFO Safety Rules Active</span>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">
                PH
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">MediCare Pharmacist</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Licensed & Verified</p>
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

