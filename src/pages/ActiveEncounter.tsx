import { useState } from "react";
import { User, Activity, FlaskConical, Pill, Stethoscope, AlertCircle, FileText, ChevronRight, Search } from "lucide-react";
import { ClinicalIntelligencePanel } from "@/components/ClinicalIntelligencePanel";
import { usePatient } from "@/lib/PatientContext";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export function ActiveEncounter() {
  const { selectedPatient, patients, setSelectedPatient } = usePatient();
  const [activeTab, setActiveTab] = useState('summary');

  // Need to fetch patient-specific data efficiently here.
  // Using LiveQuery to fetch subsets for this patientId
  const patientId = selectedPatient?.id || "";
  
  const vitals = useLiveQuery(
    () => db.vitals.where('patientId').equals(patientId).reverse().limit(5).toArray(),
    [patientId]
  ) || [];

  const diagnosis = useLiveQuery(
    () => db.diagnoses.where('patientId').equals(patientId).reverse().limit(3).toArray(),
    [patientId]
  ) || [];
  
  const recentLabs = useLiveQuery(
    () => db.lab_results.where('patientId').equals(patientId).reverse().limit(5).toArray(),
    [patientId]
  ) || [];

  return (
    <div className="space-y-6 h-full p-6 bg-slate-50 dark:bg-slate-950">
      <div className="flex justify-between items-start">
        <div>
          {selectedPatient ? (
            <>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedPatient.name}</h2>
              <p className="text-slate-500 dark:text-slate-400">MRN: {selectedPatient.mrn} • Age: {selectedPatient.age} • Blood Type: {selectedPatient.bloodType}</p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Active Encounter</h2>
              <p className="text-slate-500 dark:text-slate-400">Select a patient to begin</p>
            </>
          )}
        </div>
        <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <select 
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white dark:bg-slate-800 appearance-none min-w-[200px]"
                onChange={(e) => {
                  const patient = patients.find(p => p.id === e.target.value);
                  if (patient) setSelectedPatient(patient);
                }}
                value={selectedPatient?.id || ""}
              >
                <option value="" disabled>Select patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>)}
              </select>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700" disabled={!selectedPatient}>New Note</button>
            <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white dark:bg-slate-800" disabled={!selectedPatient}>Finalize</button>
        </div>
      </div>

      {!selectedPatient ? (
        <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
           Please select a patient from the dropdown above to start an encounter.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Vitals grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-lg">Active Vitals</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vitals[0] && (
                 <>
                  <VitalCard label="BP" value={`${vitals[0].bp_systolic}/${vitals[0].bp_diastolic}`} unit="mmHg" />
                  <VitalCard label="HR" value={`${vitals[0].hr}`} unit="bpm" />
                  <VitalCard label="SpO2" value={`${vitals[0].spo2}%`} unit="" />
                  <VitalCard label="Temp" value={`${vitals[0].temp}°C`} unit="" />
                 </>
              )}
            </div>
          </div>
          
          <div className="card-panel p-6">
            <h3 className="font-bold text-lg mb-4">Clinical Timeline</h3>
             <div className="space-y-4">
                {diagnosis.map(d => (
                  <div key={d.id} className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                     <AlertCircle className="w-5 h-5 text-amber-500 shrink-0"/>
                     <div>
                       <p className="font-medium">{d.condition}</p>
                       <p className="text-xs text-slate-500">{new Date(d.date).toLocaleDateString()}</p>
                     </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Labs / Meds */}
         <div className="space-y-6">
            <div className="card-panel p-6">
               <div className="flex items-center gap-2 mb-4">
                  <FlaskConical className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-lg">Recent Labs</h3>
               </div>
               <ul className="space-y-3">
                  {recentLabs.map(l => (
                    <li key={l.id} className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">{l.testName}</span>
                      <span className="font-mono font-medium">{l.value} {l.unit}</span>
                    </li>
                  ))}
               </ul>
            </div>
            
             <div className="card-panel p-6">
               <div className="flex items-center gap-2 mb-4">
                  <Pill className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-lg">Active Medications</h3>
               </div>
               {Array.isArray(selectedPatient?.medications) && selectedPatient.medications.map((m: any, i:number) => {
                 const label = typeof m === 'string' ? m : `${m.name || 'Unknown'} ${m.dosage ? '- ' + m.dosage : ''} ${m.frequency || ''}`.trim();
                 return <div key={i} className="text-sm p-2 bg-purple-50 dark:bg-purple-900/10 rounded mb-2">{label}</div>
               })}
            </div>
            <ClinicalIntelligencePanel patient={selectedPatient} latestVitals={vitals[0]} />
         </div>
      </div>
      )}
    </div>
  );
}

function VitalCard({label, value, unit}: {label: string, value: string, unit: string}) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-800">
      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono">{value} <span className="text-sm font-normal text-slate-500">{unit}</span></p>
    </div>
  )
}
