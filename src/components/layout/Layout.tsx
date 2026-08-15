import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { PatientContextBar } from "../PatientContextBar";
import { usePatient } from "../../lib/PatientContext";
import { cn } from "../../lib/utils";

export function Layout() {
  const location = useLocation();
  const { selectedPatient } = usePatient();
  const isClinicalOverview = location.pathname === "/clinical-overview";
  const isSpecialRoute = isClinicalOverview;

  return (
    <div className={cn(
      "flex h-screen w-full font-sans overflow-hidden transition-colors duration-200",
      "bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200"
    )}>
      <div className="no-print flex h-full">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <div className="no-print shrink-0">
          <Header />
          {!isSpecialRoute && <PatientContextBar />}
        </div>
        <main className={cn(
          "flex-1 flex flex-col min-h-0 overflow-y-auto print:p-0 print:overflow-visible",
          isSpecialRoute ? "p-0" : "p-4 md:p-6"
        )}>
          <div className="flex-1 flex flex-col min-h-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
