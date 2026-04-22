import React, { useMemo, useState } from 'react';
import { AlertTriangle, ShieldCheck, ArrowRight, Info, AlertOctagon, Activity, FileWarning, Search, Zap, Pill, Baby, BrainCircuit, X, Stethoscope } from 'lucide-react';
import { ClinicalPathwayRule } from '@/data/clinicalPathways';
import { ALL_MODELS } from '@/data/symptomModels';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// --- TYPES & LOGIC (Merged from clinicalGuardrailService) ---

export type GuardrailSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export type GuardrailLayer = 
  | 'History Completion'
  | 'Consistency Validation'
  | 'Cross-System Correlation'
  | 'Medication-Symptom Interaction'
  | 'Demographic-Specific Escalation'
  | 'Mandatory Red Flag Check'
  | 'Emergency Escalation'
  | 'Syndrome Layer';

export interface GuardrailAlert {
  id: string;
  layer: GuardrailLayer;
  severity: GuardrailSeverity;
  title: string;
  message: string;
  actionRequired?: string;
  metadata?: any;
}

export interface EncounterState {
  selectedSymptoms: any[];
  patient: any;
  vitals?: {
    heartRate?: number;
    bpSys?: number;
    bpDia?: number;
    respRate?: number;
    temp?: number;
    oxygenSat?: number;
    weight?: number;
    oxygenType?: string;
  };
}

/**
 * Core Clinical Guardrail Evaluation Engine
 */
export function evaluateClinicalGuardrails(state: EncounterState): GuardrailAlert[] {
  const alerts: GuardrailAlert[] = [];
  const { selectedSymptoms, patient, vitals } = state;

  if (selectedSymptoms.length === 0) return [];

  const allModelsArray = Object.values(ALL_MODELS).flat();

  // LAYER 1 & 3: Mandatory Red Flag Checks & History Completeness
  selectedSymptoms.forEach(s => {
    const model = allModelsArray.find(m => m.id === s.id);
    if (!model) return;

    const missingDimensions = [];
    if (!s.analysisData?.onset) missingDimensions.push('Onset');
    if (!s.analysisData?.duration) missingDimensions.push('Duration');
    if (!s.severityTimeline || s.severityTimeline.length === 0) missingDimensions.push('Severity Timeline');
    
    if (missingDimensions.length > 0) {
      alerts.push({
        id: `missing-${s.id}`,
        layer: 'History Completion',
        severity: 'info',
        title: `History Completion: ${s.label}`,
        message: `Clinical standards require: ${missingDimensions.join(', ')}.`,
        actionRequired: `Please clarify the ${missingDimensions.join(' and ')} for this symptom.`
      });
    }

    if (model.redFlags && model.redFlags.length > 0) {
      const addressed = s.analysisData?.redFlags || [];
      const unaddressed = model.redFlags.filter((rf: string) => !addressed.includes(rf));
      
      if (addressed.length === 0) {
        alerts.push({
          id: `redflag-check-${s.id}`,
          layer: 'Mandatory Red Flag Check',
          severity: 'warning',
          title: `Mandatory Red Flag Check: ${s.label}`,
          message: `This symptom cluster has ${unaddressed.length} critical excluded conditions.`,
          actionRequired: `Must explicitly rule out: ${unaddressed.slice(0, 2).join(', ')}...`
        });
      }
    }
  });

  // LAYER 2: Cross-System Checks
  const hasNeuro = selectedSymptoms.some(s => s.category === 'neurological' || s.id.startsWith('neuro_'));
  const hasEye = selectedSymptoms.some(s => s.category === 'eye' || s.id.startsWith('eye_'));
  const hasCardiac = selectedSymptoms.some(s => s.category === 'heart' || s.id.startsWith('heart_'));
  const hasResp = selectedSymptoms.some(s => s.category === 'lungs' || s.id.startsWith('lungs_'));
  const hasGI = selectedSymptoms.some(s => s.category === 'digestive' || s.id.startsWith('digestive_'));
  const hasWeightLoss = selectedSymptoms.some(s => s.id === 'gen_weight_loss');
  const hasFever = selectedSymptoms.some(s => s.id === 'gen_fever');
  const hasRash = selectedSymptoms.some(s => s.category === 'skin' || s.id.startsWith('skin_'));

  if (hasNeuro && hasEye) {
    alerts.push({
      id: 'cross-neuro-vision',
      layer: 'Cross-System Correlation',
      severity: 'critical',
      title: 'Neuro-Visual Guardrail',
      message: 'Concurrent Neuro + Vision symptoms detected.',
      actionRequired: 'Must rule out Stroke, Multiple Sclerosis (MS), or intracranial hypertension.'
    });
  }

  if (hasCardiac && hasResp) {
    alerts.push({
      id: 'cross-cardiac-resp',
      layer: 'Cross-System Correlation',
      severity: 'emergency',
      title: 'Cardiopulmonary Guardrail',
      message: 'Heart + Lung symptoms detected.',
      actionRequired: 'Rule out Pulmonary Embolism (PE), MI, or Heart Failure.'
    });
  }

  if ((hasGI || hasResp) && hasWeightLoss) {
    alerts.push({
      id: 'cross-system-weight-loss',
      layer: 'Cross-System Correlation',
      severity: 'critical',
      title: 'Malignancy/Chronic Guardrail',
      message: 'Systemic weight loss with organ symptoms.',
      actionRequired: 'Must rule out Malignancy, TB, or Chronic Inflammation.'
    });
  }

  if (hasFever && hasRash) {
    alerts.push({
      id: 'cross-fever-rash',
      layer: 'Cross-System Correlation',
      severity: 'emergency',
      title: 'Sepsis/Autoimmune Guardrail',
      message: 'Fever + Skin symptoms.',
      actionRequired: 'Examine for Sepsis, Meningococcemia, or systemic autoimmune flare.'
    });
  }

  // Mandatory cluster checks
  const hasHeadache = selectedSymptoms.some(s => s.id.includes('headache'));
  if (hasHeadache) {
    alerts.push({
      id: 'cluster-headache',
      layer: 'Mandatory Red Flag Check',
      severity: 'critical',
      title: 'Mandatory Headache Rule-outs',
      message: 'Headache presentation requires investigation of acute intracranial events.',
      actionRequired: 'Must rule out Subarachnoid Hemorrhage (SAH), Meningitis, and Temporal Arteritis.'
    });
  }

  const hasHematuria = selectedSymptoms.some(s => s.id === 'kidney_blood_urine');
  if (hasHematuria) {
    alerts.push({
      id: 'cluster-hematuria',
      layer: 'Mandatory Red Flag Check',
      severity: 'critical',
      title: 'Mandatory Hematuria Rule-outs',
      message: 'Gross or microscopic hematuria requires malignancy screening.',
      actionRequired: 'Stat workup for Renal/Bladder Malignancy and Urolithiasis (Stones).'
    });
  }

  if (hasWeightLoss) {
    alerts.push({
      id: 'cluster-weight-loss',
      layer: 'Mandatory Red Flag Check',
      severity: 'critical',
      title: 'Mandatory Weight Loss Rule-outs',
      message: 'Unexplained weight loss is "Cancer until proven otherwise".',
      actionRequired: 'Comprehensive screen for Malignancy, TB, and Hyperthyroidism.'
    });
  }

  // LAYER 4: Consistency Validation
  if (vitals) {
    const hasAnxiety = selectedSymptoms.some(s => s.id.includes('anxiety'));
    if (vitals.heartRate && vitals.heartRate > 120 && hasAnxiety) {
      alerts.push({
        id: 'consistency-tachy-anxiety',
        layer: 'Consistency Validation',
        severity: 'warning',
        title: 'Somatization vs Pathology',
        message: 'Heart rate > 120 with Anxiety.',
        actionRequired: 'Perform EKG to distinguish between Panic Attack and supraventricular tachycardia.'
      });
    }

    const hasDizzy = selectedSymptoms.some(s => s.id.includes('dizziness'));
    const hasHeavyBleeding = selectedSymptoms.some(s => s.id === 'female_abnormal_bleeding');
    if (hasDizzy && hasHeavyBleeding && vitals.heartRate && vitals.heartRate > 100) {
      alerts.push({
        id: 'consistency-bleeding-dizzy',
        layer: 'Consistency Validation',
        severity: 'critical',
        title: 'Hemodynamic Stability',
        message: 'Heavy bleeding + Dizziness + Tachycardia.',
        actionRequired: 'Rule out Acute Anemia or Hypovolemia.'
      });
    }
  }

  // --- NEW LAYERS (1, 2, 4, 5, 6) ---

  // LAYER 6: Iatrogenic (Medication-Symptom Interaction)
  const meds = patient.medications || [];
  const hasCough = selectedSymptoms.some(s => s.id.includes('cough'));
  const onACEi = meds.some((m: string) => 
    ['lisinopril', 'enalapril', 'ramipril', 'captopril'].some(name => m.toLowerCase().includes(name))
  );
  if (hasCough && onACEi) {
    alerts.push({
      id: 'iatrogenic-acei-cough',
      layer: 'Medication-Symptom Interaction',
      severity: 'warning',
      title: 'Potential Medication Side Effect',
      message: 'Dry cough detected in patient on ACE Inhibitor.',
      actionRequired: 'Review medication; consider switching to ARB if cough is persistent.'
    });
  }

  const hasBruising = selectedSymptoms.some(s => s.id.includes('bruising') || s.id.includes('bleeding'));
  const onAnticoagulant = meds.some((m: string) => 
    ['warfarin', 'apixaban', 'rivaroxaban', 'eliquis', 'xarelto', 'coumadin'].some(name => m.toLowerCase().includes(name))
  );
  if (hasBruising && onAnticoagulant) {
    alerts.push({
      id: 'iatrogenic-anticoag-bruise',
      layer: 'Medication-Symptom Interaction',
      severity: 'critical',
      title: 'Anticoagulation Guardrail',
      message: 'Bruising/Bleeding detected while on Anticoagulants.',
      actionRequired: 'Mandatory Coagulation Check: Verify INR (if Warfarin) or assess for occult GI bleeding.'
    });
  }

  // LAYER 7: High-Risk (Demographic-Specific Escalation)
  const isPregnant = patient.conditions?.some((c: string) => c.toLowerCase().includes('pregnant') || c.toLowerCase().includes('pregnancy'));
  const hasVisionChange = selectedSymptoms.some(s => s.category === 'eye');
  if (isPregnant && (hasHeadache || hasVisionChange)) {
    alerts.push({
      id: 'highrisk-preg-headache',
      layer: 'Demographic-Specific Escalation',
      severity: 'emergency',
      title: 'Pre-eclampsia Guardrail',
      message: 'Headache/Vision changes in a pregnant patient.',
      actionRequired: 'STAT Blood Pressure and Urinalysis (Proteinuria) to rule out Pre-eclampsia.'
    });
  }

  // LAYER 8: Syndrome Layer
  const hasTachycardia = vitals && vitals.heartRate && vitals.heartRate > 100;
  const hasHypotension = vitals && vitals.bpSys && vitals.bpSys < 90;

  if (hasFever && hasTachycardia && hasHypotension) {
    alerts.push({
      id: 'syndrome-sepsis-screening',
      layer: 'Syndrome Layer',
      severity: 'emergency',
      title: 'SIRS / Sepsis Syndrome Screening',
      message: 'Fever + Tachycardia + Hypotension detected.',
      actionRequired: 'Initiate sepsis protocol workup (lactate, blood cultures, fluids).'
    });
  }

  if (patient.age < 1 && hasFever) {
    alerts.push({
      id: 'highrisk-neonate-fever',
      layer: 'Demographic-Specific Escalation',
      severity: 'emergency',
      title: 'Neonatal Fever Alert',
      message: 'Fever in a neonate (< 28 days or infant) is a high-risk event.',
      actionRequired: 'Full Sepsis Workup required; consider hospital admission for IV antibiotics.'
    });
  }

  // LAYER 8: Behavioral & Consistency (Refining)
  selectedSymptoms.forEach(s => {
    const isSudden = s.analysisData?.onset?.includes('sudden');
    const isChronic = s.analysisData?.duration?.includes('weeks') || s.analysisData?.duration?.includes('months');
    if (isSudden && isChronic) {
      alerts.push({
        id: `consistency-conflict-${s.id}`,
        layer: 'Consistency Validation',
        severity: 'warning',
        title: 'Temporal Conflict Detected',
        message: `For "${s.label}", onset is marked as "Sudden" but duration is "Weeks/Months".`,
        actionRequired: 'Clarify if this is an acute-on-chronic event or a data entry error.'
      });
    }
  });

  // LAYER 9: Differential Bias (Red Herrings)
  const isFemale = patient.gender === 'female';
  const hasShoulderPain = selectedSymptoms.some(s => s.id.includes('shoulder_pain'));
  if (isFemale && patient.age > 50 && hasShoulderPain) {
    alerts.push({
      id: 'bias-female-shoulder-mi',
      layer: 'Demographic-Specific Escalation',
      severity: 'critical',
      title: 'Atypical MI Presentation',
      message: 'Women > 50 with isolated shoulder pain may be presenting with referred cardiac ischemia.',
      actionRequired: 'Obtain EKG to rule out Atypical Myocardial Infarction.'
    });
  }

  const isElderly = patient.age > 65;
  const hasEpigastricPain = selectedSymptoms.some(s => s.id.includes('epigastric_pain') || s.id.includes('stomach_pain'));
  if (isElderly && hasEpigastricPain) {
    alerts.push({
      id: 'bias-elderly-gastric-mi',
      layer: 'Demographic-Specific Escalation',
      severity: 'critical',
      title: 'GERD Mimic: Inferior MI',
      message: 'Elderly patients with epigastric pain often have inferior wall cardiac events.',
      actionRequired: 'Mandatory EKG to rule out Inferior MI masquerading as dyspepsia.'
    });
  }

  // LAYER 10: The "Safety Net" discharge instruction check
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency');
  if (criticalAlerts.length > 0) {
    alerts.push({
      id: 'safetynet-discharge-instructions',
      layer: 'Emergency Escalation',
      severity: 'info',
      title: 'Mandatory Safety Net Instructions',
      message: `${criticalAlerts.length} high-severity risks identified. Discharge requires explicit 'Return to ER' criteria.`,
      actionRequired: "Ensure SOAP Plan includes: 'Return immediately if chest pain increases, shortness of breath worsens, or neurological signs appear'."
    });
  }

  // LAYER 5: Emergency Escalation Logic
  const hasChestPain = selectedSymptoms.some(s => s.id.includes('chest_pain'));
  const hasDiaphoresis = selectedSymptoms.some(s => s.analysisData?.associated?.includes('sweating') || s.analysisData?.associated?.includes('diaphoresis'));
  
  if (hasChestPain && hasDiaphoresis) {
    alerts.push({
      id: 'emergency-mi-pattern',
      layer: 'Emergency Escalation',
      severity: 'emergency',
      title: 'ER ESCALATION: ACS Pattern',
      message: 'Chest pain + Sweating/Diaphoresis is a classic MI presentation.',
      actionRequired: 'Stat EKG and Activate Cardiac Emergency pathway.'
    });
  }

  const suddenWeakness = selectedSymptoms.find(s => s.id.includes('weakness') && s.analysisData?.onset?.includes('sudden'));
  if (suddenWeakness) {
    alerts.push({
      id: 'emergency-stroke-pattern',
      layer: 'Emergency Escalation',
      severity: 'emergency',
      title: 'ER ESCALATION: Stroke Pathway',
      message: 'Sudden onset weakness is Stroke until proven otherwise.',
      actionRequired: 'Check time of onset and transport to nearest Stroke Center.'
    });
  }

  return alerts;
}

/**
 * Custom hook for Active Clinical Guardrails
 */
export function useClinicalGuardrails(state: EncounterState) {
  return useMemo(() => evaluateClinicalGuardrails(state), [state]);
}

// --- UI COMPONENT ---

interface ClinicalGuardrailsProps {
  activePathways: ClinicalPathwayRule[];
  state: EncounterState;
}

export function ClinicalGuardrails({ activePathways, state }: ClinicalGuardrailsProps) {
  const guardrailAlerts = useClinicalGuardrails(state);
  const [isOpen, setIsOpen] = useState(false);
  
  if (activePathways.length === 0 && guardrailAlerts.length === 0) return null;

  const getLayerIcon = (layer: string) => {
    switch (layer) {
      case 'Mandatory Red Flag Check': return <Search className="w-5 h-5 text-orange-600" />;
      case 'Cross-System Correlation': return <Activity className="w-5 h-5 text-purple-600" />;
      case 'History Completion': return <FileWarning className="w-5 h-5 text-blue-600" />;
      case 'Consistency Validation': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'Emergency Escalation': return <AlertOctagon className="w-5 h-5 text-red-600" />;
      case 'Medication-Symptom Interaction': return <Pill className="w-5 h-5 text-emerald-600" />;
      case 'Demographic-Specific Escalation': return <Baby className="w-5 h-5 text-pink-600" />;
      case 'Syndrome Layer': return <Stethoscope className="w-5 h-5 text-cyan-600" />;
      default: return <ShieldCheck className="w-5 h-5 text-slate-600" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'emergency': return "bg-red-50 border-red-200 ring-2 ring-red-500 animate-pulse";
      case 'critical': return "bg-red-50 border-red-200 shadow-md";
      case 'warning': return "bg-amber-50 border-amber-200";
      case 'info': return "bg-blue-50 border-blue-200";
      default: return "bg-slate-50 border-slate-200";
    }
  };

  const hasCritical = guardrailAlerts.some(a => a.severity === 'emergency' || a.severity === 'critical');

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-xl border shadow-sm transition-all text-left",
          hasCritical 
            ? "bg-red-50 hover:bg-red-100 border-red-200"
            : guardrailAlerts.length > 0 
              ? "bg-amber-50 hover:bg-amber-100 border-amber-200"
              : "bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShieldCheck className={cn("w-6 h-6", guardrailAlerts.length > 0 ? "text-red-500" : "text-indigo-600")} />
            {guardrailAlerts.length > 0 && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              Active Clinical Guardrails
              {guardrailAlerts.length > 0 && (
                <span className="text-[10px] bg-white border border-red-200 text-red-700 px-1.5 py-0.5 rounded font-black shadow-sm">
                  {guardrailAlerts.length} RECOMMENDATIONS
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">Click to view recommendations and required clinical actions</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex justify-center items-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 sm:p-5 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-indigo-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Clinical Guardrails</h2>
                    <p className="text-xs text-slate-500 font-medium">Automatic clinical safety and validation checks</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
                {guardrailAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-4 rounded-xl border transition-all relative overflow-hidden",
                      getSeverityStyles(alert.severity)
                    )}
                  >
                    {alert.severity === 'emergency' && (
                      <div className="absolute top-0 right-0 p-1 px-2 bg-red-600 text-white text-[8px] font-black uppercase tracking-tighter rounded-bl-lg">
                        Emergency Priority
                      </div>
                    )}

                    <div className="flex gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl shrink-0 h-fit shadow-sm",
                        alert.severity === 'emergency' ? "bg-red-100" : "bg-white/80"
                      )}>
                        {getLayerIcon(alert.layer)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{alert.layer} validation</span>
                          {alert.severity === 'critical' && <Zap className="w-3 h-3 text-red-500 fill-red-500" />}
                        </div>
                        
                        <h4 className="font-black text-slate-900 text-lg leading-tight mb-1">
                          {alert.title}
                        </h4>
                        
                        <p className="text-sm text-slate-700 mb-3">
                          {alert.message}
                        </p>

                        {alert.actionRequired && (
                          <div className="bg-slate-900/5 p-3 rounded-lg border border-slate-200/50 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
                              <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">Required Clinical Action:</span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 ml-5">
                              {alert.actionRequired}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Legacy/Standard Pathway Rules */}
                {activePathways.map((pathway) => (
                  <motion.div
                    key={pathway.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-4 rounded-xl border border-dashed transition-all",
                      pathway.actions.triageLevel === 'high' 
                        ? "bg-red-50/50 border-red-300" 
                        : "bg-blue-50/50 border-blue-300"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        pathway.actions.triageLevel === 'high' ? "bg-red-100" : "bg-blue-100"
                      )}>
                        <Info className={cn(
                          "w-5 h-5",
                          pathway.actions.triageLevel === 'high' ? "text-red-600" : "text-blue-600"
                        )} />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-800 mb-1">{pathway.title}</h4>
                        <p className="text-xs text-slate-600 mb-2">{pathway.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {pathway.actions.recommendations.map((rec, idx) => (
                            <span key={idx} className="text-[10px] bg-white/60 border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                              • {rec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
