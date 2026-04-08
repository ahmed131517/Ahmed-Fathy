import { Tasks } from "./pages/Tasks";
import { MobileVitals } from "./pages/MobileVitals";
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
import { Knowledge } from "./pages/Knowledge";
import { AskAI } from "./pages/AskAI";
import { Profile } from "./pages/Profile";
import { Schedule } from "./pages/Schedule";
import { SettingsLayout } from "./pages/settings/SettingsLayout";
import { SettingsDashboard } from "./pages/settings/SettingsDashboard";
import { GeneralSettings } from "./pages/settings/GeneralSettings";
import { NotificationSettings } from "./pages/settings/NotificationSettings";
import { SecuritySettings } from "./pages/settings/SecuritySettings";
import { LanguageSettings } from "./pages/settings/LanguageSettings";
import { AppearanceSettings } from "./pages/settings/AppearanceSettings";
import { UserManagementSettings } from "./pages/settings/UserManagementSettings";
import { SystemConfigurationSettings } from "./pages/settings/SystemConfigurationSettings";
import { PharmacySettings } from "./pages/settings/PharmacySettings";
import { BillingSettings } from "./pages/settings/BillingSettings";
import { BackupSettings } from "./pages/settings/BackupSettings";
import { AuditLogSettings } from "./pages/settings/AuditLogSettings";
import { IntegrationSettings } from "./pages/settings/IntegrationSettings";
import { AISettings } from "./pages/settings/AISettings";
import { AdminSettings } from "./pages/AdminSettings";
import { UserManagement } from "./pages/UserManagement";
import { Notifications } from "./pages/Notifications";
import { PatientProvider } from "./lib/PatientContext";
import { SymptomProvider } from "./lib/SymptomContext";
import { UserProvider } from "./lib/UserContext";
import { ThemeProvider } from "./lib/ThemeContext";
import { SettingsProvider } from "./lib/SettingsContext";
import { NotificationProvider } from "./lib/NotificationContext";
import { AISettingsProvider } from "./lib/AISettingsContext";
import { CDSSProvider } from "./lib/CDSSContext";

import { PharmacyLayout } from "./pages/pharmacy-system/PharmacyLayout";
import { PharmacyDashboard } from "./pages/pharmacy-system/PharmacyDashboard";
import { PharmacyInventory } from "./pages/pharmacy-system/PharmacyInventory";
import { PharmacyOrders } from "./pages/pharmacy-system/PharmacyOrders";
import { PharmacyPatients } from "./pages/pharmacy-system/PharmacyPatients";
import { PharmacyReports } from "./pages/pharmacy-system/PharmacyReports";

import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { startSyncEngine, syncAll } from "./lib/sync";
import { checkAndPerformAutoBackup } from "./services/backupService";
import { checkAndSendAppointmentReminders } from "./services/notificationService";
import { useSettings } from "./lib/SettingsContext";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";

function BackupInitializer() {
  const { autoBackup, appointmentReminders } = useSettings();
  
  useEffect(() => {
    checkAndPerformAutoBackup(autoBackup);
    checkAndSendAppointmentReminders(appointmentReminders);
  }, [autoBackup, appointmentReminders]);

  return null;
}

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
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-lg text-xs font-medium text-slate-600 dark:text-slate-400 no-print">
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
        <BackupInitializer />
        <UserProvider>
          <NotificationProvider>
            <AISettingsProvider>
              <CDSSProvider>
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
                          <Route path="knowledge" element={<Knowledge />} />
                          <Route path="ask-ai" element={<AskAI />} />
                          <Route path="mobile-vitals" element={<MobileVitals />} />
                          <Route path="profile" element={<Profile />} />
                          <Route path="schedule" element={<Schedule />} />
                          <Route path="notifications" element={<Notifications />} />
                          <Route path="tasks" element={<Tasks />} />
                          <Route path="*" element={<div className="p-6 text-slate-500">Page under construction</div>} />
                        </Route>

                        {/* Settings System Routes */}
                        <Route path="/settings" element={<SettingsLayout />}>
                          <Route index element={<SettingsDashboard />} />
                          <Route path="general" element={<GeneralSettings />} />
                          <Route path="appearance" element={<AppearanceSettings />} />
                          <Route path="users" element={<UserManagementSettings />} />
                          <Route path="system" element={<SystemConfigurationSettings />} />
                          <Route path="notifications" element={<NotificationSettings />} />
                          <Route path="pharmacy" element={<PharmacySettings />} />
                          <Route path="billing" element={<BillingSettings />} />
                          <Route path="security" element={<SecuritySettings />} />
                          <Route path="backup" element={<BackupSettings />} />
                          <Route path="audit" element={<AuditLogSettings />} />
                          <Route path="integration" element={<IntegrationSettings />} />
                          <Route path="ai" element={<AISettings />} />
                          <Route path="language" element={<LanguageSettings />} />
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
              </CDSSProvider>
            </AISettingsProvider>
          </NotificationProvider>
        </UserProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
