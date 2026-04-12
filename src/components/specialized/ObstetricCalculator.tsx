import { useState, useMemo } from "react";
import { db } from "@/lib/db";
import { usePatient } from "@/lib/PatientContext";
import { toast } from "sonner";
import { Calendar, Baby, Clock, Info, Save, History, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";

export function ObstetricCalculator() {
  const { selectedPatient } = usePatient();
  const [lmp, setLmp] = useState("");
  const [ultrasoundDate, setUltrasoundDate] = useState("");
  const [ultrasoundWeeks, setUltrasoundWeeks] = useState("");
  const [ultrasoundDays, setUltrasoundDays] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const history = useLiveQuery(
    () => selectedPatient ? db.obstetric_records.where('patientId').equals(selectedPatient.id).reverse().toArray() : [],
    [selectedPatient]
  ) || [];

  const calculations = useMemo(() => {
    if (!lmp && (!ultrasoundDate || !ultrasoundWeeks)) return null;

    let edd: Date;
    let gaWeeks: number;
    let gaDays: number;

    if (lmp) {
      const lmpDate = new Date(lmp);
      edd = new Date(lmpDate);
      edd.setDate(edd.getDate() + 280); // Naegele's rule approximation (LMP + 9 months + 7 days)
      
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      gaWeeks = Math.floor(diffDays / 7);
      gaDays = diffDays % 7;
    } else {
      const usDate = new Date(ultrasoundDate);
      const today = new Date();
      const usWeeks = parseInt(ultrasoundWeeks) || 0;
      const usDays = parseInt(ultrasoundDays) || 0;
      
      const totalDaysAtUS = (usWeeks * 7) + usDays;
      const daysSinceUS = Math.ceil(Math.abs(today.getTime() - usDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalDaysNow = totalDaysAtUS + daysSinceUS;
      
      gaWeeks = Math.floor(totalDaysNow / 7);
      gaDays = totalDaysNow % 7;
      
      edd = new Date(usDate);
      edd.setDate(edd.getDate() + (280 - totalDaysAtUS));
    }

    const milestones = [
      { label: "First Trimester Ends", date: new Date(edd.getTime() - (27 * 7 * 24 * 60 * 60 * 1000)) },
      { label: "Anatomy Scan (20w)", date: new Date(edd.getTime() - (20 * 7 * 24 * 60 * 60 * 1000)) },
      { label: "Viability (24w)", date: new Date(edd.getTime() - (16 * 7 * 24 * 60 * 60 * 1000)) },
      { label: "Third Trimester Starts", date: new Date(edd.getTime() - (12 * 7 * 24 * 60 * 60 * 1000)) },
      { label: "Full Term (37w)", date: new Date(edd.getTime() - (3 * 7 * 24 * 60 * 60 * 1000)) },
    ];

    return { edd, gaWeeks, gaDays, milestones };
  }, [lmp, ultrasoundDate, ultrasoundWeeks, ultrasoundDays]);

  const handleSubmit = async () => {
    if (!selectedPatient || !calculations) return;

    setIsSubmitting(true);
    try {
      await db.obstetric_records.add({
        id: crypto.randomUUID(),
        patientId: selectedPatient.id,
        lmp: lmp || undefined,
        ultrasoundDate: ultrasoundDate || undefined,
        edd: calculations.edd.toISOString(),
        gestationalAge: `${calculations.gaWeeks}w ${calculations.gaDays}d`,
        milestones: calculations.milestones as any,
        date: new Date().toISOString(),
        lastModified: Date.now(),
        isDeleted: 0
      });
      toast.success("Obstetric record saved.");
      setShowHistory(true);
    } catch (error) {
      toast.error("Failed to save record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPatient) return null;
  if (selectedPatient.gender?.toLowerCase() !== 'female') {
    return (
      <div className="card-panel p-6 flex flex-col items-center justify-center text-center opacity-50 grayscale">
        <Baby className="w-12 h-12 text-slate-200 mb-3" />
        <h3 className="text-slate-900 dark:text-white font-bold">Obstetric Calculator</h3>
        <p className="text-xs text-slate-500 mt-1">This tool is only available for female patients.</p>
      </div>
    );
  }

  return (
    <div className="card-panel p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Baby className="w-5 h-5 text-pink-500" />
          <h3 className="font-bold text-slate-900 dark:text-white">Obstetric Calculator</h3>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1"
        >
          {showHistory ? <Plus className="w-3 h-3" /> : <History className="w-3 h-3" />}
          {showHistory ? "New Calculation" : "View History"}
        </button>
      </div>

      {showHistory ? (
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm italic">No obstetric history found.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">EDD: {new Date(item.edd!).toLocaleDateString()}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Gestational Age</p>
                    <p className="text-sm font-mono font-bold text-indigo-600">{item.gestationalAge}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Method</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.lmp ? "LMP" : "Ultrasound"}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Method 1: By LMP</h4>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Last Menstrual Period</label>
                  <input 
                    type="date" 
                    value={lmp}
                    onChange={(e) => { setLmp(e.target.value); setUltrasoundDate(""); }}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Method 2: By Ultrasound</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Ultrasound Date</label>
                    <input 
                      type="date" 
                      value={ultrasoundDate}
                      onChange={(e) => { setUltrasoundDate(e.target.value); setLmp(""); }}
                      className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-pink-500/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Weeks</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={ultrasoundWeeks}
                        onChange={(e) => { setUltrasoundWeeks(e.target.value); setLmp(""); }}
                        className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-pink-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Days</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={ultrasoundDays}
                        onChange={(e) => { setUltrasoundDays(e.target.value); setLmp(""); }}
                        className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-pink-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {calculations ? (
                <div className="bg-pink-50 dark:bg-pink-900/10 p-6 rounded-2xl border border-pink-100 dark:border-pink-900/30 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                  <Baby className="w-10 h-10 text-pink-500 mb-2" />
                  <p className="text-[10px] text-pink-600 dark:text-pink-400 uppercase font-bold tracking-widest">Estimated Delivery Date</p>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{calculations.edd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h2>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-pink-100 dark:border-pink-900/30 shadow-sm">
                      <span className="text-xs font-bold text-pink-700 dark:text-pink-300">{calculations.gaWeeks}w {calculations.gaDays}d</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Gestational Age</span>
                  </div>
                </div>
              ) : (
                <div className="h-full border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Info className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs">Enter LMP or Ultrasound data to calculate EDD and GA.</p>
                </div>
              )}

              {calculations && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Upcoming Milestones</h4>
                  <div className="space-y-2">
                    {calculations.milestones.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{m.label}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">{m.date.toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !calculations}
              className="px-6 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-bold hover:bg-pink-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
