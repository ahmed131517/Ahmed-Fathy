import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { usePatient } from "@/lib/PatientContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, TrendingUp, Droplets, Scale, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateContentWithRetry } from "@/utils/gemini";

export function VitalsTrendingWidget() {
  const { selectedPatient } = usePatient();
  const [selectedMetric, setSelectedMetric] = useState<'BP' | 'Glucose' | 'Weight'>('BP');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const vitals = useLiveQuery(
    () => selectedPatient ? db.vitals.where('patientId').equals(selectedPatient.id).toArray() : [],
    [selectedPatient]
  ) || [];

  const trendData = useMemo(() => {
    return vitals
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(v => ({
        date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        systolic: v.bp_systolic,
        diastolic: v.bp_diastolic,
        glucose: v.glucose,
        weight: v.weight,
        fullDate: v.date
      }));
  }, [vitals]);

  const generateInsight = async () => {
    if (!selectedPatient || trendData.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const prompt = `Analyze the following vitals trend for patient ${selectedPatient.name}:
      Metric: ${selectedMetric}
      Data: ${JSON.stringify(trendData)}
      
      Provide a concise clinical insight (max 2 sentences) about the trend and any potential risks or improvements.`;
      
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setAiInsight(response.text || "No insight available.");
    } catch (error) {
      console.error("AI Insight failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!selectedPatient) {
    return (
      <div className="card-panel p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
        <Activity className="w-12 h-12 text-slate-200 mb-3" />
        <h3 className="text-slate-900 dark:text-white font-bold">Vitals Trending</h3>
        <p className="text-sm text-slate-500 max-w-[200px] mt-1">Select a patient to view clinical trends and AI insights.</p>
      </div>
    );
  }

  return (
    <div className="card-panel p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">Vitals Trending</h3>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => { setSelectedMetric('BP'); setAiInsight(null); }}
            className={cn("px-2 py-1 text-[10px] font-bold rounded-md transition-all", selectedMetric === 'BP' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500")}
          >
            BP
          </button>
          <button 
            onClick={() => { setSelectedMetric('Glucose'); setAiInsight(null); }}
            className={cn("px-2 py-1 text-[10px] font-bold rounded-md transition-all", selectedMetric === 'Glucose' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500")}
          >
            GLU
          </button>
          <button 
            onClick={() => { setSelectedMetric('Weight'); setAiInsight(null); }}
            className={cn("px-2 py-1 text-[10px] font-bold rounded-md transition-all", selectedMetric === 'Weight' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500")}
          >
            WT
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px'}}
              />
              {selectedMetric === 'BP' ? (
                <>
                  <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="systolic" stroke="#6366f1" strokeWidth={2} dot={{r: 3}} name="Systolic" />
                  <Line type="monotone" dataKey="diastolic" stroke="#10b981" strokeWidth={2} dot={{r: 3}} name="Diastolic" />
                </>
              ) : selectedMetric === 'Glucose' ? (
                <>
                  <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="glucose" stroke="#f59e0b" strokeWidth={2} dot={{r: 3}} name="Glucose (mg/dL)" />
                </>
              ) : (
                <Line type="monotone" dataKey="weight" stroke="#ec4899" strokeWidth={2} dot={{r: 3}} name="Weight (kg)" />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
            <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs">No vitals data recorded yet.</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        {aiInsight ? (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">AI Clinical Insight</span>
            </div>
            <p className="text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed">{aiInsight}</p>
          </div>
        ) : (
          <button 
            onClick={generateInsight}
            disabled={isAnalyzing || trendData.length === 0}
            className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-400 hover:text-indigo-600 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <Activity className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isAnalyzing ? "Analyzing Trends..." : "Generate AI Insight"}
          </button>
        )}
      </div>
    </div>
  );
}
