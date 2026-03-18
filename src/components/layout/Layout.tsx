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
  const showPatientSelection = [
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
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        {selectedPatient && <PatientContextBar />}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {showPatientSelection && <PatientSelection variant="compact" />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
