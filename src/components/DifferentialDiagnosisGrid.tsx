import React, { useMemo, useState, useEffect } from 'react';
import { Symptom } from '@/lib/SymptomContext';
import { COMMON_DIAGNOSES, Diagnosis } from '@/data/diagnosisMappings';
import { getCustomDiagnoses } from '@/lib/customDiagnoses';
import { CLINICAL_PATHWAYS } from '@/data/clinicalPathways';
import { cn } from '@/lib/utils';
import { Grid, Info, AlertTriangle, BookOpen, ExternalLink, CheckCircle2, X, Search, ShieldAlert, FileText, TrendingUp, Layers, LayoutGrid, Zap, ChevronDown, ChevronRight, Lightbulb, FlaskConical, Sparkles, Ban, Activity } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/ChartContainer';
import { usePatient } from '@/lib/PatientContext';
import { useAISettings } from '@/lib/AISettingsContext';
import { searchPubMed } from '@/services/pubmedService';
import { checkSafetyAlerts, SafetyAlert } from '@/services/clinicalAI/riskEngine';
import { generateSoapNote } from '@/services/clinicalAI/soapEngine';
import { calculateDiagnosticMetrics, calculateWeightedConfidence, getRuleOutImpactsForDiagnosis, isSymptomMatch, getAttributeRiskModifiers, DiagnosticMetrics } from '@/services/clinicalAI/differentialEngine';
import { PatientTrends } from '@/components/PatientTrends';
import { PertinentNegativeItem } from '@/data/pertinentNegativesDictionary';

interface DifferentialDiagnosisGridProps {
  symptoms: Symptom[];
  pertinentNegatives?: PertinentNegativeItem[];
}

export const DifferentialDiagnosisGrid: React.FC<DifferentialDiagnosisGridProps> = ({ symptoms, pertinentNegatives = [] }) => {
  const [selectedDiagnoses, setSelectedDiagnoses] = React.useState<Diagnosis[]>([]);
  const [categoryFilter, setCategoryFilter] = React.useState<string>('All');
  const [severityFilter, setSeverityFilter] = React.useState<string>('All');
  const [durationFilter, setDurationFilter] = React.useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'systems'>('grid'); // 'grid' (flat) vs 'systems' (clustered)
  const [visibleCount, setVisibleCount] = useState(6);
  const [zebraMode, setZebraMode] = useState(false); // Rare but critical diagnoses
  
  const [checkedRedFlags, setCheckedRedFlags] = useState<Record<string, boolean>>({});
  const [pubmedArticles, setPubmedArticles] = useState<{title: string, url: string}[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [soapNote, setSoapNote] = useState<string>('');
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);
  const { selectedPatient } = usePatient();
  const { settings: aiSettings } = useAISettings();

  const handleToggleDiagnosis = (diag: Diagnosis) => {
    setSelectedDiagnoses(prev => {
      const isSelected = prev.some(d => d.id === diag.id);
      if (isSelected) {
        return prev.filter(d => d.id !== diag.id);
      } else {
        // Limit to 2 for comparison clarity
        if (prev.length >= 2) return [prev[1], diag];
        return [...prev, diag];
      }
    });
  };

  const selectedDiagnosis = selectedDiagnoses[selectedDiagnoses.length - 1] || null;

  const handleGenerateSoap = async () => {
    if (!selectedDiagnosis || !selectedPatient) return;
    setIsGeneratingSoap(true);
    try {
      const note = await generateSoapNote(
        selectedPatient,
        symptoms.map(s => s.label),
        selectedDiagnosis,
        Object.keys(checkedRedFlags).filter(f => checkedRedFlags[f]),
        aiSettings
      );
      setSoapNote(note);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingSoap(false);
    }
  };

  const activeDiagnoses = useMemo(() => {
    const custom = getCustomDiagnoses();
    const map = new Map<string, Diagnosis>();
    COMMON_DIAGNOSES.forEach(d => map.set(d.id, d));
    custom.forEach(d => map.set(d.id, d));
    return Array.from(map.values());
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(activeDiagnoses.map(d => d.category)))], [activeDiagnoses]);
  const severities = ['All', 'Mild', 'Moderate', 'Severe'];
  const durations = [
    { label: 'All Durations', value: 'All', days: undefined },
    { label: '< 24 Hours', value: 'Acute-24h', days: 1 },
    { label: '1-7 Days', value: 'Acute-1w', days: 7 },
    { label: '1-4 Weeks', value: 'Subacute', days: 21 },
    { label: '> 3 Months', value: 'Chronic', days: 120 }
  ];

  const currentDurationDays = useMemo(() => {
    return durations.find(d => d.value === durationFilter)?.days;
  }, [durationFilter]);

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

  const calculateConfidence = (diag: Diagnosis): DiagnosticMetrics => {
    return calculateDiagnosticMetrics(diag, symptoms, selectedPatient || undefined, currentDurationDays, pertinentNegatives);
  };

  const filteredDiagnoses = useMemo(() => {
    let base = activeDiagnoses.filter(diag => 
      (categoryFilter === 'All' || diag.category === categoryFilter) &&
      (severityFilter === 'All' || diag.severity === severityFilter)
    ).map(diag => {
      const metrics = calculateConfidence(diag);
      // We keep matchPercentage for backward compatibility, mapped to bayesianProbability
      return { ...diag, matchPercentage: metrics.bayesianProbability, metrics };
    });

    // Handle "Zebra" mode: filter specifically for rare (low prevalence) or critical cases
    if (zebraMode) {
      base = base.filter(diag => (diag.prevalenceScore && diag.prevalenceScore <= 3) || diag.severity === 'Critical');
    }

    return base.sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      const aPriority = a.triagePriority ? (6 - a.triagePriority) : 0;
      const bPriority = b.triagePriority ? (6 - b.triagePriority) : 0;
      return bPriority - aPriority;
    });
  }, [symptoms, pertinentNegatives, categoryFilter, severityFilter, selectedPatient, zebraMode, currentDurationDays]);

  const diagnosesBySystem = useMemo(() => {
    const systems: Record<string, typeof filteredDiagnoses> = {};
    filteredDiagnoses.forEach(diag => {
      const sys = diag.system || diag.category || 'Other';
      if (!systems[sys]) systems[sys] = [];
      systems[sys].push(diag);
    });
    return systems;
  }, [filteredDiagnoses]);

  const displayedDiagnoses = useMemo(() => {
    return filteredDiagnoses.slice(0, visibleCount);
  }, [filteredDiagnoses, visibleCount]);

  const radarData = useMemo(() => {
    if (selectedDiagnoses.length === 0) return [];
    
    // Combine all unique symptoms from selected diagnoses
    const allSymptomIds = Array.from(new Set(
      selectedDiagnoses.flatMap(d => d.commonSymptoms)
    ));

    return allSymptomIds.slice(0, 8).map(sId => {
      const data: any = {
        subject: sId.replace(/_/g, ' '),
        fullMark: 1,
      };

      selectedDiagnoses.forEach((diag, index) => {
        data[`val${index}`] = diag.commonSymptoms.includes(sId) ? 1 : 0;
      });

      // Also add current patient match for the first selected diagnosis' context
      data['A'] = symptoms.some(s => isSymptomMatch(sId, s)) ? 1 : 0;

      return data;
    });
  }, [selectedDiagnoses, symptoms]);

  const reasoningExplanation = useMemo(() => {
    if (!selectedDiagnosis) return null;
    
    const topLr = selectedDiagnosis.likelihoodRatios?.sort((a, b) => b.lrPositive - a.lrPositive)[0];
    const matchCount = selectedDiagnosis.commonSymptoms.filter(sId => symptoms.some(s => isSymptomMatch(sId, s))).length;
    
    if (selectedDiagnosis.matchPercentage > 85) {
      return `Highly probable due to strong alignment with ${matchCount} key clinical markers${topLr ? ` and high LR+ for ${topLr.symptomId.replace(/_/g, ' ')}` : ''}.`;
    }
    if (topLr && symptoms.some(s => isSymptomMatch(topLr.symptomId, s))) {
      return `Ranked high primarily because the presence of ${topLr.symptomId.replace(/_/g, ' ')} is a strong predictor (LR+ ${topLr.lrPositive}) for this condition.`;
    }
    return `Included in differential based on ${matchCount} matching symptoms and demographic prevalence.`;
  }, [selectedDiagnosis, symptoms]);

  const toggleRedFlag = (flag: string) => {
    setCheckedRedFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  if (!symptoms || symptoms.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-8 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Grid className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            No symptoms selected
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select symptoms above or start AI Diagnostic Q&A to generate differential diagnoses.
          </p>
        </div>
      </div>
    );
  }

  if (filteredDiagnoses.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-8 text-center">
        <div className="max-w-md mx-auto space-y-2">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No matching diagnoses found for current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Visual Differential Diagnosis</h3>
          </div>
          
          <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === 'grid' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setViewMode('systems')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === 'systems' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"
              )}
              title="Systems View"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>

          <button 
            onClick={() => setZebraMode(!zebraMode)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all",
              zebraMode 
                ? "bg-amber-100 border-amber-300 text-amber-700 shadow-sm" 
                : "bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600"
            )}
          >
            <Zap className={cn("w-3 h-3", zebraMode && "fill-amber-500 text-amber-500")} />
            {zebraMode ? "Rare Cases (Zebra)" : "Include Rare"}
          </button>
        </div>

        <div className="flex gap-2">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-[10px] font-bold border-slate-200 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-[10px] font-bold border-slate-200 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            {severities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            value={durationFilter} 
            onChange={(e) => setDurationFilter(e.target.value)}
            className="text-[10px] font-bold border-slate-200 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            {durations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>
      
      <div className="p-4">
        {viewMode === 'grid' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayedDiagnoses.map((diag) => {
                const isSelected = selectedDiagnoses.some(d => d.id === diag.id);
                // Fallbacks in case metrics aren't populated for any reason
                const clinicalMatch = diag.metrics?.clinicalMatch ?? Math.round(diag.matchPercentage);
                const bayesianProbability = diag.metrics?.bayesianProbability ?? Math.round(diag.matchPercentage);
                const evidenceLevel = diag.metrics?.evidenceLevel ?? (diag.matchPercentage > 80 ? 'Strong' : diag.matchPercentage > 50 ? 'Moderate' : 'Weak');

                return (
                  <div 
                    key={diag.id}
                    onClick={() => handleToggleDiagnosis(diag)}
                    className={cn(
                      "p-3 rounded-xl cursor-pointer transition-all duration-300 relative group overflow-hidden border",
                      isSelected 
                        ? "border-indigo-400 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)] bg-gradient-to-br from-indigo-50/80 to-white" 
                        : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md"
                    )}
                  >
                    {/* Subtle background glow for high match */}
                    {bayesianProbability > 80 && !isSelected && (
                      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    )}
                    
                    {diag.diagnosticTests && diag.diagnosticTests.length > 0 && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-1 bg-white border border-slate-200 rounded text-indigo-600 shadow-sm hover:bg-indigo-600 hover:text-white transition-colors" title={`Order ${diag.diagnosticTests[0]}`}>
                          <Zap className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <h4 className="text-xs font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors tracking-tight pr-6">{diag.name}</h4>
                      <div className="flex flex-col items-end shrink-0">
                        <span className={cn(
                          "text-[10px] font-black",
                          bayesianProbability > 75 ? "text-emerald-600" : bayesianProbability > 40 ? "text-indigo-600" : "text-slate-500"
                        )}>
                          {bayesianProbability}%
                        </span>
                        <div className="w-14 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden shadow-inner">
                          <div 
                            className={cn(
                              "h-full transition-all duration-500", 
                              bayesianProbability > 75 ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : 
                              bayesianProbability > 40 ? "bg-gradient-to-r from-indigo-400 to-indigo-600" : 
                              "bg-gradient-to-r from-slate-300 to-slate-400"
                            )} 
                            style={{ width: `${bayesianProbability}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2 relative z-10">
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500 uppercase">{diag.system || diag.category}</span>
                      
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 uppercase flex items-center gap-1 shadow-sm">
                        <Activity className="w-2 h-2" /> Match: {clinicalMatch}%
                      </span>
                      
                      <span className={cn(
                        "text-[8px] font-bold px-1.5 py-0.5 rounded-md border uppercase flex items-center gap-1 shadow-sm",
                        evidenceLevel === 'Strong' ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                        evidenceLevel === 'Moderate' ? "bg-indigo-50 border-indigo-200 text-indigo-700" :
                        "bg-slate-50 border-slate-200 text-slate-600"
                      )}>
                        <FileText className="w-2 h-2" /> {evidenceLevel} Evidence
                      </span>

                      {diag.severity === 'Critical' && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-600 uppercase flex items-center gap-1 shadow-sm">
                          <AlertTriangle className="w-2 h-2" /> Critical
                        </span>
                      )}
                      {selectedPatient?.labResults && diag.associatedLabs?.some(assoc => 
                        selectedPatient.labResults?.some(l => l.labName === assoc.labName && l.range === assoc.range)
                      ) && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 uppercase flex items-center gap-1 shadow-sm">
                          <FlaskConical className="w-2 h-2" /> Lab Match
                        </span>
                      )}
                      {pertinentNegatives.length > 0 && (() => {
                        const impacts = getRuleOutImpactsForDiagnosis(diag, pertinentNegatives);
                        if (impacts.length === 0) return null;
                        return (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 uppercase flex items-center gap-1 shadow-sm" title={impacts.map(i => i.explanation).join('; ')}>
                            <Ban className="w-2 h-2 text-rose-500" /> Ruled Down ({impacts.length})
                          </span>
                        );
                      })()}
                      {(() => {
                        const attrImpacts = getAttributeRiskModifiers(diag, symptoms);
                        if (attrImpacts.length === 0) return null;
                        const hasIncrease = attrImpacts.some(i => i.rule.modifierValue > 1);
                        
                        return (
                          <span className={cn(
                            "text-[8px] font-bold px-1.5 py-0.5 rounded-md border uppercase flex items-center gap-1 shadow-sm",
                            hasIncrease 
                              ? "bg-amber-50 border-amber-200 text-amber-700" 
                              : "bg-slate-50 border-slate-200 text-slate-700"
                          )} title={attrImpacts.map(i => i.rule.explanation).join('; ')}>
                            {hasIncrease ? <TrendingUp className="w-2 h-2" /> : <TrendingUp className="w-2 h-2 transform rotate-180" />} 
                            Modifier ({attrImpacts.length})
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 italic leading-relaxed relative z-10">"{diag.description}"</p>
                  </div>
                );
              })}
            </div>

            {visibleCount < filteredDiagnoses.length && (
              <button 
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg transition-colors border border-dashed border-indigo-200"
              >
                Load More Diagnoses ({filteredDiagnoses.length - visibleCount} more) <ChevronDown className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(diagnosesBySystem).map(([system, diags]) => (
              <div key={system} className="space-y-2">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{system} ({diags.length})</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {diags.map(diag => (
                    <div 
                      key={diag.id}
                      onClick={() => handleToggleDiagnosis(diag)}
                      className={cn(
                        "p-2.5 border rounded-lg cursor-pointer transition-all hover:shadow-sm relative group",
                        selectedDiagnoses.some(d => d.id === diag.id) ? "border-indigo-500 bg-indigo-50/30" : "border-slate-100 bg-white"
                      )}
                    >
                      {diag.diagnosticTests && diag.diagnosticTests.length > 0 && (
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Zap className="w-2.5 h-2.5 text-indigo-400" />
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-slate-800 pr-3">{diag.name}</span>
                        <span className="text-[9px] font-mono text-indigo-500 font-bold">{Math.round(diag.matchPercentage)}%</span>
                      </div>
                      <div className="w-full h-0.5 bg-slate-50 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${diag.matchPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

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
                onClick={() => setSelectedDiagnoses([])}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed mb-4">{selectedDiagnosis.description}</p>
            
            {/* AI Next Steps & Suggestions Panel */}
            <div className="mb-5 p-4 bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Lightbulb className="w-16 h-16 text-indigo-500" />
              </div>
              <h5 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-3 flex items-center gap-1.5 relative z-10">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> AI Diagnostic Suggestions
              </h5>
              
              <div className="space-y-4 relative z-10">
                {selectedDiagnosis.likelihoodRatios && selectedDiagnosis.likelihoodRatios.some(lr => !symptoms.some(s => isSymptomMatch(lr.symptomId, s))) && (
                  <div>
                    <h6 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">To Rule In/Out, Ask About:</h6>
                    <div className="flex flex-wrap gap-2">
                      {selectedDiagnosis.likelihoodRatios
                        .filter(lr => !symptoms.some(s => isSymptomMatch(lr.symptomId, s)))
                        .map((lr, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-indigo-100 rounded-lg shadow-sm">
                            <span className="text-[10px] font-medium text-slate-700 capitalize">{lr.symptomId.replace(/_/g, ' ')}</span>
                            <span className={cn(
                              "text-[8px] font-bold px-1 rounded",
                              lr.lrPositive > 5 ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
                            )}>
                              {lr.lrPositive > 5 ? 'High Value' : 'Standard'}
                            </span>
                          </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDiagnosis.diagnosticTests && selectedDiagnosis.diagnosticTests.length > 0 && (
                  <div>
                    <h6 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Recommended Workup:</h6>
                    <div className="flex flex-wrap gap-2">
                      {selectedDiagnosis.diagnosticTests.map((test, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg">
                          <FlaskConical className="w-2.5 h-2.5" />
                          {test}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {reasoningExplanation && (
              <div className="mb-4 p-3 bg-indigo-600 rounded-lg shadow-sm border border-indigo-500 flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mb-1">Differential Reasoning</h5>
                  <p className="text-xs text-white leading-relaxed font-medium">{reasoningExplanation}</p>
                </div>
              </div>
            )}

            {/* Distinguishing Features / Reasoning */}
            {selectedDiagnosis.distinguishingFeatures && selectedDiagnosis.distinguishingFeatures.length > 0 && (
              <div className="mb-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-indigo-500" /> Distinguishing Features
                </h5>
                <ul className="space-y-1">
                  {selectedDiagnosis.distinguishingFeatures.map((feature, i) => (
                    <li key={i} className="text-[10px] text-slate-700 flex items-start gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Symptom Presentation Match / Clinical Reasoning */}
            <div className="mb-4">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Symptom Presentation Match
              </h5>
              <div className="space-y-1.5">
                {Array.from(new Set([
                  ...selectedDiagnosis.commonSymptoms,
                  ...(selectedDiagnosis.likelihoodRatios?.map(lr => lr.symptomId) || [])
                ])).map((sId, i) => {
                  const isPresent = symptoms.some(s => isSymptomMatch(sId, s));
                  const lr = selectedDiagnosis.likelihoodRatios?.find(l => l.symptomId === sId);
                  
                  const lrPosScore = lr ? Math.min(lr.lrPositive, 10) : null;
                  const lrNegScore = lr ? Math.min(1 / (lr.lrNegative || 1), 10) : null;

                  return (
                    <div key={i} className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
                      <div className="flex items-center justify-between z-10">
                        <span className="text-[10px] text-slate-700 font-bold capitalize">{sId.replace(/_/g, ' ')}</span>
                        <span className={cn(
                          "text-[9px] font-black px-1.5 py-0.5 rounded border shadow-sm",
                          isPresent ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"
                        )}>
                          {isPresent ? (lr ? `Match: +${lr.lrPositive}x` : 'Match') : (lr ? `Absent: ${lr.lrNegative}x` : 'Absent')}
                        </span>
                      </div>
                      
                      {lr && (
                        <div className="grid grid-cols-2 gap-2 mt-1 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                          {/* Positive predictive value bar */}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[7px] text-emerald-600 font-bold uppercase tracking-widest">Rule-In Power (LR+)</span>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(lrPosScore / 10) * 100}%` }} />
                            </div>
                          </div>
                          {/* Negative predictive value bar */}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[7px] text-indigo-600 font-bold uppercase tracking-widest">Rule-Out Power (LR-)</span>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(lrNegScore / 10) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Subtle background highlight if matched */}
                      {isPresent && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

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
              <div className="w-full">
                <ChartContainer>
                  <div className="mb-2 flex items-center justify-between">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Symptom Distribution</h5>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-400 opacity-60" />
                        <span className="text-[8px] font-bold text-slate-500">Patient</span>
                      </div>
                      {selectedDiagnoses.map((d, i) => (
                        <div key={d.id} className="flex items-center gap-1.5">
                          <div className={cn("w-2 h-2 rounded-full", i === 0 ? "bg-indigo-500" : "bg-emerald-500")} />
                          <span className="text-[8px] font-bold text-slate-500 truncate max-w-[40px]">{d.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{fontSize: 7}} />
                      <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} />
                      <Radar name="Patient Symptoms" dataKey="A" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                      {selectedDiagnoses.map((d, i) => (
                        <Radar 
                          key={d.id}
                          name={d.name} 
                          dataKey={`val${i}`} 
                          stroke={i === 0 ? "#4f46e5" : "#10b981"} 
                          fill={i === 0 ? "#4f46e5" : "#10b981"} 
                          fillOpacity={0.4} 
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="space-y-4">
                {(() => {
                  const attrImpacts = getAttributeRiskModifiers(selectedDiagnosis, symptoms);
                  if (attrImpacts.length > 0) {
                    return (
                      <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 shadow-sm">
                        <h5 className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Attribute Modifiers Applied
                        </h5>
                        <ul className="space-y-1.5 mt-2">
                          {attrImpacts.map((impact, idx) => (
                            <li key={idx} className="text-[10px] text-slate-700 bg-white p-2 rounded border border-amber-100/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                              <span className="font-semibold text-slate-900 block mb-0.5">{impact.rule.explanation}</span>
                              <span className="text-slate-500 flex items-center gap-2">
                                <span><span className="font-medium">Attribute:</span> {impact.rule.attributeKey}</span>
                                <span><span className="font-medium">Multiplier:</span> {impact.rule.modifierValue}x</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Diagnostic Tests</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedDiagnosis.diagnosticTests?.map(test => (
                      <span key={test} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 font-medium">
                        {test}
                      </span>
                    )) || <span className="text-[10px] text-slate-400 italic">No tests listed in guidelines</span>}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">First-line Treatments</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedDiagnosis.firstLineTreatments?.map(trt => (
                      <span key={trt} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-medium">
                        {trt}
                      </span>
                    )) || <span className="text-[10px] text-slate-400 italic">No treatments listed in guidelines</span>}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Prognosis</h5>
                  <p className="text-[10px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 italic">
                    {selectedDiagnosis.prognosis || 'No prognostic data available.'}
                  </p>
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
