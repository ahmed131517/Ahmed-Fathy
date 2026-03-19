import { useState } from "react";
import { db } from "@/lib/db";
import { usePatient } from "@/lib/PatientContext";
import { toast } from "sonner";
import { Save, Activity, Thermometer, Droplets, Scale, Heart } from "lucide-react";

export function MobileVitals() {
  const { selectedPatient } = usePatient();
  const [vitals, setVitals] = useState({
    bp_systolic: "",
    bp_diastolic: "",
    hr: "",
    temp: "",
    spo2: "",
    weight: ""
  });

  const handleSubmit = async () => {
    if (!selectedPatient) return;
    try {
      await db.vitals.add({
        patientId: selectedPatient.id,
        date: new Date().toISOString(),
        bp_systolic: Number(vitals.bp_systolic),
        bp_diastolic: Number(vitals.bp_diastolic),
        hr: Number(vitals.hr),
        temp: Number(vitals.temp),
        spo2: Number(vitals.spo2),
        weight: Number(vitals.weight),
        lastModified: Date.now(),
        isDeleted: 0,
        isSynced: 0
      });
      toast.success("Vitals saved successfully");
      setVitals({ bp_systolic: "", bp_diastolic: "", hr: "", temp: "", spo2: "", weight: "" });
    } catch (error) {
      toast.error("Failed to save vitals");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Quick Vitals Entry</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500">BP Systolic</label>
          <input type="number" value={vitals.bp_systolic} onChange={e => setVitals({...vitals, bp_systolic: e.target.value})} className="w-full p-2 border rounded-lg" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500">BP Diastolic</label>
          <input type="number" value={vitals.bp_diastolic} onChange={e => setVitals({...vitals, bp_diastolic: e.target.value})} className="w-full p-2 border rounded-lg" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500">Heart Rate</label>
          <input type="number" value={vitals.hr} onChange={e => setVitals({...vitals, hr: e.target.value})} className="w-full p-2 border rounded-lg" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500">Temperature</label>
          <input type="number" value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} className="w-full p-2 border rounded-lg" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500">SpO2</label>
          <input type="number" value={vitals.spo2} onChange={e => setVitals({...vitals, spo2: e.target.value})} className="w-full p-2 border rounded-lg" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500">Weight</label>
          <input type="number" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} className="w-full p-2 border rounded-lg" />
        </div>
      </div>
      <button onClick={handleSubmit} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Vitals
      </button>
    </div>
  );
}
