import { Folder, Clock, RefreshCw, FileText, Zap, Printer, MousePointer, FlaskConical, AlertTriangle, CheckCircle2, ChevronRight, TrendingUp, Calendar, Sparkles, Stethoscope, Pill, List } from "lucide-react";
import { useState, useMemo } from "react";
import { GoogleGenAI } from "@google/genai";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PatientTimeline, TimelineEvent } from "@/components/PatientTimeline";
import { usePatient } from "@/lib/PatientContext";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { PatientHistoryService } from "@/services/PatientHistoryService";


export function MedicalRecords() {
  const { selectedPatient } = usePatient();
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'trends' | 'critical' | 'timeline'>('list');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [recordSummary, setRecordSummary] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedToCompare, setSelectedToCompare] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [selectedTrendMetric, setSelectedTrendMetric] = useState("Blood Pressure");
  const [showPatientSummary, setShowPatientSummary] = useState(false);
  const [patientSummary, setPatientSummary] = useState("");
  const [isGeneratingPatientSummary, setIsGeneratingPatientSummary] = useState(false);

  const timelineEvents = useLiveQuery(
    async () => {
      if (!selectedPatient) return [];
      // Watch all relevant tables for changes
      await db.appointments.where('patientId').equals(selectedPatient.id).toArray();
      await db.prescriptions.where('patientId').equals(selectedPatient.id).toArray();
      await db.diagnoses.where('patientId').equals(selectedPatient.id).toArray();
      await db.lab_results.where('patientId').equals(selectedPatient.id).toArray();
      await db.vitals.where('patientId').equals(selectedPatient.id).toArray();
      await db.physical_exams.where('patientId').equals(selectedPatient.id).toArray();
      
      return await PatientHistoryService.getPatientHistory(selectedPatient.id);
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

  const generatePatientSummary = async () => {
    setShowPatientSummary(true);
    if (patientSummary) return; // Don't regenerate if already exists
    
    setIsGeneratingPatientSummary(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const prompt = `Analyze the complete medical history of this patient: ${JSON.stringify(records)}. 
      Provide a comprehensive clinical summary including:
      1. Key Diagnoses
      2. Chronic Conditions
      3. Recent Trends
      4. Outstanding Items/Risks
      
      Format the response with clear headings and bullet points.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setPatientSummary(response.text || "Failed to generate summary.");
    } catch (error) {
      setPatientSummary("Error generating summary. Please try again.");
    } finally {
      setIsGeneratingPatientSummary(false);
    }
  };

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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const prompt = `Synthesize the following medical record: ${JSON.stringify(record)}. Provide a concise clinical summary and key takeaways.`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setRecordSummary(response.text || "Summary generation failed.");
    } catch (error) {
      console.error("Summary generation failed:", error);
    } finally {
      setIsSummarizing(false);
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
            onClick={generatePatientSummary}
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
             {/* Record Details Panel */}
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <button onClick={() => setSelectedRecord(null)} className="lg:hidden p-1 -ml-1 text-slate-500 hover:text-slate-700">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <FileText className="w-4 h-4 text-indigo-500" /> Record Details
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => generateRecordSummary(selectedRecord)}
                    disabled={isSummarizing || !selectedRecord}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isSummarizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                    {isSummarizing ? 'Summarizing...' : 'AI Summary'}
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-slate-50/30">
                {!selectedRecord ? (
                  <div className="h-full flex items-center justify-center text-center p-6">
                    <div className="max-w-xs">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mx-auto mb-4">
                        <MousePointer className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="font-medium text-slate-600 text-lg">No record selected</p>
                      <p className="text-sm text-slate-500 mt-1">Select a record from the timeline to view full clinical details.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 animate-in fade-in duration-300">
                    <div className="mb-6 pb-6 border-b border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "text-xs font-bold uppercase px-2 py-0.5 rounded-full",
                          selectedRecord.type === 'Lab Result' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        )}>{selectedRecord.type}</span>
                        <span className="text-sm text-slate-500 font-medium">{selectedRecord.date}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedRecord.title}</h2>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">Provider:</span> {selectedRecord.provider}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">Department:</span> {selectedRecord.department}
                        </div>
                      </div>
                    </div>

                    {(selectedRecord.type === 'Encounter' || selectedRecord.type === 'Diagnosis') && (
                      <div className="space-y-4">
                        {recordSummary && (
                          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm text-indigo-900 leading-relaxed mb-4">
                            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> AI Clinical Summary
                            </h4>
                            {recordSummary}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Clinical Summary</h4>
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-slate-700 leading-relaxed">
                            {selectedRecord.summary}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedRecord.type === 'Prescription' && selectedRecord.items && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Prescribed Medications</h4>
                        <div className="space-y-3">
                          {selectedRecord.items.map((item: any, idx: number) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-slate-900">{item.medicationName}</h5>
                                <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">{item.form}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-slate-500">Dosage:</span> <span className="font-medium">{item.dosage}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Frequency:</span> <span className="font-medium">{item.frequency}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Duration:</span> <span className="font-medium">{item.duration}</span>
                                </div>
                              </div>
                              {item.instructions && (
                                <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                                  <span className="font-semibold">Instructions:</span> {item.instructions}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRecord.type === 'Lab Result' && selectedRecord.results && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Laboratory Results</h4>
                          <div className="flex gap-3 text-xs font-medium">
                            <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> Normal</span>
                            <span className="flex items-center gap-1 text-red-600"><AlertTriangle className="w-3.5 h-3.5" /> Abnormal</span>
                          </div>
                        </div>
                        
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                              <tr>
                                <th className="px-4 py-3 font-semibold">Test Name</th>
                                <th className="px-4 py-3 font-semibold">Result</th>
                                <th className="px-4 py-3 font-semibold">Reference Range</th>
                                <th className="px-4 py-3 font-semibold text-center">Flag</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {selectedRecord.results.map((result: any, idx: number) => {
                                const isAbnormal = result.status !== 'normal';
                                return (
                                  <tr key={idx} className={cn("hover:bg-slate-50 transition-colors", isAbnormal && "bg-red-50/30 hover:bg-red-50/50")}>
                                    <td className="px-4 py-3 font-medium text-slate-800">{result.test}</td>
                                    <td className="px-4 py-3">
                                      <span className={cn("font-semibold", isAbnormal ? "text-red-600" : "text-slate-700")}>
                                        {result.value} {result.unit}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{result.range} {result.unit}</td>
                                    <td className="px-4 py-3 text-center">
                                      {isAbnormal ? (
                                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold uppercase">
                                          {result.status}
                                        </span>
                                      ) : (
                                        <span className="text-slate-300">-</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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

            <div className="h-[400px] w-full">
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
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
          {/* Timeline Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" /> Timeline
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
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Patient History Timeline</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50/30">
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {viewMode === 'critical' 
                  ? (records as any[]).filter(record => record.type === 'Lab Result' && record.results?.some((r: any) => r.status !== 'normal')).map((record) => (
                    <div 
                      key={record.id} 
                      onClick={() => setSelectedRecord(record)}
                      className={cn(
                        "relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active cursor-pointer p-3 rounded-xl border transition-all",
                        selectedRecord?.id === record.id 
                          ? "border-indigo-500 bg-indigo-50/50 shadow-sm" 
                          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-red-100 text-red-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <input 
                        type="checkbox"
                        className="absolute top-2 left-2 z-20"
                        checked={selectedToCompare.includes(record.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.checked) {
                            setSelectedToCompare([...selectedToCompare, record.id]);
                          } else {
                            setSelectedToCompare(selectedToCompare.filter(id => id !== record.id));
                          }
                        }}
                      />
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700">Critical</span>
                          <time className="text-xs font-medium text-slate-500">{record.date}</time>
                        </div>
                        <h4 className="font-semibold text-slate-800 text-sm truncate">{record.title}</h4>
                        <p className="text-xs text-slate-500 truncate">{record.provider}</p>
                      </div>
                    </div>
                  ))
                  : (records as any[])
                    .filter((record: any) => {
                      const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            (record.summary && record.summary.toLowerCase().includes(searchQuery.toLowerCase()));
                      const matchesType = filterType === 'All' || record.type === filterType;
                      return matchesSearch && matchesType;
                    })
                    .map((record: any) => (
                    <div 
                      key={record.id} 
                      onClick={() => setSelectedRecord(record)}
                      className={cn(
                        "relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active cursor-pointer p-3 rounded-xl border transition-all",
                        selectedRecord?.id === record.id 
                          ? "border-indigo-500 bg-indigo-50/50 shadow-sm" 
                          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                        {record.type === 'Lab Result' ? <FlaskConical className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      {record.type === 'Lab Result' && (
                        <input 
                          type="checkbox"
                          className="absolute top-2 left-2 z-20"
                          checked={selectedToCompare.includes(record.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setSelectedToCompare([...selectedToCompare, record.id]);
                            } else {
                              setSelectedToCompare(selectedToCompare.filter(id => id !== record.id));
                            }
                          }}
                        />
                      )}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            "text-xs font-bold uppercase px-2 py-0.5 rounded-full",
                            record.type === 'Lab Result' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                          )}>{record.type}</span>
                          <time className="text-xs font-medium text-slate-500">{record.date}</time>
                        </div>
                        <h4 className="font-semibold text-slate-800 text-sm truncate">{record.title}</h4>
                        <p className="text-xs text-slate-500 truncate">{record.provider}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Record Details Panel */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Record Details
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => generateRecordSummary(selectedRecord)}
                  disabled={isSummarizing}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isSummarizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                  {isSummarizing ? 'Summarizing...' : 'AI Summary'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-slate-50/30">
              {/* AI Query Section */}
              <div className="p-4 border-b border-slate-200 bg-white">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask AI about patient history..." 
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    onClick={async () => {
                      setIsQuerying(true);
                      try {
                        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
                        const prompt = `Based on these medical records: ${JSON.stringify(records)}, answer this question: ${aiQuery}`;
                        const response = await ai.models.generateContent({
                          model: "gemini-3-flash-preview",
                          contents: prompt,
                        });
                        setAiResponse(response.text || "No answer found.");
                      } catch (error) {
                        setAiResponse("Error querying records.");
                      } finally {
                        setIsQuerying(false);
                      }
                    }}
                    disabled={isQuerying}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isQuerying ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Ask'}
                  </button>
                </div>
                {aiResponse && (
                  <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-900">
                    {aiResponse}
                  </div>
                )}
              </div>
              {!selectedRecord ? (
                <div className="h-full flex items-center justify-center text-center p-6">
                  <div className="max-w-xs">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mx-auto mb-4">
                      <MousePointer className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-medium text-slate-600 text-lg">No record selected</p>
                    <p className="text-sm text-slate-500 mt-1">Select a record from the timeline to view full clinical details.</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 animate-in fade-in duration-300">
                  <div className="mb-6 pb-6 border-b border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "text-xs font-bold uppercase px-2 py-0.5 rounded-full",
                        selectedRecord.type === 'Lab Result' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      )}>{selectedRecord.type}</span>
                      <span className="text-sm text-slate-500 font-medium">{selectedRecord.date}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedRecord.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">Provider:</span> {selectedRecord.provider}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">Department:</span> {selectedRecord.department}
                      </div>
                    </div>
                  </div>

                  {selectedRecord.type === 'Encounter' && (
                    <div className="space-y-4">
                      {recordSummary && (
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm text-indigo-900 leading-relaxed mb-4">
                          <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Clinical Summary
                          </h4>
                          {recordSummary}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Clinical Summary</h4>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-slate-700 leading-relaxed">
                          {selectedRecord.summary}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors">
                          <FlaskConical className="w-3.5 h-3.5 text-indigo-500" /> View Related Labs
                        </button>
                        <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors">
                          <Pill className="w-3.5 h-3.5 text-indigo-500" /> View Prescriptions
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedRecord.type === 'Lab Result' && selectedRecord.results && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Laboratory Results</h4>
                        <div className="flex gap-3 text-xs font-medium">
                          <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> Normal</span>
                          <span className="flex items-center gap-1 text-red-600"><AlertTriangle className="w-3.5 h-3.5" /> Abnormal</span>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Test Name</th>
                              <th className="px-4 py-3 font-semibold">Result</th>
                              <th className="px-4 py-3 font-semibold">Reference Range</th>
                              <th className="px-4 py-3 font-semibold text-center">Flag</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedRecord.results.map((result: any, idx: number) => {
                              const isAbnormal = result.status !== 'normal';
                              return (
                                <tr key={idx} className={cn("hover:bg-slate-50 transition-colors", isAbnormal && "bg-red-50/30 hover:bg-red-50/50")}>
                                  <td className="px-4 py-3 font-medium text-slate-800">{result.test}</td>
                                  <td className="px-4 py-3">
                                    <span className={cn("font-semibold", isAbnormal ? "text-red-600" : "text-slate-700")}>
                                      {result.value} {result.unit}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-500">{result.range} {result.unit}</td>
                                  <td className="px-4 py-3 text-center">
                                    {isAbnormal ? (
                                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold uppercase">
                                        {result.status}
                                      </span>
                                    ) : (
                                      <span className="text-slate-300">-</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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
      {showPatientSummary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Patient Clinical Overview
              </h3>
              <button 
                onClick={() => setShowPatientSummary(false)} 
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto leading-relaxed text-slate-700">
              {isGeneratingPatientSummary ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                  <p className="text-slate-500 font-medium">Analyzing complete patient history...</p>
                  <p className="text-slate-400 text-sm mt-2">Synthesizing diagnoses, labs, and trends.</p>
                </div>
              ) : (
                <div className="prose prose-indigo max-w-none whitespace-pre-wrap">
                  {patientSummary}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end gap-2">
              <button 
                onClick={() => {
                  setPatientSummary(""); // Clear to force regenerate
                  generatePatientSummary();
                }}
                className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors"
              >
                Regenerate
              </button>
              <button 
                onClick={() => setShowPatientSummary(false)}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
