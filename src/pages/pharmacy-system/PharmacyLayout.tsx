import { Outlet, Link, useLocation } from "react-router-dom";
import { Grid, Package, ShoppingCart, Users, BarChart2, LogOut, Settings, ArrowLeft } from "lucide-react";
import { cn } from "../../lib/utils";

export function PharmacyLayout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.endsWith(path);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            PS
          </div>
          <div>
            <h1 className="font-bold text-slate-900">Pharmacy System</h1>
            <p className="text-xs text-slate-500">Pharmacist Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/pharmacy-system"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/pharmacy-system") || location.pathname === "/pharmacy-system/" 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Grid className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/pharmacy-system/orders"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("orders") 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            Active Orders
          </Link>
          <Link
            to="/pharmacy-system/inventory"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("inventory") 
                ? "bg-indigo-50 text-indigo-700" 
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
                ? "bg-indigo-50 text-indigo-700" 
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
                ? "bg-indigo-50 text-indigo-700" 
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
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-900">
            {location.pathname.endsWith("orders") ? "Order Management" :
             location.pathname.endsWith("inventory") ? "Inventory Management" :
             location.pathname.endsWith("patients") ? "Patient Records" :
             location.pathname.endsWith("reports") ? "Reports & Analytics" :
             "Pharmacist Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                PH
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-900">MediCare Pharmacist</p>
                <p className="text-xs text-slate-500">Online</p>
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
