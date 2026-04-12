import React, { useMemo, useState, useEffect } from 'react';
import { Symptom } from '@/lib/SymptomContext';
import { COMMON_DIAGNOSES, Diagnosis } from '@/data/diagnosisMappings';
import { CLINICAL_PATHWAYS } from '@/data/clinicalPathways';
import { cn } from '@/lib/utils';
import { Grid, Info, AlertTriangle, BookOpen, ExternalLink, CheckCircle2, X, Search, ShieldAlert, FileText, TrendingUp } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { usePatient } from '@/lib/PatientContext';
import { searchPubMed } from '@/services/pubmedService';
import { checkSafetyAlerts, SafetyAlert } from '@/services/safetyService';
import { generateSoapNote } from '@/services/soapService';
import { PatientTrends } from '@/components/PatientTrends';

interface DifferentialDiagnosisGridProps {
  symptoms: Symptom[];
}

export const DifferentialDiagnosisGrid: React.FC<DifferentialDiagnosisGridProps> = ({ symptoms }) => {
  const [selectedDiagnosis, setSelectedDiagnosis] = React.useState<Diagnosis | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<string>('All');
  const [severityFilter, setSeverityFilter] = React.useState<string>('All');
  const [checkedRedFlags, setCheckedRedFlags] = useState<Record<string, boolean>>({});
  const [pubmedArticles, setPubmedArticles] = useState<{title: string, url: string}[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [soapNote, setSoapNote] = useState<string>('');
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);
  const { selectedPatient } = usePatient();

  const handleGenerateSoap = async () => {
    if (!selectedDiagnosis || !selectedPatient) return;
    setIsGeneratingSoap(true);
    try {
      const note = await generateSoapNote(
        selectedPatient,
        symptoms.map(s => s.label),
        selectedDiagnosis,
        Object.keys(checkedRedFlags).filter(f => checkedRedFlags[f])
      );
      setSoapNote(note);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingSoap(false);
    }
  };

  const categories = useMemo(() => ['All', ...Array.from(new Set(COMMON_DIAGNOSES.map(d => d.category)))], []);
  const severities = ['All', 'Mild', 'Moderate', 'Severe'];

  useEffect(() => {
    if (selectedDiagnosis) {
      setIsLoadingArticles(true);
      searchPubMed(selectedDiagnosis.name)
        .then(data => setPubmedArticles(data.articles))
        .catch(console.error)
        .finally(() => setIsLoadingArticles(false));

      if (selectedPatient) {
        setSafetyAlerts(checkSafetyAlerts(selectedPatient, selectedDiagnosis));
      }
    }
  }, [selectedDiagnosis, selectedPatient]);

  const clinicalPathways = useMemo(() => {
    if (!selectedDiagnosis) return [];
    return CLINICAL_PATHWAYS.filter(p => p.diagnosisId === selectedDiagnosis.id);
  }, [selectedDiagnosis]);

  const calculateConfidence = (diag: Diagnosis) => {
    const matchedCount = diag.commonSymptoms.filter(sId => symptoms.some(s => s.id === sId)).length;
    let score = (matchedCount / diag.commonSymptoms.length) * 100;

    if (selectedPatient) {
      const hasChronicCondition = selectedPatient.chronicConditions.some(c => diag.name.toLowerCase().includes(c.toLowerCase()));
      if (hasChronicCondition) score += 10;
      if (selectedPatient.age > 65 && diag.category === 'Cardiovascular') score += 5;
    }
    
    return Math.min(score, 100);
  };

  const filteredDiagnoses = useMemo(() => {
    return COMMON_DIAGNOSES.filter(diag => 
      (categoryFilter === 'All' || diag.category === categoryFilter) &&
      (severityFilter === 'All' || diag.severity === severityFilter)
    ).filter(diag => 
      diag.commonSymptoms.some(sId => symptoms.some(s => s.id === sId))
    ).map(diag => {
      return { ...diag, matchPercentage: calculateConfidence(diag) };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 6);
  }, [symptoms, categoryFilter, severityFilter, selectedPatient]);

  const radarData = useMemo(() => {
    if (!selectedDiagnosis) return [];
    return selectedDiagnosis.commonSymptoms.map(sId => ({
      subject: sId.replace(/_/g, ' '),
      A: symptoms.some(s => s.id === sId) ? 1 : 0,
      fullMark: 1,
    }));
  }, [selectedDiagnosis, symptoms]);

  const toggleRedFlag = (flag: string) => {
    setCheckedRedFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  if (filteredDiagnoses.length === 0) return <div className="p-4 text-slate-500">No matching diagnoses found.</div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800">Visual Differential Diagnosis Grid</h3>
        </div>
        <div className="flex gap-2">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border rounded p-1"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs border rounded p-1"
          >
            {severities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredDiagnoses.map((diag) => (
            <div 
              key={diag.id}
              onClick={() => setSelectedDiagnosis(diag)}
              className={cn(
                "p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                selectedDiagnosis?.id === diag.id ? "border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500" : "border-slate-100 bg-white hover:border-indigo-300"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-xs font-bold text-slate-800 leading-tight">{diag.name}</h4>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold text-indigo-600">{Math.round(diag.matchPercentage)}% Confidence</span>
                  <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500" 
                      style={{ width: `${diag.matchPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2">{diag.description}</p>
            </div>
          ))}
        </div>

        {selectedDiagnosis && (
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{selectedDiagnosis.category}</span>
                <h4 className="text-sm font-bold text-slate-900">{selectedDiagnosis.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">ICD-10: {selectedDiagnosis.icd10}</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Severity: {selectedDiagnosis.severity || 'N/A'}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDiagnosis(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed mb-4">{selectedDiagnosis.description}</p>
            
            {safetyAlerts.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <h5 className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Safety Alerts
                </h5>
                <ul className="space-y-1">
                  {safetyAlerts.map((alert, index) => (
                    <li key={index} className="text-[10px] text-red-700">
                      <strong>{alert.severity}:</strong> {alert.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{fontSize: 8}} />
                    <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} />
                    <Radar name="Patient Symptoms" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Diagnostic Tests</h5>
                  <p className="text-[10px] text-slate-700">{selectedDiagnosis.diagnosticTests?.join(', ') || 'N/A'}</p>
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">First-line Treatments</h5>
                  <p className="text-[10px] text-slate-700">{selectedDiagnosis.firstLineTreatments?.join(', ') || 'N/A'}</p>
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Prognosis</h5>
                  <p className="text-[10px] text-slate-700">{selectedDiagnosis.prognosis || 'N/A'}</p>
                </div>
                {selectedDiagnosis.redFlags.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-500" /> Red Flags
                    </h5>
                    <ul className="space-y-1">
                      {selectedDiagnosis.redFlags.map(f => (
                        <li key={f} className="text-[10px] text-slate-700 flex items-center gap-1.5">
                          <input 
                            type="checkbox" 
                            checked={!!checkedRedFlags[f]}
                            onChange={() => toggleRedFlag(f)}
                            className="w-3 h-3"
                          />
                          <span className={cn(checkedRedFlags[f] ? "line-through text-slate-400" : "text-red-700")}>
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            
            {clinicalPathways.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Clinical Pathways
                </h5>
                {clinicalPathways.map(pathway => (
                  <div key={pathway.id} className="mb-3">
                    <p className="text-[10px] font-bold text-slate-700">{pathway.title}</p>
                    <p className="text-[10px] text-slate-600 mb-1">{pathway.description}</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {pathway.actions.recommendations.map((rec, i) => (
                        <li key={i} className="text-[10px] text-slate-700">{rec}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-200">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Search className="w-3 h-3" /> Latest Evidence (PubMed)
              </h5>
              {isLoadingArticles ? (
                <p className="text-[10px] text-slate-500">Searching PubMed...</p>
              ) : pubmedArticles.length > 0 ? (
                <ul className="space-y-1">
                  {pubmedArticles.map((article, index) => (
                    <li key={index}>
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1">
                        {article.title} <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[10px] text-slate-500">No recent articles found.</p>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
              <div className="flex gap-2">
                <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Clinical Guidelines
                </button>
                <button 
                  onClick={handleGenerateSoap}
                  disabled={isGeneratingSoap}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" /> {isGeneratingSoap ? 'Generating...' : 'Generate SOAP Note'}
                </button>
              </div>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700">
                Add to SOAP Note
              </button>
            </div>
            
            {soapNote && (
              <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Generated SOAP Note</h5>
                <pre className="text-[10px] text-slate-700 whitespace-pre-wrap">{soapNote}</pre>
              </div>
            )}
            
            {selectedPatient && selectedPatient.vitalsHistory && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Patient Trends
                </h5>
                <PatientTrends patient={selectedPatient} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 italic text-center">
          Visual grid based on structured medical data. AI is used as a reviewer for complex cases.
        </p>
      </div>
    </div>
  );
};
