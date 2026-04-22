import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { PatientSelection } from "../PatientSelection";
import { PatientContextBar } from "../PatientContextBar";
import { usePatient } from "../../lib/PatientContext";
import { cn } from "../../lib/utils";

export function Layout() {
  const location = useLocation();
  const { selectedPatient } = usePatient();
  const isEncounterNote = location.pathname === "/encounter-note";
  const isClinicalOverview = location.pathname === "/clinical-overview";
  const isSpecialRoute = isEncounterNote || isClinicalOverview;

  const showPatientSelection = !isSpecialRoute && [
    "/new-patient",
    "/symptom-analysis",
    "/physical-exam",
    "/lab-requests",
    "/final-diagnosis",
    "/prescriptions",
    "/pharmacies",
    "/medical-records"
  ].includes(location.pathname);

  return (
    <div className={cn(
      "flex h-screen w-full font-sans overflow-hidden transition-colors duration-200",
      "bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200"
    )}>
      <div className="no-print flex h-full">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="no-print">
          <Header />
          {!isSpecialRoute && selectedPatient && <PatientContextBar />}
        </div>
        <main className={cn(
          "flex-1 overflow-y-auto print:p-0 print:overflow-visible",
          isSpecialRoute ? "p-0" : "p-4 md:p-6"
        )}>
          {showPatientSelection && <div className="no-print"><PatientSelection variant="compact" /></div>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
