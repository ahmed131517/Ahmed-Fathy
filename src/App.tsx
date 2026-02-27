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

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="*" element={<div className="p-6 text-slate-500">Page under construction</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
