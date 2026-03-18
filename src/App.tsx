import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Appointments } from "./pages/Appointments";
import { NewPatient } from "./pages/NewPatient";
import { SymptomAnalysis } from "./pages/SymptomAnalysis";
import { PhysicalExam } from "./pages/PhysicalExam";
import { LabRequests } from "./pages/LabRequests";
import { FinalDiagnosis } from "./pages/FinalDiagnosis";
import { Prescriptions } from "./pages/Prescriptions";
import { Pharmacies } from "./pages/Pharmacies";
import { MedicalRecords } from "./pages/MedicalRecords";
import { Profile } from "./pages/Profile";
import { Schedule } from "./pages/Schedule";
import { Settings } from "./pages/Settings";
import { AdminSettings } from "./pages/AdminSettings";
import { PatientProvider } from "./lib/PatientContext";
import { SymptomProvider } from "./lib/SymptomContext";
import { UserProvider } from "./lib/UserContext";
import { ThemeProvider } from "./lib/ThemeContext";
import { SettingsProvider } from "./lib/SettingsContext";

import { PharmacyLayout } from "./pages/pharmacy-system/PharmacyLayout";
import { PharmacyDashboard } from "./pages/pharmacy-system/PharmacyDashboard";
import { PharmacyInventory } from "./pages/pharmacy-system/PharmacyInventory";
import { PharmacyOrders } from "./pages/pharmacy-system/PharmacyOrders";
import { PharmacyPatients } from "./pages/pharmacy-system/PharmacyPatients";
import { PharmacyReports } from "./pages/pharmacy-system/PharmacyReports";

import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { startSyncEngine, syncAll } from "./lib/sync";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";

function SyncStatus() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncAll();
    setLastSync(new Date());
    setIsSyncing(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-lg text-xs font-medium text-slate-600 dark:text-slate-400">
      {isSyncing ? (
        <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
      ) : (
        <Cloud className="w-3 h-3 text-emerald-500" />
      )}
      <span>{isSyncing ? 'Syncing...' : lastSync ? `Last sync: ${lastSync.toLocaleTimeString()}` : 'Local-first active'}</span>
      <button 
        onClick={handleManualSync}
        disabled={isSyncing}
        className="ml-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const stopSync = startSyncEngine();
    return () => stopSync();
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="app-theme">
      <SettingsProvider>
        <UserProvider>
          <PatientProvider>
            <SymptomProvider>
              <BrowserRouter>
              <Toaster position="top-right" richColors />
              <SyncStatus />
              <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="new-patient" element={<NewPatient />} />
              <Route path="symptom-analysis" element={<SymptomAnalysis />} />
              <Route path="physical-exam" element={<PhysicalExam />} />
              <Route path="lab-requests" element={<LabRequests />} />
              <Route path="final-diagnosis" element={<FinalDiagnosis />} />
              <Route path="prescriptions" element={<Prescriptions />} />
              <Route path="pharmacies" element={<Pharmacies />} />
              <Route path="medical-records" element={<MedicalRecords />} />
              <Route path="profile" element={<Profile />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin-settings" element={<AdminSettings />} />
              <Route path="*" element={<div className="p-6 text-slate-500">Page under construction</div>} />
            </Route>

            {/* Pharmacy System Routes */}
            <Route path="/pharmacy-system" element={<PharmacyLayout />}>
              <Route index element={<PharmacyDashboard />} />
              <Route path="inventory" element={<PharmacyInventory />} />
              <Route path="orders" element={<PharmacyOrders />} />
              <Route path="patients" element={<PharmacyPatients />} />
              <Route path="reports" element={<PharmacyReports />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SymptomProvider>
    </PatientProvider>
  </UserProvider>
  </SettingsProvider>
  </ThemeProvider>
  );
}
