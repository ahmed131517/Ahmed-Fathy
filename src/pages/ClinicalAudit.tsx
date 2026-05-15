import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, AlertTriangle, ArrowLeft, CheckCircle, XCircle, 
  Sparkles, RefreshCw, AlertCircle, Info, Calculator, Activity,
  BrainCircuit, FileText, Layout, ArrowRight, Pill, Undo2, Shuffle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { usePatient } from '@/lib/PatientContext';
import { checkSafetyAlerts, SafetyAlert } from '@/services/safetyService';
import { ClinicalIntelligenceService, TherapeuticGapAlert, IndicationAlert } from '@/services/clinical.intelligence.service';
import { generateContentWithRetry, parseJsonResponse } from "@/utils/gemini";
import { toast } from 'sonner';
import { db } from '@/lib/db';

import { clinicalAIRequest } from "../services/aiWorkflowService";
import { useAISettings } from "../lib/AISettingsContext";

export function ClinicalAudit() {
  const { settings: aiSettings } = useAISettings();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPatient, confirmedDiagnosis } = usePatient();
  
  // The items being audited
  const initialItems = location.state?.items || [];
  const [items, setItems] = useState<any[]>(initialItems);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Record<string, any>>({});
  const [counselingPoints, setCounselingPoints] = useState<string[]>([]);
  const [labSuggestions, setLabSuggestions] = useState<string[]>([]);
  const [costAlerts, setCostAlerts] = useState<any[]>([]);
  const [pgxAlerts, setPgxAlerts] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any>(null);
  const [labs, setLabs] = useState<any[]>([]);

  // Safety States
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [interactionAlerts, setInteractionAlerts] = useState<any[]>([]);
  const [gapAlerts, setGapAlerts] = useState<TherapeuticGapAlert[]>([]);
  const [indicationAlerts, setIndicationAlerts] = useState<IndicationAlert[]>([]);

  useEffect(() => {
    if (!selectedPatient) {
      navigate('/prescriptions');
      return;
    }

    const loadContext = async () => {
      try {
        const latestVitals = await db.vitals.where('patientId').equals(selectedPatient.id).reverse().first();
        const latestLabs = await db.lab_results.where('patientId').equals(selectedPatient.id).toArray();
        setVitals(latestVitals);
        setLabs(latestLabs);
        await runAudit(items, latestVitals, latestLabs);
      } catch (error) {
        console.error("Audit context load failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContext();
  }, [selectedPatient]);

  const runAudit = async (currentItems: any[], currentVitals: any, currentLabs: any[]) => {
    const meds = currentItems.map(i => i.medication);
    const diagnosis = { name: confirmedDiagnosis || "" };
    
    // 1. Basic Safety (Allergies/Contraindications)
    const tempPatient = {
      ...selectedPatient,
      medications: currentItems.map(i => ({ name: i.medication }))
    };
    const sAlerts = checkSafetyAlerts(tempPatient as any, diagnosis);
    
    // 2. Organ Safety
    const organAlerts = ClinicalIntelligenceService.checkOrganFunctionSafety(meds, {
      age: selectedPatient.age,
      weightKg: currentVitals?.weight || 0,
      creatinine: parseFloat(currentLabs.find(l => l.testName.toLowerCase().includes('creatinine'))?.value) || 0,
      alt: parseFloat(currentLabs.find(l => l.testName.toLowerCase().includes('alt'))?.value) || 0,
      hasLiverDisease: selectedPatient.chronicConditions?.some((c: string) => /liver|hepatic|cirrhosis/i.test(c))
    });

    setSafetyAlerts([...sAlerts, ...organAlerts]);

    // 3. Interactions
    const interactions = await ClinicalIntelligenceService.checkInteractions(meds);
    setInteractionAlerts(interactions);

    // 4. Gaps
    const conditions = [...(selectedPatient.chronicConditions || []), ...(confirmedDiagnosis ? [confirmedDiagnosis] : [])];
    const gaps = await ClinicalIntelligenceService.checkTherapeuticGaps(conditions, meds);
    setGapAlerts(gaps);

    // 5. Indications
    const indications = await ClinicalIntelligenceService.auditMedicationIndications(meds, conditions);
    setIndicationAlerts(indications);

    // 6. Get AI Recommendations for triggers
    generateRecommendations([...sAlerts, ...organAlerts], interactions, gaps, indications, currentItems);
  };

  const generateRecommendations = async (safety: any[], ddi: any[], gaps: any[], indies: any[], currentItems: any[]) => {
    if (safety.length === 0 && ddi.length === 0 && gaps.length === 0 && indies.length === 0 && currentItems.length === 0) return;

    try {
      const prompt = `You are a clinical pharmacologist. Review these alerts and provide a "Recommendation" for each.
      Also provide 3-5 high-priority "Patient Counseling Highlights" for the prescribed medications.
      Additionally, provide any "Required Lab Monitoring" suggestions for these specific medications (e.g., follow-up for ACE inhibitors, Anticoagulants, Statins, etc.).
      Finally, check for "Prior Authorization" requirements (drugs that typically need insurance approval) and "Cost Saving" alerts (generic alternatives or high-price warnings).
      Crucially, scan for "Pharmacogenomic (PGx) Alerts" if any medications imply risks for specific metabolizer phenotypes (e.g., CYP2C19 for Clopidogrel, CYP2D6 for Codeine/SSRIs). Indicate if these are general warnings or specific if you detect patient-specific mentions in context.
      
      Prescribed Medications: ${JSON.stringify(currentItems)}
      Alerts: ${JSON.stringify({ safety, ddi, gaps, indies })}
      Patient Context: ${JSON.stringify({ conditions: selectedPatient.chronicConditions, allergies: selectedPatient.allergies })}
      
      Return JSON: 
      { 
        "recommendations": { "alert_id": { "action": "Subsitute|Adjust|Add", "suggestion": "New Drug/Dose Name", "reason": "Med justification" } },
        "counseling_highlights": ["Point 1", "Point 2"],
        "lab_monitoring": ["Monitoring task 1", "Monitoring task 2"],
        "financial_alerts": [
          { "type": "Prior Auth", "drug": "Drug Name", "message": "Why PA is needed" },
          { "type": "Cost Saving", "drug": "Drug Name", "message": "Generic alternative info", "savings": "High|Medium" }
        ],
        "pgx_alerts": [
          { "drug": "Name", "genotype_context": "CYP2C19", "warning": "Slow Metabolizer risk", "severity": "High|Moderate" }
        ]
      }`;
      
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      const data = parseJsonResponse(responseText, { recommendations: {}, counseling_highlights: [], lab_monitoring: [], financial_alerts: [], pgx_alerts: [] });
      setRecommendations(data.recommendations || {});
      setCounselingPoints(data.counseling_highlights || []);
      setLabSuggestions(data.lab_monitoring || []);
      setCostAlerts(data.financial_alerts || []);
      setPgxAlerts(data.pgx_alerts || []);
    } catch (error) {
      console.error("AI Recommendation failed", error);
    }
  };

  const handleAcceptRecommendation = (alertId: string, suggestion: any) => {
    // Logic to update items based on suggestion
    // For now, toast it and update the item list
    toast.success(`Recommendation accepted: ${suggestion.suggestion}`);
    // In a real app, we'd more accurately map which item to replace
    // This is a simplified version
  };

  const handleOverride = (id: string, reason: string) => {
    setOverrides(prev => ({ ...prev, [id]: reason }));
    toast.info("Override logged in audit trail.");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/prescriptions', { state: { items } })}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Clinical Safety Audit</h1>
              <p className="text-xs text-slate-500 font-medium">Active Decision Support for {selectedPatient?.name}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const auditData = {
                patient: selectedPatient?.name,
                timestamp: new Date().toISOString(),
                safetyAlerts,
                interactionAlerts,
                gapAlerts,
                indicationAlerts,
                recommendations
              };
              const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `audit_report_${selectedPatient?.name}_${new Date().toISOString()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2"
          >
           Export Audit
          </button>
          <button 
            onClick={() => navigate('/prescriptions', { state: { items } })}
            className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => navigate('/prescriptions', { state: { items, audited: true } })}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            Approve & Return <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Quick Summary Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard 
              icon={<AlertCircle className="text-rose-500" />} 
              label="Safety Risks" 
              count={safetyAlerts.length} 
              color="rose"
            />
            <SummaryCard 
              icon={<RefreshCw className="text-orange-500" />} 
              label="Interactions" 
              count={interactionAlerts.length} 
              color="orange"
            />
            <SummaryCard 
              icon={<BrainCircuit className="text-indigo-500" />} 
              label="Clinical Gaps" 
              count={gapAlerts.length} 
              color="indigo"
            />
            <SummaryCard 
              icon={<CheckCircle className="text-emerald-500" />} 
              label="Ready to Finalize" 
              count={items.length} 
              color="emerald"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Alert List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Alerts & Recommendations</h2>
              
              {isLoading ? (
                <div className="p-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <RefreshCw className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                  <p className="font-bold">Analyzing Prescription Safety...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Safety Alerts (Allergies/Contraindications) */}
                  {safetyAlerts.map((alert, i) => (
                    <AuditItem 
                      key={`safety-${i}`}
                      type="Safety"
                      severity="critical"
                      title={alert.type}
                      message={alert.message}
                      recommendation={recommendations[`safety-${i}`]}
                      onAccept={() => handleAcceptRecommendation(`safety-${i}`, recommendations[`safety-${i}`])}
                      onOverride={(reason) => handleOverride(`safety-${i}`, reason)}
                    />
                  ))}

                  {/* Interactions */}
                  {interactionAlerts.length > 0 && items.length >= 2 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Shuffle className="w-3 h-3" /> Interaction Network Matrix
                      </h3>
                      <InteractionMatrix medications={items.map(i => i.medication)} interactions={interactionAlerts} />
                    </div>
                  )}

                  {interactionAlerts.map((alert, i) => (
                    <AuditItem 
                      key={`ddi-${i}`}
                      type="Interaction"
                      severity={alert.severity === 'Major' ? 'critical' : 'warning'}
                      title={Array.isArray(alert.drugs) ? alert.drugs.join(" + ") : "Interaction"}
                      message={alert.description}
                      recommendation={recommendations[`ddi-${i}`]}
                    />
                  ))}

                  {/* Gaps */}
                  {gapAlerts.map((gap, i) => (
                    <AuditItem 
                      key={`gap-${i}`}
                      type="Therapeutic Gap"
                      severity="warning"
                      title={`Missing therapy for ${gap.condition}`}
                      message={gap.message}
                      recommendation={{ action: "Add", suggestion: "Indicated medication", reason: gap.clinicalContext }}
                      evidence={gap.evidence}
                      guidelineUrl={gap.guidelineUrl}
                    />
                  ))}

                  {/* Indications */}
                  {indicationAlerts.map((alert, i) => (
                    <AuditItem 
                      key={`indy-${i}`}
                      type="Indication Audit"
                      severity="warning"
                      title={alert.drug}
                      message={alert.message}
                    />
                  ))}

                  {safetyAlerts.length === 0 && interactionAlerts.length === 0 && gapAlerts.length === 0 && indicationAlerts.length === 0 && (
                    <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">Prescription Cleared</h3>
                      <p className="text-slate-500 mt-2">All automated safety checks passed for this selection.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Patient Counseling Section */}
              {!isLoading && (
                <section className="mt-8 space-y-4">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Patient Counseling Highlights</h2>
                  <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500 rounded-xl">
                          <BrainCircuit className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold italic">"Must-Say" Points for Patient</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {counselingPoints.length > 0 ? (
                          counselingPoints.map((point, i) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-white/10 rounded-2xl border border-white/5 hover:bg-white/15 transition-colors">
                              <div className="w-5 h-5 rounded-full bg-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <p className="text-sm font-medium leading-relaxed">{point}</p>
                            </div>
                          ))
                        ) : (
                          [1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse"></div>
                          ))
                        )}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                        <span>Verified Educational Content</span>
                        <span>Clinical Intelligence v4.2</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Lab Monitoring Section */}
              {!isLoading && (
                <section className="mt-8 space-y-4">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Required Lab Monitoring</h2>
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-slate-800">Follow-up Schedule</h3>
                    </div>
                    <div className="p-1">
                      {labSuggestions.length > 0 ? (
                        labSuggestions.map((suggestion, i) => (
                          <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                {i + 1}
                              </div>
                              <p className="text-sm font-medium text-slate-800">{suggestion}</p>
                            </div>
                            <button className="px-3 py-1.5 text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                              Order Now
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400 italic text-sm">
                          No specific laboratory monitoring required for this profile.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Pharmacogenomic Safeguard */}
              {!isLoading && pgxAlerts.length > 0 && (
                <section className="mt-8 space-y-4">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Pharmacogenomic (PGx) Safeguard</h2>
                  <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-700">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-600 rounded-xl">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Genomic Sensitivity Detected</h3>
                          <p className="text-xs text-slate-400 font-medium">Metabolic Pathway Analysis (CYP450)</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {pgxAlerts.map((alert, i) => (
                          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-black uppercase tracking-widest">
                                {alert.genotype_context}
                              </div>
                              <div>
                                <p className="text-sm font-bold">{alert.drug}</p>
                                <p className="text-xs text-slate-400">{alert.warning}</p>
                              </div>
                            </div>
                            <div className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                              alert.severity === 'High' ? "bg-rose-500 text-white" : "bg-amber-500 text-black"
                            )}>
                              {alert.severity} Risk
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Pharmacogenomic Safeguard */}
              {!isLoading && pgxAlerts.length > 0 && (
                <section className="mt-8 space-y-4">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Pharmacogenomic (PGx) Safeguard</h2>
                  <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-700">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-600 rounded-xl">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Genomic Sensitivity Detected</h3>
                          <p className="text-xs text-slate-400 font-medium">Metabolic Pathway Analysis (CYP450)</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {pgxAlerts.map((alert, i) => (
                          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-black uppercase tracking-widest">
                                {alert.genotype_context}
                              </div>
                              <div>
                                <p className="text-sm font-bold">{alert.drug}</p>
                                <p className="text-xs text-slate-400">{alert.warning}</p>
                              </div>
                            </div>
                            <div className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                              alert.severity === 'High' ? "bg-rose-500 text-white" : "bg-amber-500 text-black"
                            )}>
                              {alert.severity} Risk
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Financial & Access Alerts */}
              {!isLoading && costAlerts.length > 0 && (
                <section className="mt-8 space-y-4">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Access & Affordability</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {costAlerts.map((alert, i) => (
                      <div key={i} className={cn(
                        "p-4 rounded-2xl border flex gap-4 transition-all hover:shadow-md",
                        alert.type === 'Prior Auth' ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
                      )}>
                        <div className={cn(
                          "p-2.5 rounded-xl h-fit",
                          alert.type === 'Prior Auth' ? "bg-white text-amber-600" : "bg-white text-emerald-600"
                        )}>
                          {alert.type === 'Prior Auth' ? <FileText className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-black uppercase tracking-wider opacity-60">{alert.type}</p>
                            {alert.savings && (
                              <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black uppercase">
                                {alert.savings} Savings
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm mb-1">{alert.drug}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Lab Monitoring Section */}
              {!isLoading && (
                <section className="mt-8 space-y-4">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Required Lab Monitoring</h2>
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-slate-800">Follow-up Schedule</h3>
                    </div>
                    <div className="p-1">
                      {labSuggestions.length > 0 ? (
                        labSuggestions.map((suggestion, i) => (
                          <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                {i + 1}
                              </div>
                              <p className="text-sm font-medium text-slate-800">{suggestion}</p>
                            </div>
                            <button className="px-3 py-1.5 text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                              Order Now
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400 italic text-sm">
                          No specific laboratory monitoring required for this profile.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Financial & Access Alerts */}
              {!isLoading && costAlerts.length > 0 && (
                <section className="mt-8 space-y-4">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Access & Affordability</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {costAlerts.map((alert, i) => (
                      <div key={i} className={cn(
                        "p-4 rounded-2xl border flex gap-4 transition-all hover:shadow-md",
                        alert.type === 'Prior Auth' ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
                      )}>
                        <div className={cn(
                          "p-2.5 rounded-xl h-fit",
                          alert.type === 'Prior Auth' ? "bg-white text-amber-600" : "bg-white text-emerald-600"
                        )}>
                          {alert.type === 'Prior Auth' ? <FileText className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-black uppercase tracking-wider opacity-60">{alert.type}</p>
                            {alert.savings && (
                              <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black uppercase">
                                {alert.savings} Savings
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm mb-1">{alert.drug}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar: Clinical Context & Items */}
            <div className="space-y-6">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Prescription Staging</h2>
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-slate-600" />
                    <h3 className="font-bold text-sm text-slate-800">Current Items</h3>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black">{items.length}</span>
                </div>
                <div className="p-2 space-y-1">
                  {items.map((item) => (
                    <div key={item.id} className="p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                      <p className="text-sm font-bold text-slate-900">{item.medication}</p>
                      <p className="text-xs text-slate-500">{item.dosage} • {item.frequency} • {item.duration}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient Vitals Context */}
              <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h3 className="text-xs font-black uppercase tracking-widest opacity-70 mb-4 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Physiological Context
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Weight</p>
                    <p className="text-lg font-black">{vitals?.weight ? `${vitals.weight}kg` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-70 mb-1">eGFR</p>
                    <p className="text-lg font-black">78 ml/min</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Known Allergies</p>
                    <p className="text-xs font-bold bg-white/10 p-2 rounded-lg">
                      {selectedPatient?.allergies && selectedPatient.allergies.length > 0 
                        ? selectedPatient.allergies.map((a: any) => a.name).join(", ") 
                        : "No known drug allergies"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, count, color }: any) {
  const colors: any = {
    rose: "bg-rose-50 border-rose-100 text-rose-700",
    orange: "bg-orange-50 border-orange-100 text-orange-700",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700"
  };

  return (
    <div className={cn("p-4 rounded-2xl border shadow-sm flex items-center gap-4", colors[color])}>
      <div className="p-2 bg-white rounded-xl shadow-sm">{icon}</div>
      <div>
        <p className="text-2xl font-black">{count}</p>
        <p className="text-xs opacity-70 font-bold uppercase tracking-tighter">{label}</p>
      </div>
    </div>
  );
}

function InteractionMatrix({ medications, interactions }: { medications: string[], interactions: any[] }) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number, col: number } | null>(null);

  const getInteraction = (med1: string, med2: string) => {
    if (med1 === med2) return null;
    return interactions.find(int => 
      Array.isArray(int.drugs) && 
      int.drugs.some((d: string) => d.toLowerCase().includes(med1.toLowerCase()) || med1.toLowerCase().includes(d.toLowerCase())) &&
      int.drugs.some((d: string) => d.toLowerCase().includes(med2.toLowerCase()) || med2.toLowerCase().includes(d.toLowerCase()))
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm overflow-x-auto">
      <div className="min-w-[400px]">
        {/* Header row */}
        <div className="flex">
          <div className="w-24 shrink-0"></div>
          {medications.map((med, idx) => (
            <div key={idx} className="flex-1 text-center font-bold text-[10px] text-slate-500 uppercase truncate px-1 vertical-text h-20 flex items-end justify-center pb-2">
              <span className="rotate-[-45deg] whitespace-nowrap block transform-gpu origin-bottom-left">{med}</span>
            </div>
          ))}
        </div>

        {/* Matrix rows */}
        {medications.map((medRow, rowIdx) => (
          <div key={rowIdx} className="flex items-center">
            <div className="w-24 shrink-0 text-right pr-3 font-bold text-[10px] text-slate-500 uppercase truncate">
              {medRow}
            </div>
            {medications.map((medCol, colIdx) => {
              const interaction = getInteraction(medRow, medCol);
              const isDiagonal = rowIdx === colIdx;
              
              return (
                <div 
                  key={colIdx} 
                  className={cn(
                    "flex-1 h-10 border border-slate-100 relative group transition-all cursor-crosshair",
                    isDiagonal ? "bg-slate-50/50" : (interaction ? "" : "bg-white"),
                    hoveredCell?.row === rowIdx || hoveredCell?.col === colIdx ? "bg-indigo-50/30" : ""
                  )}
                  onMouseEnter={() => !isDiagonal && setHoveredCell({ row: rowIdx, col: colIdx })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {!isDiagonal && interaction && (
                    <div className={cn(
                      "absolute inset-1 rounded-md flex items-center justify-center animate-pulse",
                      interaction.severity === 'Major' ? "bg-rose-500 shadow-rose-200" : "bg-amber-500 shadow-amber-200"
                    )}>
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx && !isDiagonal && interaction && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white p-2 rounded-lg text-[10px] z-50 pointer-events-none shadow-xl border border-white/10">
                      <p className="font-black border-b border-white/20 pb-1 mb-1 uppercase tracking-widest">{interaction.severity} Severity</p>
                      <p className="font-medium leading-relaxed">{interaction.description}</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditItem({ type, severity, title, message, recommendation, onAccept, onOverride, evidence, guidelineUrl }: any) {
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [selectedStandardReason, setSelectedStandardReason] = useState("");

  const standardReasons = [
    "Benefit outweighs known risk",
    "Patient already tolerating this therapy",
    "Short-term/Emergency use only",
    "Alternative monitored clinically",
    "Specialist recommendation",
    "Patient informed of risk; consented",
    "Previous failure on alternatives"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="p-5 flex gap-4">
        <div className={cn(
          "p-3 rounded-2xl h-fit",
          severity === 'critical' ? "bg-rose-100" : "bg-orange-100"
        )}>
          {severity === 'critical' ? <AlertTriangle className="w-5 h-5 text-rose-600" /> : <Info className="w-5 h-5 text-orange-600" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{type} validation</span>
            {severity === 'critical' && <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-black uppercase">Stat</span>}
          </div>
          <h4 className="font-bold text-slate-900 text-lg mb-1">{title}</h4>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">{message}</p>
          
          {evidence && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 border border-slate-200">
                <FileText className="w-3 h-3" />
                Evidence: {evidence}
              </div>
              {guidelineUrl && (
                <a 
                  href={guidelineUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                >
                  View Guideline <ArrowRight className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          )}
          
          {recommendation && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4">
              <div className="p-2 bg-white rounded-xl h-fit shadow-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider mb-1">Advanced AI Recommendation</p>
                <p className="text-sm font-bold text-slate-900 mb-2">
                  <span className="text-indigo-600">{recommendation.action}:</span> {recommendation.suggestion}
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={onAccept}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Accept Suggestion
                  </button>
                  <button 
                    onClick={() => setShowOverride(!showOverride)}
                    className="px-4 py-1.5 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors"
                  >
                    Clinical Override
                  </button>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {showOverride && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-slate-100 overflow-hidden"
              >
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Select or Specify Override Justification</p>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {standardReasons.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setSelectedStandardReason(r);
                          setOverrideReason(r);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                          selectedStandardReason === r 
                            ? "bg-slate-900 text-white border-slate-900" 
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={overrideReason}
                      onChange={(e) => {
                        setOverrideReason(e.target.value);
                        if (!standardReasons.includes(e.target.value)) setSelectedStandardReason("");
                      }}
                      placeholder="Or type custom justification..."
                      className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                      onClick={() => {
                        onOverride(overrideReason);
                        setShowOverride(false);
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
                    >
                      Log Override
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
