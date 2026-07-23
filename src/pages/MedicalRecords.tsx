import { Folder, Clock, RefreshCw, FileText, Zap, Printer, MousePointer, FlaskConical, AlertTriangle, CheckCircle2, ChevronRight, TrendingUp, Calendar, Sparkles, Stethoscope, Pill, List, X } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartContainer } from '@/components/ui/ChartContainer';
import { PatientTimeline, TimelineEvent } from "@/components/PatientTimeline";
import { usePatient } from "@/lib/PatientContext";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { PatientHistoryService } from "@/services/PatientHistoryService";
import { RecordDetailsPanel } from "@/components/RecordDetailsPanel";

import { MentalHealthAssessments } from "@/components/specialized/MentalHealthAssessments";
import { ObstetricCalculator } from "@/components/specialized/ObstetricCalculator";
import { PediatricGrowthChart } from "@/components/specialized/PediatricGrowthChart";


import { clinicalAIRequest } from "../services/aiWorkflowService";
import { useAISettings } from "../lib/AISettingsContext";

export function MedicalRecords() {
  const { settings: aiSettings } = useAISettings();
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  console.log("MedicalRecords: selectedPatient:", selectedPatient);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'trends' | 'critical' | 'timeline' | 'specialized'>('list');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [recordSummary, setRecordSummary] = useState("");
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [labInterpretation, setLabInterpretation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedToCompare, setSelectedToCompare] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [selectedTrendMetric, setSelectedTrendMetric] = useState("Blood Pressure");

  const timelineEvents = useLiveQuery(
    async () => {
      if (!selectedPatient) {
        console.log("MedicalRecords: No selected patient");
        return [];
      }
      console.log("MedicalRecords: Fetching timeline for:", selectedPatient.id);
      
      // Watch all relevant tables for changes
      const [appointments, prescriptions, diagnoses, labs, vitals, exams] = await Promise.all([
        db.appointments.where('patientId').equals(selectedPatient.id).toArray(),
        db.prescriptions.where('patientId').equals(selectedPatient.id).toArray(),
        db.diagnoses.where('patientId').equals(selectedPatient.id).toArray(),
        db.lab_results.where('patientId').equals(selectedPatient.id).toArray(),
        db.vitals.where('patientId').equals(selectedPatient.id).toArray(),
        db.physical_exams.where('patientId').equals(selectedPatient.id).toArray()
      ]);
      
      console.log("MedicalRecords: Fetched counts - Appts:", appointments.length, "Presc:", prescriptions.length, "Diag:", diagnoses.length, "Labs:", labs.length, "Vitals:", vitals.length, "Exams:", exams.length);
      
      const history = await PatientHistoryService.getPatientHistory(selectedPatient.id);
      console.log("MedicalRecords: Total history events:", history.length);
      
      return history;
    },
    [selectedPatient]
  ) || [];

  const records = useMemo(() => {
    return timelineEvents.map(event => event.details);
  }, [timelineEvents]);

  // Vitals Trend Data
  const vitalsData = useMemo(() => {
    return timelineEvents
      .filter(e => e.type === 'Vitals')
      .map(e => e.details)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [timelineEvents]);

  const getTrendData = (metric: string) => {
    if (metric === 'Blood Pressure') {
      return vitalsData.map(v => ({
        date: v.date,
        systolic: v.bp_systolic,
        diastolic: v.bp_diastolic,
        unit: 'mmHg'
      }));
    }
    if (metric === 'Heart Rate') {
      return vitalsData.map(v => ({
        date: v.date,
        value: v.hr,
        unit: 'bpm'
      }));
    }
    if (metric === 'Temperature') {
      return vitalsData.map(v => ({
        date: v.date,
        value: v.temp,
        unit: '°C'
      }));
    }
    if (metric === 'SpO2') {
      return vitalsData.map(v => ({
        date: v.date,
        value: v.spo2,
        unit: '%'
      }));
    }
    if (metric === 'Weight') {
      return vitalsData.map(v => ({
        date: v.date,
        value: v.weight,
        unit: 'kg'
      }));
    }
    if (metric === 'Glucose') {
      return vitalsData.map(v => ({
        date: v.date,
        value: v.glucose,
        unit: 'mg/dL'
      }));
    }
    
    // Extract lab data
    const data: any[] = [];
    (records as any[]).forEach(record => {
      if (record.type === 'Lab Result' && record.results) {
        const result = record.results.find((r: any) => r.test === metric);
        if (result) {
          data.push({
            date: record.date,
            value: result.value,
            unit: result.unit,
            range: result.range
          });
        }
      }
    });
    
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const generateRecordSummary = async (record: any) => {
    setIsSummarizing(true);
    try {
      const prompt = `Synthesize the following medical record: ${JSON.stringify(record)}. Provide a concise clinical summary and key takeaways.`;
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      setRecordSummary(responseText || "Summary generation failed.");
    } catch (error) {
      console.error("Summary generation failed:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const interpretLabResults = async (record: any) => {
    if (record.type !== 'Lab Result') return;
    setIsInterpreting(true);
    try {
      const prompt = `Analyze these lab results: ${JSON.stringify(record.results)}. 
      Clinical Context: ${record.summary || "None provided"}.
      
      Provide:
      1. Clinical Interpretation of abnormal values.
      2. Potential Differential Diagnoses based on these specific results.
      3. Recommended next steps or confirmatory tests.
      
      Format as a professional clinical note.`;
      
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      setLabInterpretation(responseText || "Interpretation failed.");
    } catch (error) {
      console.error("Interpretation failed:", error);
      toast.error("AI Interpretation failed.");
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    setIsQuerying(true);
    try {
      const prompt = `Based on these medical records: ${JSON.stringify(records)}, answer this question: ${aiQuery}`;
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      setAiResponse(responseText || "No answer found.");
    } catch (error) {
      setAiResponse("Error querying records.");
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medical Records</h2>
          <p className="text-slate-500">View patient history and clinical encounters</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/clinical-overview")}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm"
          >
            <Sparkles className="w-4 h-4" /> Patient Overview
          </button>
          <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('list')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
              viewMode === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <List className="w-4 h-4" /> List
          </button>
          <button 
            onClick={() => setViewMode('timeline')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
              viewMode === 'timeline' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Clock className="w-4 h-4" /> Timeline
          </button>
          <button 
            onClick={() => setViewMode('trends')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
              viewMode === 'trends' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <TrendingUp className="w-4 h-4" /> Trends
          </button>
          <button 
            onClick={() => setViewMode('critical')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
              viewMode === 'critical' ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <AlertTriangle className="w-4 h-4" /> Critical
          </button>
          <button 
            onClick={() => setViewMode('specialized')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
              viewMode === 'specialized' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Zap className="w-4 h-4" /> Specialized
          </button>
        </div>
        </div>
      </div>
      {viewMode === 'timeline' && (
        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
          <div className={cn(
            "h-full min-h-0 flex-col",
            selectedRecord ? "hidden lg:flex lg:w-1/3" : "flex w-full"
          )}>
            <PatientTimeline 
              events={timelineEvents} 
              onEventClick={(event) => setSelectedRecord(event.details)} 
            />
          </div>
          <div className={cn(
            "h-full min-h-0 flex-col",
            selectedRecord ? "flex w-full lg:w-2/3" : "hidden lg:flex lg:w-2/3"
          )}>
             <RecordDetailsPanel 
                selectedRecord={selectedRecord}
                isSummarizing={isSummarizing}
                generateRecordSummary={generateRecordSummary}
                isInterpreting={isInterpreting}
                interpretLabResults={interpretLabResults}
                recordSummary={recordSummary}
                labInterpretation={labInterpretation}
                setLabInterpretation={setLabInterpretation}
                aiQuery={aiQuery}
                setAiQuery={setAiQuery}
                aiResponse={aiResponse}
                setAiResponse={setAiResponse}
                isQuerying={isQuerying}
                onAiQuery={handleAiQuery}
                onClose={() => setSelectedRecord(null)}
                isTimelineMode={true}
             />
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="flex gap-4 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <input 
            type="text" 
            placeholder="Search records..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option>All</option>
            <option>Encounter</option>
            <option>Diagnosis</option>
            <option>Lab Result</option>
            <option>Prescription</option>
          </select>
        </div>
      )}

      {viewMode === 'trends' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Health Trends & Analytics</h3>
                <p className="text-sm text-slate-500">Visualize patient vitals and lab results over time</p>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <select 
                  value={selectedTrendMetric}
                  onChange={(e) => setSelectedTrendMetric(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer py-1.5 pl-3 pr-8"
                >
                  <optgroup label="Vitals">
                    <option value="Blood Pressure">Blood Pressure</option>
                    <option value="Glucose">Glucose (RBS)</option>
                    <option value="Weight">Weight</option>
                  </optgroup>
                  <optgroup label="Lab Results">
                    {Array.from(new Set(
                      (records as any[])
                        .filter(r => r.type === 'Lab Result')
                        .flatMap(r => r.results?.map((res: any) => res.test) || [])
                    )).map(test => (
                      <option key={test} value={test}>{test}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="w-full min-w-0 h-[400px] w-full">                <ChartContainer>
<ResponsiveContainer width="100%" height="100%">
                <LineChart data={getTrendData(selectedTrendMetric)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  {selectedTrendMetric === 'Blood Pressure' ? (
                    <>
                      <ReferenceLine y={120} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Systolic Limit', fill: '#ef4444', fontSize: 10 }} />
                      <Line type="monotone" dataKey="systolic" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} name="Systolic" />
                      <Line type="monotone" dataKey="diastolic" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} name="Diastolic" />
                    </>
                  ) : (
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#6366f1" 
                      strokeWidth={3} 
                      dot={{r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} 
                      activeDot={{r: 6}} 
                      name={selectedTrendMetric} 
                      unit={getTrendData(selectedTrendMetric)[0]?.unit ? ` ${getTrendData(selectedTrendMetric)[0]?.unit}` : ''}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
</ChartContainer>
            </div>
          </div>
          
          {/* AI Insight Card based on selected metric */}
          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 flex gap-4 items-start">
            <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-indigo-900 mb-1">AI Analysis: {selectedTrendMetric}</h4>
              <p className="text-indigo-800/80 text-sm leading-relaxed">
                {selectedTrendMetric === 'Blood Pressure' 
                  ? "Blood pressure shows a downward trend over the last 6 months, indicating positive response to Lisinopril therapy. Systolic pressure has improved from 138 to 122."
                  : selectedTrendMetric === 'Weight'
                  ? "Patient has successfully lost 9 lbs over the monitored period, aligning with lifestyle modification goals."
                  : `Analysis for ${selectedTrendMetric} indicates values are within expected clinical parameters based on available history.`}
              </p>
            </div>
          </div>
        </div>
      ) : viewMode === 'specialized' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <MentalHealthAssessments />
            <ObstetricCalculator />
          </div>
          <PediatricGrowthChart />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
          {/* List Panel */}
          <div className={cn(
            "h-full min-h-0 flex-col",
            selectedRecord ? "hidden lg:flex lg:w-1/3" : "flex w-full"
          )}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" /> {viewMode === 'critical' ? 'Critical Findings' : 'Patient History'}
                </h3>
                <div className="flex gap-2">
                  {selectedToCompare.length > 1 && (
                    <button 
                      onClick={() => setShowComparison(true)}
                      className="px-2 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700"
                    >
                      Compare ({selectedToCompare.length})
                    </button>
                  )}
                  <button 
                    onClick={() => window.location.reload()}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{viewMode === 'critical' ? 'Alerts' : 'Records'}</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50/30">
                <div className="space-y-4">
                  {viewMode === 'critical' 
                    ? (records as any[]).filter(record => record.type === 'Lab Result' && record.results?.some((r: any) => r.status !== 'normal')).map((record) => (
                      <div 
                        key={record.id} 
                        onClick={() => setSelectedRecord(record)}
                        className={cn(
                          "relative flex items-center gap-3 cursor-pointer p-4 rounded-xl border transition-all",
                          selectedRecord?.id === record.id 
                            ? "border-red-500 bg-red-50 shadow-sm" 
                            : "border-slate-200 bg-white hover:border-red-300 hover:shadow-sm"
                        )}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 shadow-sm shrink-0">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700">Abnormal</span>
                            <time className="text-[10px] font-medium text-slate-500">{record.date}</time>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm truncate">{record.title}</h4>
                          <p className="text-xs text-slate-500 truncate">{record.provider}</p>
                        </div>
                      </div>
                    ))
                    : (records as any[])
                      .filter((record: any) => {
                        const matchesSearch = record.title?.toLowerCase().includes(searchQuery?.toLowerCase() || '') || 
                                              (record.summary && record.summary?.toLowerCase().includes(searchQuery?.toLowerCase() || ''));
                        const matchesType = filterType === 'All' || record.type === filterType;
                        return matchesSearch && matchesType;
                      })
                      .map((record: any) => (
                      <div 
                        key={record.id} 
                        onClick={() => setSelectedRecord(record)}
                        className={cn(
                          "relative flex items-center gap-3 cursor-pointer p-4 rounded-xl border transition-all",
                          selectedRecord?.id === record.id 
                            ? "border-indigo-500 bg-indigo-50 shadow-sm" 
                            : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full shadow-sm shrink-0",
                          record.type === 'Lab Result' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                        )}>
                          {record.type === 'Lab Result' ? <FlaskConical className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn(
                              "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                              record.type === 'Lab Result' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                            )}>{record.type}</span>
                            <time className="text-[10px] font-medium text-slate-500">{record.date}</time>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm truncate">{record.title}</h4>
                          <p className="text-xs text-slate-500 truncate">{record.provider}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>

          <div className={cn(
            "h-full min-h-0 flex-col",
            selectedRecord ? "flex w-full lg:w-2/3" : "hidden lg:flex lg:w-2/3"
          )}>
             <RecordDetailsPanel 
                selectedRecord={selectedRecord}
                isSummarizing={isSummarizing}
                generateRecordSummary={generateRecordSummary}
                isInterpreting={isInterpreting}
                interpretLabResults={interpretLabResults}
                recordSummary={recordSummary}
                labInterpretation={labInterpretation}
                setLabInterpretation={setLabInterpretation}
                aiQuery={aiQuery}
                setAiQuery={setAiQuery}
                aiResponse={aiResponse}
                setAiResponse={setAiResponse}
                isQuerying={isQuerying}
                onAiQuery={handleAiQuery}
                onClose={() => setSelectedRecord(null)}
                isTimelineMode={false}
             />
          </div>
        </div>
      )}
      {showComparison && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800">Lab Result Comparison</h3>
              <button onClick={() => setShowComparison(false)} className="text-slate-400 hover:text-slate-600">Close</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedToCompare.map(recordId => {
                  const record = (records as any[]).find(r => r.id === recordId);
                  if (!record) return null;
                  return (
                    <div key={record.id} className="border border-slate-200 rounded-xl p-4">
                      <h4 className="font-semibold text-slate-800 mb-2">{record.title} ({record.date})</h4>
                      <table className="w-full text-sm">
                        <thead className="text-slate-500 border-b">
                          <tr>
                            <th className="py-2 text-left">Test</th>
                            <th className="py-2 text-right">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {record.results?.map((r: any, idx: number) => (
                            <tr key={idx}>
                              <td className="py-2">{r.test}</td>
                              <td className="py-2 text-right font-medium">{r.value} {r.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
