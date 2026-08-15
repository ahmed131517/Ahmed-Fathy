import React, { useState } from 'react';
import { 
  BrainCircuit, ShieldAlert, CheckCircle, AlertTriangle, Calculator,
  Building2, BookOpen, FileText, Activity, RefreshCw, X, ChevronRight,
  Sparkles, DollarSign, Stethoscope, Pill
} from 'lucide-react';
import { optimizePrescriptionRegimen, AIPrescriptionOptimizationResult } from '../../database/engines/aiPrescriptionEngine';
import { getGuidelineForCondition, getAllClinicalGuidelines } from '../../database/engines/guidelineEngine';
import { searchEgyptianBrands } from '../../database/engines/egyptianBrandEngine';
import { generatePatientCounselingLeaflet } from '../../database/engines/patientEducationEngine';
import { evaluatePatientMonitoringPlan } from '../../database/engines/monitoringEngine';
import { calculateCockcroftGault, calculateChildPugh } from '../../database/calculators/clinicalCalculators';

interface ClinicalIntelligenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  diagnosis: string;
  prescribedMedications: string[];
}

export const ClinicalIntelligenceDrawer: React.FC<ClinicalIntelligenceDrawerProps> = ({
  isOpen,
  onClose,
  patient,
  diagnosis,
  prescribedMedications
}) => {
  const [activeTab, setActiveTab] = useState<'optimizer' | 'guidelines' | 'calculators' | 'egyptian_brands' | 'counseling' | 'monitoring'>('optimizer');

  // Optimizer state
  const [optResult, setOptResult] = useState<AIPrescriptionOptimizationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calculator inputs
  const [calcAge, setCalcAge] = useState(patient?.age || 45);
  const [calcWeight, setCalcWeight] = useState(70);
  const [calcScr, setCalcScr] = useState(1.0);
  const [calcGender, setCalcGender] = useState<'male' | 'female'>(patient?.gender?.toLowerCase() === 'female' ? 'female' : 'male');
  
  const [liverBili, setLiverBili] = useState(1.0);
  const [liverAlb, setLiverAlb] = useState(4.0);
  const [liverINR, setLiverINR] = useState(1.0);

  // Egyptian Brands search state
  const [brandSearchInput, setBrandSearchInput] = useState(prescribedMedications[0] || 'Amoxicillin');
  
  // Patient Counseling selection
  const [counselingMed, setCounselingMed] = useState(prescribedMedications[0] || 'Amoxicillin');

  if (!isOpen) return null;

  const handleRunOptimization = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = optimizePrescriptionRegimen({
        patientName: patient?.name || 'Patient',
        age: calcAge,
        gender: calcGender,
        weightKg: calcWeight,
        scrMgDl: calcScr,
        isPregnant: patient?.isPregnant || false,
        trimester: patient?.trimester || 1,
        isLactating: patient?.isLactating || false,
        allergies: patient?.allergies?.map((a: any) => typeof a === 'string' ? a : a.name) || [],
        diagnosis: diagnosis || 'General Medical Consultation',
        prescribedMedications: prescribedMedications.length > 0 ? prescribedMedications : ['Amoxicillin', 'Enalapril'],
        liverBilirubin: liverBili,
        liverAlbumin: liverAlb,
        liverINR: liverINR
      });
      setOptResult(res);
      setIsAnalyzing(false);
    }, 400);
  };

  // Calculator computations
  const cgResult = calculateCockcroftGault({
    age: calcAge,
    weightKg: calcWeight,
    serumCreatinineMgDl: calcScr,
    sex: calcGender
  });

  const cpResult = calculateChildPugh({
    totalBilirubinMgDl: liverBili,
    serumAlbuminGDl: liverAlb,
    inr: liverINR,
    ascites: 'none',
    encephalopathy: 'none'
  });

  const selectedGuideline = getGuidelineForCondition(diagnosis);
  const allGuidelines = getAllClinicalGuidelines();

  const brandResult = searchEgyptianBrands(brandSearchInput);
  const counselingLeaflet = generatePatientCounselingLeaflet(counselingMed);
  const monitoringPlan = evaluatePatientMonitoringPlan(prescribedMedications.length > 0 ? prescribedMedications : ['Metformin', 'Enalapril']);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-4xl bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Tier 3 Clinical Intelligence Hub
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI Prescribing Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Patient: <span className="text-slate-200 font-medium">{patient?.name || 'Active Case'}</span> | Diagnosis: <span className="text-cyan-400 font-medium">{diagnosis || 'General Evaluation'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-4 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('optimizer')}
            className={`px-3 py-2.5 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'optimizer'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Regimen Optimizer
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-3 py-2.5 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'guidelines'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Clinical Guidelines
          </button>

          <button
            onClick={() => setActiveTab('calculators')}
            className={`px-3 py-2.5 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'calculators'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Organ Adjusters (CG / Child-Pugh)
          </button>

          <button
            onClick={() => setActiveTab('egyptian_brands')}
            className={`px-3 py-2.5 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'egyptian_brands'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Egyptian Brands & EGP Prices
          </button>

          <button
            onClick={() => setActiveTab('counseling')}
            className={`px-3 py-2.5 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'counseling'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Patient Counseling Leaflet
          </button>

          <button
            onClick={() => setActiveTab('monitoring')}
            className={`px-3 py-2.5 text-xs font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'monitoring'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Lab Monitoring Protocols
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: AI OPTIMIZER */}
          {activeTab === 'optimizer' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm">Holistic Prescription Optimizer</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluates Renal CrCl, Child-Pugh, Allergies, Pregnancy/Lactation, & Guidelines simultaneously.
                  </p>
                </div>
                <button
                  onClick={handleRunOptimization}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  {isAnalyzing ? 'Analyzing Regimen...' : 'Run Safety & Dose Optimization'}
                </button>
              </div>

              {optResult && (
                <div className="space-y-4">
                  {/* Summary Banner */}
                  <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                    optResult.overallSafetyStatus === 'SAFE' 
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : optResult.overallSafetyStatus === 'ADJUSTMENT_REQUIRED'
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                  }`}>
                    {optResult.overallSafetyStatus === 'SAFE' && <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />}
                    {optResult.overallSafetyStatus === 'ADJUSTMENT_REQUIRED' && <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />}
                    {optResult.overallSafetyStatus === 'HIGH_RISK_CONTRAINDICATED' && <ShieldAlert className="w-5 h-5 text-rose-400 mt-0.5" />}
                    <div>
                      <div className="font-bold text-sm uppercase tracking-wider">
                        Overall Regimen Status: {optResult.overallSafetyStatus.replace('_', ' ')}
                      </div>
                      <p className="text-xs mt-1 leading-relaxed opacity-90">
                        {optResult.clinicalSummaryRationale}
                      </p>
                    </div>
                  </div>

                  {/* Calculated Quick Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-xs text-slate-400">Renal CrCl</span>
                      <div className="text-lg font-bold text-cyan-400">{optResult.crClMlMin} <span className="text-xs font-normal text-slate-400">mL/min</span></div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-xs text-slate-400">Hepatic Function</span>
                      <div className="text-lg font-bold text-cyan-400">{optResult.childPughClass || 'Normal'}</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-xs text-slate-400">Guideline Basis</span>
                      <div className="text-sm font-semibold text-slate-200">{optResult.guidelineSociety || 'Standard Protocols'}</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-xs text-slate-400">Medications Analyzed</span>
                      <div className="text-lg font-bold text-cyan-400">{optResult.optimizedRegimen.length}</div>
                    </div>
                  </div>

                  {/* Line Item Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Individual Drug Regimen Analysis</h4>
                    {optResult.optimizedRegimen.map((drug, idx) => (
                      <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                            <Pill className="w-4 h-4 text-cyan-400" />
                            {drug.medicationName}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            drug.safetyScore === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            drug.safetyScore === 'Caution' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {drug.safetyScore}
                          </span>
                        </div>

                        <div className="text-xs grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 pt-1">
                          <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recommended Dosing</span>
                            <span className="font-medium text-cyan-300">{drug.recommendedDose}</span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Clinical Rationale</span>
                            <span>{drug.adjustmentReason}</span>
                          </div>
                        </div>

                        {drug.warnings.length > 0 && (
                          <div className="bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-lg text-xs text-rose-300 space-y-1">
                            {drug.warnings.map((w, wIdx) => (
                              <div key={wIdx} className="flex items-start gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                <span>{w}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-[11px] text-slate-400 flex flex-wrap gap-2 pt-1 border-t border-slate-900">
                          <span className="text-slate-300 font-medium">Egyptian Alternatives (Avg ~{drug.avgPriceEgp} EGP):</span>
                          {drug.egyptianBrands.slice(0, 2).map((b, bIdx) => (
                            <span key={bIdx} className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GUIDELINES */}
          {activeTab === 'guidelines' && (
            <div className="space-y-6">
              {selectedGuideline ? (
                <div className="bg-slate-950 p-5 rounded-xl border border-cyan-500/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{selectedGuideline.society} Guideline Protocol</span>
                      <h3 className="text-base font-bold text-slate-100">{selectedGuideline.condition}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 text-xs font-semibold border border-cyan-500/20">
                      {selectedGuideline.evidenceLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedGuideline.recommendation}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> First-Line Regimens
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                        {selectedGuideline.firstLineTherapy.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <ChevronRight className="w-4 h-4" /> Second-Line / Alternatives
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                        {selectedGuideline.secondLineTherapy.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800 italic">
                    Note: {selectedGuideline.notes}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                  No direct guideline match found for diagnosis "{diagnosis}". Browsing standard protocols below:
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">All Guideline Knowledge Repositories</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allGuidelines.map((g, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{g.condition}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                          {g.society}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{g.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CALCULATORS */}
          {activeTab === 'calculators' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Cockcroft-Gault Widget */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-2">
                    <Calculator className="w-5 h-5" />
                    <h3 className="font-bold text-sm text-slate-100">Cockcroft-Gault Renal Estimator</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Age (Years)</label>
                      <input 
                        type="number" 
                        value={calcAge} 
                        onChange={e => setCalcAge(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Weight (kg)</label>
                      <input 
                        type="number" 
                        value={calcWeight} 
                        onChange={e => setCalcWeight(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Serum Creatinine (mg/dL)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={calcScr} 
                        onChange={e => setCalcScr(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Gender</label>
                      <select 
                        value={calcGender}
                        onChange={e => setCalcGender(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">Calculated CrCl</span>
                      <span className="text-xl font-bold text-cyan-400">{cgResult.crcl} mL/min</span>
                    </div>
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {cgResult.stage}
                    </span>
                  </div>
                </div>

                {/* Child-Pugh Hepatic Widget */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-2">
                    <Stethoscope className="w-5 h-5" />
                    <h3 className="font-bold text-sm text-slate-100">Child-Pugh Hepatic Score</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Bilirubin (mg/dL)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={liverBili} 
                        onChange={e => setLiverBili(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Albumin (g/dL)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={liverAlb} 
                        onChange={e => setLiverAlb(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">INR</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={liverINR} 
                        onChange={e => setLiverINR(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">Child-Pugh Score & Class</span>
                      <span className="text-xl font-bold text-cyan-400">Score {cpResult.score} ({cpResult.class})</span>
                    </div>
                    <span className="text-xs text-slate-300">
                      {cpResult.severity}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: EGYPTIAN BRANDS */}
          {activeTab === 'egyptian_brands' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300 block">Search Generic Medication for Local Egyptian Market Trade Names</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={brandSearchInput}
                    onChange={e => setBrandSearchInput(e.target.value)}
                    placeholder="e.g. Amoxicillin, Enalapril, Metformin..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-slate-400">Generic Drug</span>
                    <h3 className="text-base font-bold text-cyan-400">{brandResult.genericName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Average Local Market Price</span>
                    <div className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" /> {brandResult.averagePriceEgp} EGP
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Available Local Commercial Brands</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {brandResult.brands.map((b, idx) => (
                      <div key={idx} className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-200">{b.brand_name}</span>
                          <span className="text-xs font-bold text-emerald-400">{b.price_egp} EGP</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center justify-between">
                          <span>{b.company}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            b.availability === 'Available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {b.availability}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PATIENT COUNSELING */}
          {activeTab === 'counseling' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-300 font-medium">Select Medication for Patient Leaflet:</span>
                <select 
                  value={counselingMed}
                  onChange={e => setCounselingMed(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
                >
                  {(prescribedMedications.length > 0 ? prescribedMedications : ['Amoxicillin', 'Enalapril', 'Metformin', 'Omeprazole']).map((m, idx) => (
                    <option key={idx} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {counselingLeaflet ? (
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-6">
                  <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Patient Education Leaflet</span>
                      <h3 className="text-xl font-bold text-slate-100">{counselingLeaflet.medicationName}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Commercial Brands: {counselingLeaflet.brandNames.join(', ')}</p>
                    </div>
                    <button 
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded border border-slate-700 flex items-center gap-1.5"
                    >
                      Print Leaflet
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-cyan-400">Food & Administration</span>
                      <p className="text-slate-300">{counselingLeaflet.counseling.food}</p>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-cyan-400">Missed Dose Protocol</span>
                      <p className="text-slate-300">{counselingLeaflet.counseling.missedDose}</p>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-cyan-400">Storage Guidance</span>
                      <p className="text-slate-300">{counselingLeaflet.storage}</p>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-cyan-400">Pregnancy / Lactation Note</span>
                      <p className="text-slate-300">{counselingLeaflet.counseling.pregnancyAdvice}</p>
                    </div>
                  </div>

                  <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Emergency Symptoms requiring immediate medical attention:
                    </span>
                    <ul className="list-disc list-inside text-rose-300 space-y-1">
                      {counselingLeaflet.counseling.emergencySymptoms.map((symp, idx) => (
                        <li key={idx}>{symp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                  No counseling leaflet found for {counselingMed}.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MONITORING PROTOCOLS */}
          {activeTab === 'monitoring' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Required Laboratory & Monitoring Checklists</h3>
              {monitoringPlan.map((plan, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-sm text-cyan-400">{plan.medicationName}</span>
                    <span className="text-xs text-slate-400">{plan.frequency}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-emerald-400 font-bold block mb-1">Baseline Labs Needed</span>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {plan.baselineLabs.map((lab, lIdx) => (
                          <li key={lIdx}>{lab}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-cyan-400 font-bold block mb-1">Ongoing Monitoring</span>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {plan.ongoingLabs.map((lab, lIdx) => (
                          <li key={lIdx}>{lab}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded text-xs text-slate-300 border border-slate-800 italic">
                    Clinical Action: {plan.clinicalAction}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
