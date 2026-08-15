import { Tasks } from "./pages/Tasks";
import { MobileVitals } from "./pages/MobileVitals";
import { LoginScreen } from "./components/LoginScreen";
import { useUser } from "./lib/UserContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Appointments } from "./pages/Appointments";
import { NewPatient } from "./pages/NewPatient";
import { ActiveEncounter } from "./pages/ActiveEncounter";
import { SymptomAnalysis } from "./pages/SymptomAnalysis";
import { PhysicalExam } from "./pages/PhysicalExam";
import { LabRequests } from "./pages/LabRequests";
import { FinalDiagnosis } from "./pages/FinalDiagnosis";
import { Prescriptions } from "./pages/Prescriptions";
import { ClinicalIntelligenceHub } from "./pages/ClinicalIntelligenceHub";
import { ClinicalAudit } from "./pages/ClinicalAudit";
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
import { DatabaseManagerSettings } from "./pages/settings/DatabaseManagerSettings";
import { WorkspacesSettings } from "./pages/settings/WorkspacesSettings";
import { AdminSettings } from "./pages/AdminSettings";
import { UserManagement } from "./pages/UserManagement";
import { Notifications } from "./pages/Notifications";
import { StaffCommunication } from "./pages/StaffCommunication";
import { EncounterNote } from "./pages/EncounterNote";
import { ClinicalOverview } from "./pages/ClinicalOverview";
import { PatientReport } from "./pages/PatientReport";
import { SOAPNotePage } from "./pages/SOAPNotePage";
import { PatientProvider } from "./lib/PatientContext";
import { SymptomProvider } from "./lib/SymptomContext";
import { AuditDashboard } from "./pages/AuditDashboard";
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
import { useEffect, useState, useRef } from "react";
import { startSyncEngine, syncAll } from "./lib/sync";
import { checkAndPerformAutoBackup } from "./services/backupService";
import { checkAndSendAppointmentReminders } from "./services/notificationService";
import { startCleanupEngine } from "./services/cleanupService";
import { useSettings } from "./lib/SettingsContext";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";

// TODO(@audit): Refactor these into separate files in /src/components/system/
function StorageGuard() { return null; }
function BackupInitializer() { return null; }
function SyncStatus() { return null; }

function AppContent() {
  const { firebaseUser, loadingAuth } = useUser();

  useEffect(() => {
    if (firebaseUser) {
      const stopSync = startSyncEngine();
      const stopCleanup = startCleanupEngine();
      return () => {
        stopSync();
        stopCleanup();
      };
    }
  }, [firebaseUser]);

  if (loadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 border-4 border-indigo-500/30 rounded-full animate-ping"></div>
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-2xl shadow-xl flex items-center justify-center font-bold text-2xl z-10">
            H
          </div>
        </div>
        <p className="mt-6 text-xs font-bold tracking-widest text-[#2c3e50] dark:text-slate-400 animate-pulse uppercase">
          VERIFYING CLINICAL CREDENTIALS...
        </p>
      </div>
    );
  }

  if (!firebaseUser) {
    return <LoginScreen />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <SyncStatus />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="new-patient" element={<NewPatient />} />
          <Route path="patients/new" element={<Navigate to="/new-patient" replace />} />
          <Route path="symptom-analysis" element={<SymptomAnalysis />} />
          <Route path="active-encounter" element={<ActiveEncounter />} />
          <Route path="physical-exam" element={<PhysicalExam />} />
          <Route path="lab-requests" element={<LabRequests />} />
          <Route path="labs" element={<Navigate to="/lab-requests" replace />} />
          <Route path="final-diagnosis" element={<FinalDiagnosis />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="clinical-hub" element={<ClinicalIntelligenceHub />} />
          <Route path="clinical-audit" element={<ClinicalAudit />} />
          <Route path="pharmacies" element={<Pharmacies />} />
          <Route path="medical-records" element={<MedicalRecords />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="ask-ai" element={<AskAI />} />
          <Route path="mobile-vitals" element={<MobileVitals />} />
          <Route path="profile" element={<Profile />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="staff-communication" element={<StaffCommunication />} />
          <Route path="encounter-note" element={<EncounterNote />} />
          <Route path="clinical-overview" element={<ClinicalOverview />} />
          <Route path="patient-report" element={<PatientReport />} />
          <Route path="soap-editor" element={<SOAPNotePage />} />
          <Route path="audit-dashboard" element={<AuditDashboard />} />
          <Route path="users" element={<UserManagement />} />
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
          <Route path="database" element={<DatabaseManagerSettings />} />
          <Route path="language" element={<LanguageSettings />} />
          <Route path="workspaces" element={<WorkspacesSettings />} />
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
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="app-theme">
      <SettingsProvider>
        <StorageGuard />
        <BackupInitializer />
        <UserProvider>
          <NotificationProvider>
            <AISettingsProvider>
              <CDSSProvider>
                <PatientProvider>
                  <SymptomProvider>
                    <AppContent />
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
