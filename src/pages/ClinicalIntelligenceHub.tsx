import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as d3 from 'd3';
import { 
  BrainCircuit, ShieldAlert, CheckCircle, AlertTriangle, Calculator,
  Building2, BookOpen, FileText, Activity, RefreshCw, ArrowLeft, ChevronRight,
  Sparkles, DollarSign, Stethoscope, Pill, Clock, Plus, Trash2, Info, Calendar, ShieldCheck,
  CheckCircle2, Check, Maximize2, Minimize2, Baby, AlertOctagon, HeartPulse, X
} from 'lucide-react';
import { usePatient } from '@/lib/PatientContext';
import { db } from '@/lib/db';
import { DDINetworkMap } from '@/components/specialized/DDINetworkMap';
import { optimizePrescriptionRegimen, AIPrescriptionOptimizationResult, getFullStandardDose } from '@/database/engines/aiPrescriptionEngine';
import { getGuidelineForCondition, getAllClinicalGuidelines } from '@/database/engines/guidelineEngine';
import { searchEgyptianBrands } from '@/database/engines/egyptianBrandEngine';
import { generatePatientCounselingLeaflet } from '@/database/engines/patientEducationEngine';
import { evaluatePatientMonitoringPlan } from '@/database/engines/monitoringEngine';
import { calculateCockcroftGault, calculateChildPugh } from '@/database/calculators/clinicalCalculators';
import { checkDuplicateTherapy } from '@/database/engines/duplicateTherapyEngine';
import { evaluatePregnancySafety, evaluateLactationSafety } from '@/database/engines/pregnancyLactationEngine';
import { checkAllergyCrossReactivity } from '@/database/engines/allergyCrossReactivityEngine';

interface SemicircleGaugeProps {
  value: number | string;
  min?: number;
  max?: number;
  label: string;
  unit?: string;
  type: 'renal' | 'hepatic';
}

function SemicircleGauge({ value, min = 0, max = 150, label, unit, type }: SemicircleGaugeProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [uniqueId] = useState(() => Math.random().toString(36).substring(2, 9));

  let percentage = 0;
  let statusColor = 'text-emerald-400';
  let gradientColor = `url(#emerald-grad-${uniqueId})`;
  let statusLabel = 'Normal';

  if (type === 'renal') {
    const val = typeof value === 'number' ? value : parseFloat(value as string) || 90;
    // CrCl scale: 0 to 150
    percentage = Math.min(Math.max((val - min) / (max - min), 0), 1);
    
    if (val >= 90) {
      statusColor = 'text-emerald-400';
      gradientColor = `url(#emerald-grad-${uniqueId})`;
      statusLabel = 'Normal (G1)';
    } else if (val >= 60) {
      statusColor = 'text-teal-400';
      gradientColor = `url(#teal-grad-${uniqueId})`;
      statusLabel = 'Mild (G2)';
    } else if (val >= 30) {
      statusColor = 'text-amber-400';
      gradientColor = `url(#amber-grad-${uniqueId})`;
      statusLabel = 'Moderate (G3)';
    } else {
      statusColor = 'text-rose-400';
      gradientColor = `url(#rose-grad-${uniqueId})`;
      statusLabel = 'Severe (G4/5)';
    }
  } else {
    // Hepatic: Class A, B, C
    const val = String(value).toUpperCase().trim();
    if (val.includes('A')) {
      percentage = 0.85;
      statusColor = 'text-emerald-400';
      gradientColor = `url(#emerald-grad-${uniqueId})`;
      statusLabel = 'Class A (Mild)';
    } else if (val.includes('B')) {
      percentage = 0.5;
      statusColor = 'text-amber-400';
      gradientColor = `url(#amber-grad-${uniqueId})`;
      statusLabel = 'Class B (Mod)';
    } else if (val.includes('C')) {
      percentage = 0.2;
      statusColor = 'text-rose-400';
      gradientColor = `url(#rose-grad-${uniqueId})`;
      statusLabel = 'Class C (Sev)';
    } else {
      percentage = 0.85;
      statusColor = 'text-emerald-400';
      gradientColor = `url(#emerald-grad-${uniqueId})`;
      statusLabel = 'Class A (Mild)';
    }
  }

  useEffect(() => {
    // Trigger the sweeping animation after mount
    setAnimatedPercentage(0);
    const t = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 50);
    return () => clearTimeout(t);
  }, [percentage]);

  const radius = 38;
  const circumference = Math.PI * radius; // ~119.38
  const strokeDashoffset = circumference - (animatedPercentage * circumference);

  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[170px] shadow-lg transition-all hover:border-slate-700">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none transition-all group-hover:from-cyan-500/10" />
      
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</span>
      
      <div className="relative w-32 h-20 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-180" viewBox="0 0 100 60">
          <defs>
            <linearGradient id={`emerald-grad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id={`teal-grad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <linearGradient id={`amber-grad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id={`rose-grad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          
          {/* Background Track */}
          <path
            d="M 12 50 A 38 38 0 0 1 88 50"
            fill="none"
            stroke="#1e293b"
            strokeWidth="6"
            strokeLinecap="round"
          />
          
          {/* Glow / Backdrop Sweep */}
          <path
            d="M 12 50 A 38 38 0 0 1 88 50"
            fill="none"
            stroke={gradientColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            opacity="0.15"
            className="transition-all duration-1000 ease-out"
          />

          {/* Core Indicator Sweep */}
          <path
            d="M 12 50 A 38 38 0 0 1 88 50"
            fill="none"
            stroke={gradientColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />

          {/* Pointer/Needle */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="18"
            stroke={gradientColor}
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${animatedPercentage * 180 - 90}, 50, 50)`}
            className="transition-transform duration-1000 ease-out origin-[50px_50px]"
            opacity="0.85"
          />

          {/* Center Pin */}
          <circle
            cx="50"
            cy="50"
            r="3.5"
            fill="#020617"
            stroke={gradientColor}
            strokeWidth="1.5"
          />
        </svg>

        {/* Center reading */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <span className="text-xl font-black text-slate-100 tracking-tight leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-[9px] text-slate-400 mt-1 font-semibold tracking-wider">
              {unit}
            </span>
          )}
        </div>
      </div>
      
      {/* Status Badge */}
      <span className={`mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 ${statusColor} shadow-inner`}>
        {statusLabel}
      </span>
    </div>
  );
}

interface DosingCurveChartProps {
  type: 'renal' | 'hepatic';
  paramValue: number;
  onParamChange: (val: number) => void;
  age: number;
  weight: number;
  gender: string;
}

function DosingCurveChart({ type, paramValue, onParamChange, age, weight, gender }: DosingCurveChartProps) {
  const [selectedDrug, setSelectedDrug] = useState(type === 'renal' ? 'Metformin' : 'Paracetamol');
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const drugs = type === 'renal' 
    ? ['Metformin', 'Enalapril', 'Ciprofloxacin'] 
    : ['Paracetamol', 'Amiodarone', 'Rifampin'];

  const getSafeDosePct = (x: number): number => {
    if (type === 'renal') {
      const crcl = ((140 - age) * weight) / (72 * Math.max(0.1, x)) * (gender === 'female' ? 0.85 : 1);
      if (selectedDrug === 'Metformin') {
        if (crcl < 30) return 0;
        if (crcl < 45) return 25;
        if (crcl < 60) return 50;
        return 100;
      } else if (selectedDrug === 'Enalapril') {
        if (crcl < 10) return 25;
        if (crcl < 30) return 50;
        return 100;
      } else { // Ciprofloxacin
        if (crcl < 30) return 50;
        if (crcl < 50) return 75;
        return 100;
      }
    } else {
      if (selectedDrug === 'Paracetamol') {
        if (x > 4.0) return 25;
        if (x > 2.0) return 50;
        if (x > 1.2) return 75;
        return 100;
      } else if (selectedDrug === 'Amiodarone') {
        if (x > 5.0) return 33;
        if (x > 2.5) return 66;
        return 100;
      } else { // Rifampin
        if (x > 3.0) return 50;
        return 100;
      }
    }
  };

  const width = 380;
  const height = 180;
  const padding = { top: 15, right: 15, bottom: 35, left: 45 };

  const xMin = type === 'renal' ? 0.3 : 0.1;
  const xMax = type === 'renal' ? 6.0 : 10.0;
  const yMin = 0;
  const yMax = 120;

  const xScale = d3.scaleLinear()
    .domain([xMin, xMax])
    .range([padding.left, width - padding.right]);

  const yScale = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height - padding.bottom, padding.top]);

  const curvePoints: { x: number; y: number }[] = [];
  const stepPoints: { x: number; y: number }[] = [];
  const steps = 80;
  const stepSize = (xMax - xMin) / steps;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * stepSize;
    let clearancePct = 100;
    if (type === 'renal') {
      const crcl = ((140 - age) * weight) / (72 * x) * (gender === 'female' ? 0.85 : 1);
      clearancePct = Math.min(100, crcl);
    } else {
      clearancePct = 100 / (1 + Math.exp((x - 3.5) / 1.5));
    }
    curvePoints.push({ x, y: clearancePct });
    stepPoints.push({ x, y: getSafeDosePct(x) });
  }

  const lineGenerator = d3.line<{ x: number; y: number }>()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveMonotoneX);

  const stepGenerator = d3.line<{ x: number; y: number }>()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveStepAfter);

  const clearancePath = lineGenerator(curvePoints) || '';
  const dosePath = stepGenerator(stepPoints) || '';

  const areaGeneratorDose = d3.area<{ x: number; y: number }>()
    .x(d => xScale(d.x))
    .y0(yScale(0))
    .y1(d => yScale(d.y))
    .curve(d3.curveStepAfter);

  const doseAreaPath = areaGeneratorDose(stepPoints) || '';

  const currentX = paramValue;
  const currentDoseY = getSafeDosePct(currentX);
  const currentClearanceY = type === 'renal'
    ? Math.min(100, ((140 - age) * weight) / (72 * currentX) * (gender === 'female' ? 0.85 : 1))
    : 100 / (1 + Math.exp((currentX - 3.5) / 1.5));

  const markerX = xScale(currentX);
  const markerDoseY = yScale(currentDoseY);
  const markerClearanceY = yScale(currentClearanceY);

  const xTicks = xScale.ticks(5);
  const yTicks = yScale.ticks(4);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateValFromCoords(e);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    updateValFromCoords(e);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(false);
  };

  const updateValFromCoords = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xCoord = e.clientX - rect.left;
    const domainVal = xScale.invert((xCoord / rect.width) * width);
    const clampedVal = Math.min(xMax, Math.max(xMin, domainVal));
    onParamChange(clampedVal);
  };

  return (
    <div className="space-y-3 bg-slate-900/30 p-3.5 rounded-xl border border-slate-800/80 mt-2">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            PK Clearance & Dosing Curve
          </span>
          <p className="text-[10px] text-slate-400">
            Interactive drag interface. Solid line: Organ clearance. Stepped: Safe dose.
          </p>
        </div>
        
        <div className="flex gap-1.5">
          {drugs.map(drug => (
            <button
              key={drug}
              onClick={() => setSelectedDrug(drug)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                selectedDrug === drug
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
            >
              {drug}
            </button>
          ))}
        </div>
      </div>

      <div className="relative bg-slate-950 p-2 rounded-lg border border-slate-900 select-none overflow-hidden group">
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="cursor-crosshair overflow-visible touch-none"
        >
          <defs>
            <linearGradient id="safeAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="toxicAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {yTicks.map(tick => (
            <line
              key={tick}
              x1={padding.left}
              y1={yScale(tick)}
              x2={width - padding.right}
              y2={yScale(tick)}
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          ))}

          <rect
            x={padding.left}
            y={padding.top}
            width={width - padding.left - padding.right}
            height={height - padding.top - padding.bottom}
            fill="url(#toxicAreaGrad)"
          />

          <path
            d={doseAreaPath}
            fill="url(#safeAreaGrad)"
          />

          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#334155"
            strokeWidth="1"
          />

          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#334155"
            strokeWidth="1"
          />

          {yTicks.map(tick => (
            <text
              key={tick}
              x={padding.left - 8}
              y={yScale(tick) + 3}
              fill="#64748b"
              fontSize="9"
              fontWeight="bold"
              textAnchor="end"
            >
              {tick}%
            </text>
          ))}
          <text
            transform={`rotate(-90)`}
            x={-height / 2 + 10}
            y={12}
            fill="#94a3b8"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
          >
            Recommended Dose (%)
          </text>

          {xTicks.map(tick => (
            <text
              key={tick}
              x={xScale(tick)}
              y={height - padding.bottom + 12}
              fill="#64748b"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              {tick.toFixed(1)}
            </text>
          ))}
          <text
            x={width / 2 + 10}
            y={height - 4}
            fill="#94a3b8"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
          >
            {type === 'renal' ? 'Serum Creatinine (mg/dL)' : 'Total Bilirubin (mg/dL)'}
          </text>

          <path
            d={clearancePath}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.7"
          />

          <path
            d={dosePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]"
          />

          {isDragging && (
            <line
              x1={padding.left}
              y1={markerDoseY}
              x2={markerX}
              y2={markerDoseY}
              stroke="#10b981"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.6"
            />
          )}

          <line
            x1={markerX}
            y1={yScale(0)}
            x2={markerX}
            y2={Math.min(markerDoseY, markerClearanceY)}
            stroke="#06b6d4"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            opacity="0.8"
          />

          <circle
            cx={markerX}
            cy={markerClearanceY}
            r="4"
            fill="#475569"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          <g>
            <circle
              cx={markerX}
              cy={markerDoseY}
              r="7"
              fill="#10b981"
              opacity="0.25"
              className="animate-ping origin-center"
              style={{ transformOrigin: `${markerX}px ${markerDoseY}px` }}
            />
            <circle
              cx={markerX}
              cy={markerDoseY}
              r="4.5"
              fill="#10b981"
              stroke="#020617"
              strokeWidth="1.5"
            />
          </g>
        </svg>

        <div className="absolute top-2 left-12 right-2 flex justify-between items-center pointer-events-none">
          <div className="bg-slate-950/90 border border-slate-800/80 rounded px-2 py-1 text-[9px] flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Clearance: <span className="font-bold text-slate-200">{currentClearanceY.toFixed(0)}%</span>
            </span>
            <span className="w-px h-2.5 bg-slate-800" />
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Dose Window: <span className="font-bold text-emerald-400">{currentDoseY}%</span>
            </span>
          </div>

          <div className="bg-slate-950/90 border border-slate-800/80 rounded px-2 py-0.5 text-[9px] font-semibold text-slate-400">
            {type === 'renal' 
              ? `Est. CrCl: ${Math.round(((140 - age) * weight) / (72 * Math.max(0.1, currentX)) * (gender === 'female' ? 0.85 : 1))} mL/min`
              : `Bili level: ${currentX.toFixed(1)} mg/dL`
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClinicalIntelligenceHub() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPatient, confirmedDiagnosis } = usePatient();

  // Get passed medications, fallback to patient's active or defaults
  const passedMeds = location.state?.prescribedMedications || [];
  
  const [activeMedsList, setActiveMedsList] = useState<string[]>(
    passedMeds.length > 0 ? passedMeds : ['Amoxicillin', 'Enalapril']
  );

  // Reconciled prescription items for direct workspace sync
  const [reconciledItems, setReconciledItems] = useState<any[]>(() => {
    if (location.state?.items && Array.isArray(location.state.items) && location.state.items.length > 0) {
      return location.state.items;
    }
    const patientId = selectedPatient?.id || 'default_patient';
    const draftId = `prescription_draft_${patientId}`;
    const local = localStorage.getItem(draftId);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return (passedMeds.length > 0 ? passedMeds : ['Amoxicillin', 'Enalapril']).map((m: string, idx: number) => {
      const fullDose = getFullStandardDose(m);
      return {
        id: `item_hub_${idx}_${Date.now()}`,
        medication: m,
        dosage: fullDose,
        frequency: fullDose.includes('TID') ? 'TID' : fullDose.includes('BID') ? 'BID' : fullDose.includes('QD') ? 'QD' : 'As directed',
        duration: '7 days',
        form: 'Tablet',
        instructions: 'Take as directed'
      };
    });
  });

  const [appliedActions, setAppliedActions] = useState<Record<string, { type: 'dose' | 'brand' | 'discontinue'; value: string; timestamp: number }>>({});

  const syncToPrescriptionWorkspace = async (items: any[], activeMeds: string[]) => {
    const patientId = selectedPatient?.id || 'default_patient';
    const draftId = `prescription_draft_${patientId}`;
    
    // 1. LocalStorage
    localStorage.setItem(draftId, JSON.stringify(items));
    
    // 2. Dexie clinical_drafts
    try {
      const existing = await db.clinical_drafts.where('id').equals(draftId).first();
      if (existing && existing.localId) {
        await db.clinical_drafts.update(existing.localId, {
          content: items,
          lastModified: Date.now()
        });
      } else {
        await db.clinical_drafts.add({
          id: draftId,
          patientId,
          type: 'prescription_draft',
          content: items,
          lastModified: Date.now()
        });
      }
    } catch (err) {
      console.warn("Failed to update clinical_drafts in Dexie:", err);
    }
  };

  const handleApplyDoseAdjustment = (drug: any) => {
    const targetName = drug.medicationName;
    const newDose = drug.recommendedDose;

    let found = false;
    const updatedItems = reconciledItems.map(item => {
      if (item.medication.toLowerCase().includes(targetName.toLowerCase()) || targetName.toLowerCase().includes(item.medication.toLowerCase())) {
        found = true;
        return {
          ...item,
          dosage: newDose,
          isReconciled: true,
          reconciliationNote: `Dose adjusted per Hub AI recommendation: ${drug.adjustmentReason || 'Clinical optimization'}`
        };
      }
      return item;
    });

    let finalItems = updatedItems;
    if (!found) {
      finalItems = [
        ...reconciledItems,
        {
          id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
          medication: targetName,
          dosage: newDose,
          frequency: "TID",
          duration: "7 days",
          form: "Tablet",
          instructions: `Take as prescribed. ${drug.adjustmentReason || ''}`,
          isReconciled: true
        }
      ];
    }

    setReconciledItems(finalItems);
    setAppliedActions(prev => ({
      ...prev,
      [targetName]: { type: 'dose', value: newDose, timestamp: Date.now() }
    }));

    syncToPrescriptionWorkspace(finalItems, activeMedsList);
    toast.success(`Applied Dose Adjustment for ${targetName}: ${newDose}`);
  };

  const handleSwapWithEgyptianBrand = (originalMedName: string, brandName: string, priceEgp?: number) => {
    const newActiveMeds = activeMedsList.map(m =>
      m.toLowerCase().includes(originalMedName.toLowerCase()) || originalMedName.toLowerCase().includes(m.toLowerCase())
        ? brandName
        : m
    );
    if (!newActiveMeds.some(m => m.toLowerCase() === brandName.toLowerCase())) {
      newActiveMeds.push(brandName);
    }
    setActiveMedsList(newActiveMeds);

    let found = false;
    const updatedItems = reconciledItems.map(item => {
      if (item.medication.toLowerCase().includes(originalMedName.toLowerCase()) || originalMedName.toLowerCase().includes(item.medication.toLowerCase())) {
        found = true;
        return {
          ...item,
          medication: brandName,
          instructions: item.instructions ? `${item.instructions} (Egyptian Brand Swap: ${brandName}${priceEgp ? ` ~${priceEgp} EGP` : ''})` : `Egyptian Brand Swap: ${brandName}`,
          isReconciled: true
        };
      }
      return item;
    });

    let finalItems = updatedItems;
    if (!found) {
      finalItems = [
        ...reconciledItems,
        {
          id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
          medication: brandName,
          dosage: getFullStandardDose(brandName),
          frequency: "As directed",
          duration: "7 days",
          form: "Tablet",
          instructions: `Egyptian Brand Swap: ${brandName}${priceEgp ? ` (${priceEgp} EGP)` : ''}`,
          isReconciled: true
        }
      ];
    }

    setReconciledItems(finalItems);
    setAppliedActions(prev => ({
      ...prev,
      [originalMedName]: { type: 'brand', value: brandName, timestamp: Date.now() }
    }));

    syncToPrescriptionWorkspace(finalItems, newActiveMeds);
    toast.success(`Swapped ${originalMedName} with Egyptian trade brand: ${brandName}${priceEgp ? ` (${priceEgp} EGP)` : ''}`);
  };

  const handleApplyAllRecommendations = () => {
    let items = [...reconciledItems];
    let meds = [...activeMedsList];
    let count = 0;
    const matchedIndices = new Set<number>();

    if (optResult?.optimizedRegimen) {
      optResult.optimizedRegimen.forEach(drug => {
        const idx = items.findIndex((i, index) => !matchedIndices.has(index) && (i.medication.toLowerCase().includes(drug.medicationName.toLowerCase()) || drug.medicationName.toLowerCase().includes(i.medication.toLowerCase())));
        let targetIdx = idx;
        if (idx >= 0) {
          matchedIndices.add(idx);
          items[idx] = {
            ...items[idx],
            dosage: drug.recommendedDose,
            isReconciled: true
          };
          count++;
        } else {
          targetIdx = items.length;
          items.push({
            id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
            medication: drug.medicationName,
            dosage: drug.recommendedDose,
            frequency: "TID",
            duration: "7 days",
            form: "Tablet",
            instructions: `Take as prescribed. ${drug.adjustmentReason || ''}`,
            isReconciled: true
          });
          meds.push(drug.medicationName);
          count++;
        }

        if (drug.egyptianBrands && drug.egyptianBrands.length > 0) {
          const topBrand = drug.egyptianBrands[0];
          const oldMedName = items[targetIdx].medication;
          items[targetIdx].medication = topBrand;
          meds = meds.map(m => m === oldMedName ? topBrand : m);
        }
      });
    }

    const dupAlerts = checkDuplicateTherapy(meds);
    dupAlerts.forEach(alert => {
      if (alert.discontinuationSchedule) {
        const sched = alert.discontinuationSchedule;
        meds = meds.filter(m => m.toLowerCase() !== sched.drugToDiscontinue.toLowerCase());
        items = items.filter(i => i.medication.toLowerCase() !== sched.drugToDiscontinue.toLowerCase());
        count++;
      }
    });

    setReconciledItems(items);
    setActiveMedsList(meds);
    syncToPrescriptionWorkspace(items, meds);
    toast.success(`One-Click Clinical Reconciliation: Applied ${count} Hub recommendations to active prescription builder.`);
  };

  const handleReturnToPrescriptionWorkspace = () => {
    navigate('/prescriptions', {
      state: {
        items: reconciledItems,
        reconciled: true,
        audited: true
      }
    });
  };

  const [activeTab, setActiveTab] = useState<'optimizer' | 'guidelines' | 'calculators' | 'egyptian_brands' | 'counseling' | 'monitoring' | 'duplications' | 'pregnancy' | 'allergy'>('optimizer');
  const [isMaximized, setIsMaximized] = useState(false);

  // Pregnancy & Lactation Safety state
  const [isPregState, setIsPregState] = useState(false);
  const [trimesterVal, setTrimesterVal] = useState<1 | 2 | 3>(1);
  const [isLactState, setIsLactState] = useState(false);

  // Allergy Cross Reactivity state
  const [patientAllergiesList, setPatientAllergiesList] = useState<string[]>(['Penicillin']);
  const [newAllergyInput, setNewAllergyInput] = useState('');

  // Optimizer state
  const [optResult, setOptResult] = useState<AIPrescriptionOptimizationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calculator inputs
  const [calcAge, setCalcAge] = useState(selectedPatient?.age || 45);
  const [calcWeight, setCalcWeight] = useState(70);
  const [calcScr, setCalcScr] = useState(1.0);
  const [calcGender, setCalcGender] = useState<'male' | 'female'>(selectedPatient?.gender?.toLowerCase() === 'female' ? 'female' : 'male');
  
  const [liverBili, setLiverBili] = useState(1.0);
  const [liverAlb, setLiverAlb] = useState(4.0);
  const [liverINR, setLiverINR] = useState(1.0);

  // Egyptian Brands search state
  const [brandSearchInput, setBrandSearchInput] = useState(activeMedsList[0] || 'Amoxicillin');
  
  // Patient Counseling selection
  const [counselingMed, setCounselingMed] = useState(activeMedsList[0] || 'Amoxicillin');
  const [leafletLang, setLeafletLang] = useState<'en' | 'ar'>('en');

  // Duplication eliminator state
  const [dupNewMedInput, setDupNewMedInput] = useState('');
  const [appliedDiscontinuations, setAppliedDiscontinuations] = useState<string[]>([]);

  // Sync brand search and counseling med with active meds
  useEffect(() => {
    if (activeMedsList.length > 0) {
      if (!activeMedsList.some(m => m.toLowerCase() === brandSearchInput.toLowerCase())) {
        setBrandSearchInput(activeMedsList[0]);
      }
      if (!activeMedsList.some(m => m.toLowerCase() === counselingMed.toLowerCase())) {
        setCounselingMed(activeMedsList[0]);
      }
    }
  }, [activeMedsList]);

  const handleRunOptimization = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = optimizePrescriptionRegimen({
        patientName: selectedPatient?.name || 'Patient',
        age: calcAge,
        gender: calcGender,
        weightKg: calcWeight,
        scrMgDl: calcScr,
        isPregnant: (selectedPatient as any)?.isPregnant || false,
        trimester: (selectedPatient as any)?.trimester || 1,
        isLactating: (selectedPatient as any)?.isLactating || false,
        allergies: (selectedPatient as any)?.allergies?.map((a: any) => typeof a === 'string' ? a : a.name) || [],
        diagnosis: confirmedDiagnosis || 'General Medical Consultation',
        prescribedMedications: activeMedsList,
        liverBilirubin: liverBili,
        liverAlbumin: liverAlb,
        liverINR: liverINR
      });
      setOptResult(res);
      setIsAnalyzing(false);
    }, 400);
  };

  // Run automatically once on load and when active medications change
  useEffect(() => {
    handleRunOptimization();
  }, [selectedPatient, confirmedDiagnosis, activeMedsList]);

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

  const selectedGuideline = getGuidelineForCondition(confirmedDiagnosis || '');
  const allGuidelines = getAllClinicalGuidelines();

  const brandResult = searchEgyptianBrands(brandSearchInput);
  const counselingLeaflet = generatePatientCounselingLeaflet(counselingMed);
  const monitoringPlan = evaluatePatientMonitoringPlan(activeMedsList);

  return (
    <div className={`bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6 flex flex-col text-slate-100 transition-all duration-300 ${
      isMaximized 
        ? 'fixed inset-0 z-50 rounded-none border-none p-6 md:p-8 overflow-y-auto w-screen h-screen' 
        : 'h-full min-h-0 w-full'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 bg-slate-900 border border-slate-800 text-slate-100 p-5 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/prescriptions')}
            className="p-2.5 hover:bg-slate-800 rounded-xl transition-all border border-slate-800 text-slate-300 flex items-center justify-center"
            title="Go back to Prescriptions"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-100">Tier 3 Clinical Intelligence Hub</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AI Prescribing Engine
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Patient: <span className="text-slate-200 font-semibold">{selectedPatient?.name || 'Active Case'}</span> | Diagnosis: <span className="text-cyan-400 font-semibold">{confirmedDiagnosis || 'General Evaluation'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
            title={isMaximized ? "Exit full width screen mode" : "Maximize view to full width screen"}
          >
            {isMaximized ? (
              <>
                <Minimize2 className="w-4 h-4 text-cyan-400" />
                <span>Exit Max Width</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-cyan-400" />
                <span>Max Width</span>
              </>
            )}
          </button>

          <button
            onClick={handleRunOptimization}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Run Hub Analysis
          </button>
        </div>
      </div>

      {/* Direct Clinical Reconciliation Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>One-Click Clinical Reconciliation Engine</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                {Object.keys(appliedActions).length} Action{Object.keys(appliedActions).length !== 1 ? 's' : ''} Applied
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Reconcile AI recommendations directly. Dose adjustments, Egyptian trade brand swaps, & duplicate discontinuations update the active prescription builder instantly in the background.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleApplyAllRecommendations}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Apply All Hub Recommendations
          </button>
          <button
            onClick={handleReturnToPrescriptionWorkspace}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            Open Prescription Workspace ({reconciledItems.length})
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-900/80 px-4 overflow-x-auto gap-1 rounded-t-xl">
        <button
          onClick={() => setActiveTab('optimizer')}
          className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
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
          className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
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
          className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
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
          className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
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
          className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
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
          className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'monitoring'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Lab Monitoring Protocols
        </button>

        <button
          onClick={() => setActiveTab('duplications')}
          className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'duplications'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Duplication Eliminator
        </button>

        <button
          onClick={() => setActiveTab('pregnancy')}
          className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'pregnancy'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Baby className="w-4 h-4" />
          Pregnancy & Lactation Safety
        </button>

        <button
          onClick={() => setActiveTab('allergy')}
          className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'allergy'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          Allergy Cross-Reactivity
        </button>
      </div>

      {/* Tab Content Box */}
      <div className="bg-slate-900 border-x border-b border-slate-800 text-slate-100 flex-1 p-6 rounded-b-xl shadow-lg overflow-y-auto custom-scrollbar">
        
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
                  <SemicircleGauge
                    type="renal"
                    label="Renal Clearance (CrCl)"
                    value={optResult.crClMlMin}
                    unit="mL/min"
                  />
                  <SemicircleGauge
                    type="hepatic"
                    label="Hepatic Clearance"
                    value={optResult.childPughClass || 'Class A'}
                  />
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-center min-h-[170px] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none transition-all group-hover:from-cyan-500/10" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Guideline Basis</span>
                    <div className="text-sm font-semibold text-slate-200">{optResult.guidelineSociety || 'Standard Protocols'}</div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      Recommendations and dosing intervals aligned with therapeutic target guidelines.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-center min-h-[170px] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none transition-all group-hover:from-cyan-500/10" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Medications Analyzed</span>
                    <div className="text-2xl font-black text-cyan-400">{optResult.optimizedRegimen.length}</div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      Cross-referenced against pregnancy, lactation, hepatic and renal parameters.
                    </p>
                  </div>
                </div>

                {/* Dynamic Interactive Drug-Drug Interaction Map */}
                <DDINetworkMap
                  activeMedications={activeMedsList}
                  onMedicationsChange={setActiveMedsList}
                />

                {/* Line Item Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Individual Drug Regimen Analysis & Direct Reconciliation</h4>
                  {optResult.optimizedRegimen.map((drug, idx) => {
                    const isDoseApplied = appliedActions[drug.medicationName]?.type === 'dose' || reconciledItems.some(i => (i.medication.toLowerCase().includes(drug.medicationName.toLowerCase()) || drug.medicationName.toLowerCase().includes(i.medication.toLowerCase())) && i.dosage === drug.recommendedDose);

                    return (
                      <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                            <Pill className="w-4 h-4 text-cyan-400" />
                            {drug.medicationName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              drug.safetyScore === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              drug.safetyScore === 'Caution' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {drug.safetyScore}
                            </span>

                            {isDoseApplied ? (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Dose Applied
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApplyDoseAdjustment(drug)}
                                className="px-3 py-1 text-xs font-semibold bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 border border-cyan-500/40 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Apply Dose Adjustment
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="text-xs grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 pt-1">
                          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recommended Dosing</span>
                            <span className="font-medium text-cyan-300">{drug.recommendedDose}</span>
                          </div>
                          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
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

                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-900">
                          <span className="text-slate-300 font-semibold flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                            Egyptian Brand Alternatives (Avg ~{drug.avgPriceEgp} EGP):
                          </span>
                          {drug.egyptianBrands.slice(0, 3).map((b, bIdx) => {
                            const isSwapped = activeMedsList.some(m => m.toLowerCase() === b.toLowerCase());
                            return (
                              <button
                                key={bIdx}
                                onClick={() => handleSwapWithEgyptianBrand(drug.medicationName, b, drug.avgPriceEgp)}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1 transition-all ${
                                  isSwapped
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-800 hover:border-cyan-500/40'
                                }`}
                              >
                                {isSwapped ? <Check className="w-3 h-3 text-emerald-400" /> : <RefreshCw className="w-3 h-3 text-cyan-400" />}
                                Swap with {b}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
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
                No direct guideline match found for diagnosis "{confirmedDiagnosis || 'N/A'}". Browsing standard protocols below:
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
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-2">
                    <Calculator className="w-5 h-5" />
                    <h3 className="font-bold text-sm text-slate-100">Cockcroft-Gault Renal Estimator</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Age (Years)</span>
                        <span className="font-bold text-cyan-400">{calcAge} yrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range"
                          min="18"
                          max="100"
                          value={calcAge} 
                          onChange={e => setCalcAge(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <input 
                          type="number" 
                          value={calcAge} 
                          onChange={e => setCalcAge(Number(e.target.value))}
                          className="w-12 text-center bg-slate-900 border border-slate-800 rounded py-1 text-[11px] text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Weight (kg)</span>
                        <span className="font-bold text-cyan-400">{calcWeight} kg</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range"
                          min="30"
                          max="150"
                          value={calcWeight} 
                          onChange={e => setCalcWeight(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <input 
                          type="number" 
                          value={calcWeight} 
                          onChange={e => setCalcWeight(Number(e.target.value))}
                          className="w-12 text-center bg-slate-900 border border-slate-800 rounded py-1 text-[11px] text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Serum Creatinine</span>
                        <span className="font-bold text-cyan-400">{calcScr.toFixed(2)} mg/dL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range"
                          min="0.3"
                          max="6.0"
                          step="0.1"
                          value={calcScr} 
                          onChange={e => setCalcScr(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <input 
                          type="number" 
                          step="0.1"
                          value={calcScr} 
                          onChange={e => setCalcScr(Number(e.target.value))}
                          className="w-12 text-center bg-slate-900 border border-slate-800 rounded py-1 text-[11px] text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 block mb-0.5">Gender</label>
                      <select 
                        value={calcGender}
                        onChange={e => setCalcGender(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 space-y-2">
                      <span className="text-[11px] font-semibold text-slate-400 block">Renal Stage Description</span>
                      <span className="text-xs font-bold text-cyan-400 block">{cgResult.stage}</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Calculated creatinine clearance via standard Cockcroft-Gault formula using ideal or actual body weight.
                      </p>
                    </div>
                    <SemicircleGauge
                      type="renal"
                      label="Live Renal Gauge"
                      value={cgResult.crcl}
                      unit="mL/min"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <DosingCurveChart
                    type="renal"
                    paramValue={calcScr}
                    onParamChange={setCalcScr}
                    age={calcAge}
                    weight={calcWeight}
                    gender={calcGender}
                  />
                </div>
              </div>
 
              {/* Child-Pugh Hepatic Widget */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-2">
                    <Stethoscope className="w-5 h-5" />
                    <h3 className="font-bold text-sm text-slate-100">Child-Pugh Hepatic Score</h3>
                  </div>
 
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Bilirubin</span>
                        <span className="font-bold text-cyan-400">{liverBili.toFixed(1)} mg/dL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range"
                          min="0.1"
                          max="10.0"
                          step="0.1"
                          value={liverBili} 
                          onChange={e => setLiverBili(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <input 
                          type="number" 
                          step="0.1"
                          value={liverBili} 
                          onChange={e => setLiverBili(Number(e.target.value))}
                          className="w-12 text-center bg-slate-900 border border-slate-800 rounded py-1 text-[11px] text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Albumin</span>
                        <span className="font-bold text-cyan-400">{liverAlb.toFixed(1)} g/dL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range"
                          min="1.5"
                          max="5.5"
                          step="0.1"
                          value={liverAlb} 
                          onChange={e => setLiverAlb(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <input 
                          type="number" 
                          step="0.1"
                          value={liverAlb} 
                          onChange={e => setLiverAlb(Number(e.target.value))}
                          className="w-12 text-center bg-slate-900 border border-slate-800 rounded py-1 text-[11px] text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>INR</span>
                        <span className="font-bold text-cyan-400">{liverINR.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range"
                          min="0.8"
                          max="6.0"
                          step="0.1"
                          value={liverINR} 
                          onChange={e => setLiverINR(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <input 
                          type="number" 
                          step="0.1"
                          value={liverINR} 
                          onChange={e => setLiverINR(Number(e.target.value))}
                          className="w-12 text-center bg-slate-900 border border-slate-800 rounded py-1 text-[11px] text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
 
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 space-y-2">
                      <span className="text-[11px] font-semibold text-slate-400 block">Hepatic Score Summary</span>
                      <span className="text-xs font-bold text-cyan-400 block">Score {cpResult.score} ({cpResult.class})</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {cpResult.severity}
                      </p>
                    </div>
                    <SemicircleGauge
                      type="hepatic"
                      label="Live Hepatic Gauge"
                      value={cpResult.class || 'Class A'}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <DosingCurveChart
                    type="hepatic"
                    paramValue={liverBili}
                    onParamChange={setLiverBili}
                    age={calcAge}
                    weight={calcWeight}
                    gender={calcGender}
                  />
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
                  <div className="text-lg font-bold text-emerald-400 flex items-center gap-1 justify-end mt-1">
                    <DollarSign className="w-4 h-4" /> {brandResult.averagePriceEgp} EGP
                  </div>
                </div>
              </div>

              {/* National Shortage & Stock-Out Alert Card */}
              {brandResult.hasShortage && (
                <div className="bg-rose-950/15 border border-rose-500/30 p-4 rounded-xl space-y-3">
                  <div className="flex items-start gap-2 text-rose-400">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-rose-400">
                        Egyptian Market Supply Alerts & Stock-Out Warning
                      </h4>
                      <p className="text-[11px] text-rose-300 mt-1 leading-relaxed">
                        The Egyptian pharmaceutical supply chain database indicates active supply deficits or import challenges for specific commercial brands of <strong>{brandResult.genericName}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* List of Affected Brands */}
                  <div className="bg-rose-950/20 border border-rose-500/10 p-3 rounded-lg text-[11px] space-y-1 text-rose-300">
                    <span className="font-semibold text-rose-400 block">High Stock-Out Risk Local Formulations:</span>
                    <ul className="list-disc list-inside space-y-1">
                      {brandResult.shortageBrands.map((b, idx) => (
                        <li key={idx}>
                          <span className="font-bold text-rose-100">{b.brand_name}</span> (Manufactured by {b.company}) &mdash; <span className="font-medium text-rose-400">Shortage / Poor Pharmacy Availability</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Main List of Local Brands */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Available Local Commercial Brands</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brandResult.brands.map((b, idx) => {
                    const isShortage = b.availability === 'Shortage' || b.availability === 'Discontinued';
                    const isSwapped = activeMedsList.some(m => m.toLowerCase() === b.brand_name.toLowerCase());

                    return (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                          isShortage 
                            ? 'bg-rose-950/5 border-rose-900/40 opacity-75' 
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-100">{b.brand_name}</span>
                          <span className={`text-xs font-bold ${isShortage ? 'text-slate-500 line-through' : 'text-emerald-400'}`}>
                            {b.price_egp} EGP
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center justify-between">
                          <span>{b.company}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                            isShortage 
                              ? 'bg-rose-500/10 text-rose-400' 
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {isShortage ? (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5" /> Shortage
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" /> Available
                              </>
                            )}
                          </span>
                        </div>

                        {!isShortage && (
                          <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                            {isSwapped ? (
                              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Active Brand
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSwapWithEgyptianBrand(brandResult.genericName, b.brand_name, b.price_egp)}
                                className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                              >
                                <RefreshCw className="w-3 h-3 text-cyan-400" />
                                Swap in Prescription Builder
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Highlight of Bioequivalent Alternatives (Same ingredient, other in-stock brands) */}
              {brandResult.hasShortage && brandResult.inStockBrands.length > 0 && (
                <div className="bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                      Immediate In-Stock Bioequivalent Alternatives
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    The following bioequivalent formulations of <strong>{brandResult.genericName}</strong> are fully available in Egypt and have sufficient national stock buffers. Patients can safely substitute after consulting their pharmacist:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {brandResult.inStockBrands.map((b, idx) => {
                      const isSwapped = activeMedsList.some(m => m.toLowerCase() === b.brand_name.toLowerCase());
                      return (
                        <div key={idx} className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-200 block">{b.brand_name}</span>
                            <span className="text-[10px] text-slate-400 block">{b.company} &bull; <strong className="text-emerald-400">{b.price_egp} EGP</strong></span>
                          </div>
                          <div>
                            {isSwapped ? (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Active
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSwapWithEgyptianBrand(brandResult.genericName, b.brand_name, b.price_egp)}
                                className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 rounded text-[11px] font-semibold flex items-center gap-1 transition-all"
                              >
                                Apply Swap
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Highlight of Therapeutic Alternatives (Same class, other generic drugs) */}
              {brandResult.therapeuticAlternatives && brandResult.therapeuticAlternatives.length > 0 && (
                <div className="bg-cyan-950/10 border border-cyan-500/20 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Stethoscope className="w-4 h-4 shrink-0" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400">
                      Therapeutic Alternatives (Class: {brandResult.drugClass})
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    If all local formulations of <strong>{brandResult.genericName}</strong> are unavailable, these bioequivalent therapeutic alternatives in the same subclass may be recommended after consulting the prescribing physician:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {brandResult.therapeuticAlternatives.map((alt, idx) => {
                      const isSwapped = activeMedsList.some(m => m.toLowerCase() === alt.brand.brand_name.toLowerCase());
                      return (
                        <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{alt.brand.brand_name}</span>
                            <span className="text-emerald-400 font-semibold">{alt.brand.price_egp} EGP</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex justify-between items-center">
                            <span>Active: <strong className="text-cyan-400">{alt.genericName}</strong></span>
                            <span>{alt.brand.company}</span>
                          </div>
                          <div className="pt-1.5 border-t border-slate-800/60 flex justify-end">
                            {isSwapped ? (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Substituted
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSwapWithEgyptianBrand(brandResult.genericName, alt.brand.brand_name, alt.brand.price_egp)}
                                className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 rounded text-[11px] font-semibold flex items-center gap-1 transition-all"
                              >
                                Substitute Alternative
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PATIENT COUNSELING */}
        {activeTab === 'counseling' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-semibold">Select Medication for Patient Leaflet:</span>
                <select 
                  value={counselingMed}
                  onChange={e => setCounselingMed(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {activeMedsList.map((m, idx) => (
                    <option key={idx} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Bilingual Language Switcher */}
              <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setLeafletLang('en')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    leafletLang === 'en' 
                      ? "bg-cyan-500 text-slate-950 shadow-md" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLeafletLang('ar')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    leafletLang === 'ar' 
                      ? "bg-cyan-500 text-slate-950 shadow-md" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  العربية (Arabic)
                </button>
              </div>
            </div>

            {counselingLeaflet ? (
              <div 
                className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-6 transition-all duration-300 font-sans"
                dir={leafletLang === 'ar' ? 'rtl' : 'ltr'}
              >
                {/* Print Header */}
                <div className="border-b border-slate-800 pb-4 flex items-center justify-between flex-wrap gap-4 print-header">
                  {leafletLang === 'ar' ? (
                    <div>
                      <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider block mb-1">نشرة توعية وتثقيف المريض</span>
                      <h3 className="text-xl font-bold text-slate-100">{counselingLeaflet.arabic?.medicationName || counselingLeaflet.medicationName}</h3>
                      <p className="text-xs text-slate-400 mt-1.5">
                        <span className="font-bold text-slate-300">الأسماء التجارية المحلية: </span>
                        {counselingLeaflet.arabic?.brandNames ? counselingLeaflet.arabic.brandNames.join('، ') : counselingLeaflet.brandNames.join(', ')}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-bold text-slate-400">الفئة الدوائية: </span>
                        {counselingLeaflet.arabic?.drugClass || 'مادة علاجية فعالة'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider block mb-1">Patient Education Leaflet</span>
                      <h3 className="text-lg font-bold text-slate-100">{counselingLeaflet.medicationName}</h3>
                      <p className="text-xs text-slate-400 mt-1.5">
                        <span className="font-bold text-slate-300">Commercial Brands: </span>
                        {counselingLeaflet.brandNames.join(', ')}
                      </p>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => {
                      // We can trigger standard print
                      window.print();
                    }}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-lg border border-slate-800 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    {leafletLang === 'ar' ? 'طباعة النشرة الطبية' : 'Print Leaflet'}
                  </button>
                </div>

                {/* Main Guidance Cards Grid */}
                {leafletLang === 'ar' && counselingLeaflet.arabic ? (
                  /* Arabic Cards Layout */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="font-bold text-cyan-400 block mb-1 text-sm">الطعام وطريقة الإعطاء</span>
                      <p className="text-slate-200 leading-relaxed text-[12px]">{counselingLeaflet.arabic.food}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="font-bold text-cyan-400 block mb-1 text-sm">بروتوكول الجرعة المنسية</span>
                      <p className="text-slate-200 leading-relaxed text-[12px]">{counselingLeaflet.arabic.missedDose}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="font-bold text-cyan-400 block mb-1 text-sm">إرشادات حفظ وتخزين الدواء</span>
                      <p className="text-slate-200 leading-relaxed text-[12px]">{counselingLeaflet.arabic.storage}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="font-bold text-cyan-400 block mb-1 text-sm">الحمل والرضاعة الطبيعية</span>
                      <p className="text-slate-200 leading-relaxed text-[12px]">{counselingLeaflet.arabic.pregnancyAdvice}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="font-bold text-cyan-400 block mb-1 text-sm">قيادة المركبات واليقظة</span>
                      <p className="text-slate-200 leading-relaxed text-[12px]">{counselingLeaflet.arabic.driving}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="font-bold text-cyan-400 block mb-1 text-sm">تحذيرات تناول الكحول</span>
                      <p className="text-slate-200 leading-relaxed text-[12px]">{counselingLeaflet.arabic.alcohol}</p>
                    </div>
                  </div>
                ) : (
                  /* English Cards Layout */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="font-bold text-cyan-400 block mb-1">Food & Administration</span>
                      <p className="text-slate-300 leading-relaxed">{counselingLeaflet.counseling.food}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="font-bold text-cyan-400 block mb-1">Missed Dose Protocol</span>
                      <p className="text-slate-300 leading-relaxed">{counselingLeaflet.counseling.missedDose}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="font-bold text-cyan-400 block mb-1">Storage Guidance</span>
                      <p className="text-slate-300 leading-relaxed">{counselingLeaflet.storage}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="font-bold text-cyan-400 block mb-1">Pregnancy / Lactation Note</span>
                      <p className="text-slate-300 leading-relaxed">{counselingLeaflet.counseling.pregnancyAdvice}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="font-bold text-cyan-400 block mb-1">Driving & Alertness</span>
                      <p className="text-slate-300 leading-relaxed">{counselingLeaflet.counseling.driving}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="font-bold text-cyan-400 block mb-1">Alcohol Consumption</span>
                      <p className="text-slate-300 leading-relaxed">{counselingLeaflet.counseling.alcohol}</p>
                    </div>
                  </div>
                )}

                {/* Common Side Effects */}
                <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-800/60 text-xs space-y-2">
                  <span className="font-bold text-slate-300 block">
                    {leafletLang === 'ar' ? 'الآثار الجانبية الشائعة والمتوقعة:' : 'Common & Expected Side Effects:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(leafletLang === 'ar' && counselingLeaflet.arabic 
                      ? counselingLeaflet.arabic.warningSymptoms 
                      : counselingLeaflet.counseling.warningSymptoms
                    ).map((symp, idx) => (
                      <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded text-[11px] font-medium">
                        {symp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Emergency Symptoms Danger Banner */}
                <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> 
                    {leafletLang === 'ar' 
                      ? 'الأعراض الطارئة والخطيرة التي تستدعي الرعاية الطبية الفورية:' 
                      : 'Emergency Symptoms requiring immediate medical attention:'}
                  </span>
                  <ul className="list-disc list-inside text-rose-300 space-y-1 pl-1">
                    {(leafletLang === 'ar' && counselingLeaflet.arabic 
                      ? counselingLeaflet.arabic.emergencySymptoms 
                      : counselingLeaflet.counseling.emergencySymptoms
                    ).map((symp, idx) => (
                      <li key={idx} className="leading-relaxed">{symp}</li>
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
              <div key={idx} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
                  <span className="font-bold text-base text-cyan-400">{plan.medicationName}</span>
                  <span className="text-xs text-slate-400">{plan.frequency}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-bold block mb-1.5">Baseline Labs Needed</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {plan.baselineLabs.map((lab, lIdx) => (
                        <li key={lIdx}>{lab}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                    <span className="text-cyan-400 font-bold block mb-1.5">Ongoing Monitoring</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {plan.ongoingLabs.map((lab, lIdx) => (
                        <li key={lIdx}>{lab}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg text-xs text-slate-300 border border-slate-850 italic">
                  Clinical Action: {plan.clinicalAction}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 7: DUPLICATION ELIMINATOR SAFETY ENGINE */}
        {activeTab === 'duplications' && (() => {
          const duplicateAlerts = checkDuplicateTherapy(activeMedsList);

          const handleAddMed = (e: React.FormEvent) => {
            e.preventDefault();
            if (!dupNewMedInput.trim()) return;
            const normalized = dupNewMedInput.trim();
            const exists = activeMedsList.some(m => m.toLowerCase() === normalized.toLowerCase());
            if (!exists) {
              setActiveMedsList([...activeMedsList, normalized]);
              toast.success(`Added ${normalized} to prescription profile.`);
            } else {
              toast.error(`${normalized} is already in the prescription profile.`);
            }
            setDupNewMedInput('');
          };

          const handleRemoveMed = (medToRemove: string) => {
            setActiveMedsList(activeMedsList.filter(m => m !== medToRemove));
            toast.success(`Removed ${medToRemove} from profile.`);
          };

          const handleAddCombination = (medsToAdd: string[]) => {
            const newList = [...activeMedsList];
            let addedCount = 0;
            medsToAdd.forEach(m => {
              if (!newList.some(existing => existing.toLowerCase() === m.toLowerCase())) {
                newList.push(m);
                addedCount++;
              }
            });
            if (addedCount > 0) {
              setActiveMedsList(newList);
              toast.success(`Injected drug duplication preset: ${medsToAdd.join(' + ')}`);
            } else {
              toast.info(`Duplication preset ${medsToAdd.join(' + ')} is already active.`);
            }
          };

          const handleApplyDiscontinuation = (drugToDiscontinue: string, drugToKeep: string) => {
            const updatedMeds = activeMedsList.filter(m => m.toLowerCase() !== drugToDiscontinue.toLowerCase());
            const updatedItems = reconciledItems.filter(i => i.medication.toLowerCase() !== drugToDiscontinue.toLowerCase());
            
            setActiveMedsList(updatedMeds);
            setReconciledItems(updatedItems);
            setAppliedDiscontinuations(prev => [...prev, drugToDiscontinue]);
            setAppliedActions(prev => ({
              ...prev,
              [drugToDiscontinue]: { type: 'discontinue', value: drugToKeep, timestamp: Date.now() }
            }));
            
            syncToPrescriptionWorkspace(updatedItems, updatedMeds);
            toast.success(`Successfully discontinued ${drugToDiscontinue}. Retaining optimized agent: ${drugToKeep}. Workspace updated.`);
          };

          return (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    <h3 className="font-bold text-slate-200 text-base">Active Therapeutic Duplication Engine</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Scan prescription profiles for redundant same-class pharmacological therapies. Safely discontinue duplicates with structured tapering protocols.
                  </p>
                </div>
                {appliedDiscontinuations.length > 0 && (
                  <button 
                    onClick={() => {
                      setAppliedDiscontinuations([]);
                      toast.success("Discontinuation history reset.");
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-200 border border-slate-800 px-2.5 py-1 rounded bg-slate-900 transition-colors"
                  >
                    Reset Discontinuation History ({appliedDiscontinuations.length})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Panel: Active Simulation Medication List */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
                      Prescription Profile
                    </span>

                    {/* Active Medications Checklist/List */}
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                      {activeMedsList.map((med, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800/60 text-xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Pill className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="font-semibold text-slate-200 truncate">{med}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveMed(med)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-85 transition-all"
                            title="Remove medication"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add custom medication form */}
                    <form onSubmit={handleAddMed} className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={dupNewMedInput}
                        onChange={(e) => setDupNewMedInput(e.target.value)}
                        placeholder="Add drug (e.g. Ibuprofen)"
                        className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 flex-1 min-w-0"
                      />
                      <button
                        type="submit"
                        className="p-1.5 bg-slate-800 hover:bg-cyan-600 text-cyan-400 hover:text-white rounded transition-colors"
                        title="Add medication"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                  {/* Simulator Presets */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Info className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Quick Add Duplications
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Inject clinical duplication triggers to analyze safety hazards:
                    </p>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => handleAddCombination(['Ibuprofen', 'Naproxen'])}
                        className="w-full text-left bg-slate-900 hover:bg-slate-800 p-2.5 rounded border border-slate-800 text-[11px] flex items-center justify-between group transition-all"
                      >
                        <span className="text-slate-300">NSAIDs: <strong className="text-rose-400">Ibuprofen + Naproxen</strong></span>
                        <Plus className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </button>
                      <button
                        onClick={() => handleAddCombination(['Omeprazole', 'Esomeprazole'])}
                        className="w-full text-left bg-slate-900 hover:bg-slate-800 p-2.5 rounded border border-slate-800 text-[11px] flex items-center justify-between group transition-all"
                      >
                        <span className="text-slate-300">PPIs: <strong className="text-amber-400">Omeprazole + Esomeprazole</strong></span>
                        <Plus className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </button>
                      <button
                        onClick={() => handleAddCombination(['Lisinopril', 'Losartan'])}
                        className="w-full text-left bg-slate-900 hover:bg-slate-800 p-2.5 rounded border border-slate-800 text-[11px] flex items-center justify-between group transition-all"
                      >
                        <span className="text-slate-300">RAAS: <strong className="text-rose-400">Lisinopril + Losartan</strong></span>
                        <Plus className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </button>
                      <button
                        onClick={() => handleAddCombination(['Metoprolol', 'Atenolol'])}
                        className="w-full text-left bg-slate-900 hover:bg-slate-800 p-2.5 rounded border border-slate-800 text-[11px] flex items-center justify-between group transition-all"
                      >
                        <span className="text-slate-300">Beta-Blockers: <strong className="text-rose-400">Metoprolol + Atenolol</strong></span>
                        <Plus className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </button>
                      <button
                        onClick={() => handleAddCombination(['Atorvastatin', 'Simvastatin'])}
                        className="w-full text-left bg-slate-900 hover:bg-slate-800 p-2.5 rounded border border-slate-800 text-[11px] flex items-center justify-between group transition-all"
                      >
                        <span className="text-slate-300">Statins: <strong className="text-amber-400">Atorvastatin + Simvastatin</strong></span>
                        <Plus className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Analyzed Results & Schedules */}
                <div className="lg:col-span-8 space-y-5">
                  {duplicateAlerts.length === 0 ? (
                    <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center min-h-[300px]">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-4">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-200 text-sm">No Therapeutic Duplications Found</h4>
                      <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                        The current prescribing profile has been fully audited against active drug classes. There are no therapeutic overlaps or high-risk therapeutic redundancies.
                      </p>
                      
                      {appliedDiscontinuations.length > 0 && (
                        <div className="mt-6 bg-slate-900 p-4 rounded-lg border border-slate-800 text-left w-full max-w-md space-y-2">
                          <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Successfully Eliminated Duplications:
                          </span>
                          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                            {appliedDiscontinuations.map((d, i) => (
                              <li key={i}>
                                Discontinued redundant <strong className="text-slate-100">{d}</strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {duplicateAlerts.map((alert, idx) => {
                        const hasSched = !!alert.discontinuationSchedule;
                        const sched = alert.discontinuationSchedule;
                        
                        return (
                          <div key={idx} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                            
                            {/* Alert Header */}
                            <div className="flex items-start justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                              <div className="space-y-1">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  alert.severity === 'Severe' 
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                    : alert.severity === 'Major'
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                  <ShieldAlert className="w-3 h-3" /> {alert.severity} Risk Duplication
                                </span>
                                <h4 className="font-bold text-base text-slate-200">
                                  {alert.drugClass} Therapeutic Overlap
                                </h4>
                              </div>
                              <span className="text-xs text-slate-500">
                                Duplicated Agents: <strong className="text-slate-300">{alert.duplicatingDrugs.join(' & ')}</strong>
                              </span>
                            </div>

                            {/* Clinical Risks & Additive Toxicity */}
                            <div className="bg-rose-950/10 border border-rose-500/10 p-4 rounded-lg text-xs space-y-2">
                              <span className="font-bold text-rose-400 flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" /> Pathophysiological Hazards & Additive Toxicity
                              </span>
                              <p className="text-rose-300 leading-relaxed">
                                {alert.clinicalRisk}
                              </p>
                            </div>

                            {/* Smart Discontinuation Schedule */}
                            {hasSched && sched && (
                              <div className="space-y-3.5 pt-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-cyan-400" /> Smart Discontinuation & Tapering Schedule
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    sched.taperRequired 
                                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' 
                                      : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                                  }`}>
                                    {sched.taperRequired ? 'Gradual Taper Required' : 'Immediate Cessation'}
                                  </span>
                                </div>

                                {/* Timeline display */}
                                <div className="relative border-l border-slate-800 pl-4 ml-1.5 space-y-4 text-xs">
                                  {sched.steps.map((step, sIdx) => (
                                    <div key={sIdx} className="relative">
                                      {/* Dots */}
                                      <div className="absolute -left-[20.5px] top-1 w-3 h-3 bg-slate-950 border-2 border-cyan-500 rounded-full" />
                                      <span className="font-bold text-cyan-400 block mb-0.5">{step.dayRange}</span>
                                      <p className="text-slate-300 leading-relaxed">{step.instruction}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* Pharmacological Rationale */}
                                <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1.5">
                                  <span className="font-bold text-slate-300 flex items-center gap-1">
                                    <Info className="w-3.5 h-3.5 text-slate-400" /> Pharmacological Rationale
                                  </span>
                                  <p className="text-slate-400 leading-relaxed text-[11px]">
                                    {sched.rationale}
                                  </p>
                                </div>

                                {/* Safety Monitoring Requirements */}
                                <div className="space-y-2">
                                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
                                    Required Patient Safety Monitoring Parameters
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                                    {sched.monitoringParameters.map((param, pIdx) => (
                                      <div key={pIdx} className="bg-slate-900/40 p-2.5 rounded border border-slate-800 flex items-start gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>{param}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end pt-3">
                                  <button
                                    onClick={() => handleApplyDiscontinuation(sched.drugToDiscontinue, sched.drugToKeep)}
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5"
                                  >
                                    <ShieldCheck className="w-4 h-4" /> Apply Smart Discontinuation (Retain {sched.drugToKeep})
                                  </button>
                                </div>

                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 8: PREGNANCY & LACTATION SAFETY EVALUATOR */}
        {activeTab === 'pregnancy' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Baby className="w-5 h-5 text-pink-400" />
                    Pregnancy & Lactation Clinical Safety Matrix
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluates gestational trimester risks, placental transfer, infant milk excretion, and safe alternative therapeutics.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isPregState}
                      onChange={(e) => setIsPregState(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="font-semibold text-pink-300">Pregnant Patient</span>
                  </label>

                  {isPregState && (
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                      <span className="text-slate-400 px-2 font-medium">Trimester:</span>
                      {[1, 2, 3].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTrimesterVal(t as 1 | 2 | 3)}
                          className={`px-2.5 py-1 rounded font-bold transition-all ${
                            trimesterVal === t 
                              ? 'bg-pink-600 text-white shadow-sm' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          T{t}
                        </button>
                      ))}
                    </div>
                  )}

                  <label className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isLactState}
                      onChange={(e) => setIsLactState(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="font-semibold text-purple-300">Lactating Patient</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Active Regimen Evaluation Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Active Prescribed Regimen Risk Matrix ({activeMedsList.length} Drugs)</span>
                {(!isPregState && !isLactState) && (
                  <span className="text-amber-400 text-[11px] font-normal flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Toggle Pregnant or Lactating status above to test gestational profile
                  </span>
                )}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeMedsList.map((med, idx) => {
                  const pregEval = evaluatePregnancySafety(med, isPregState, trimesterVal);
                  const lactEval = evaluateLactationSafety(med, isLactState);

                  const getRiskBadge = (level: string) => {
                    switch (level) {
                      case 'Contraindicated':
                        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                      case 'High':
                        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
                      case 'Moderate':
                        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                      default:
                        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                    }
                  };

                  return (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3.5 hover:border-slate-700 transition-all">
                      <div className="flex justify-between items-start gap-2 border-b border-slate-900 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-cyan-400" />
                          <span className="font-bold text-slate-100 text-sm">{med}</span>
                        </div>
                        {pregEval.legacyCategory && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                            Legacy Category {pregEval.legacyCategory}
                          </span>
                        )}
                      </div>

                      {/* Pregnancy Section */}
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-pink-300 flex items-center gap-1.5">
                            <Baby className="w-3.5 h-3.5" /> Pregnancy Safety (Trimester {trimesterVal})
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(pregEval.riskLevel)}`}>
                            {pregEval.riskLevel} Risk
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {pregEval.overallRecommendation}
                        </p>
                        {pregEval.trimesterAdvice && (
                          <div className="text-[10px] text-pink-300/80 bg-pink-950/30 p-2 rounded border border-pink-900/30">
                            <strong>Trimester Advice:</strong> {pregEval.trimesterAdvice}
                          </div>
                        )}
                      </div>

                      {/* Lactation Section */}
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-purple-300 flex items-center gap-1.5">
                            <HeartPulse className="w-3.5 h-3.5" /> Lactation Safety
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(lactEval.infantRisk)}`}>
                            {lactEval.infantRisk} Infant Risk
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {lactEval.clinicalAdvice}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>Milk Transfer: <strong className="text-slate-200">{lactEval.milkTransfer}</strong></span>
                          {lactEval.alternativeDrug && (
                            <span className="text-cyan-400 font-medium">Safe Alt: {lactEval.alternativeDrug}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: ALLERGY CROSS-REACTIVITY EVALUATOR */}
        {activeTab === 'allergy' && (() => {
          const handleAddAllergy = (e: React.FormEvent) => {
            e.preventDefault();
            if (!newAllergyInput.trim()) return;
            const val = newAllergyInput.trim();
            if (!patientAllergiesList.some(a => a.toLowerCase() === val.toLowerCase())) {
              setPatientAllergiesList([...patientAllergiesList, val]);
              toast.success(`Added ${val} to patient allergy profile.`);
            }
            setNewAllergyInput('');
          };

          const handleRemoveAllergy = (alg: string) => {
            setPatientAllergiesList(patientAllergiesList.filter(a => a !== alg));
            toast.success(`Removed ${alg} from allergy profile.`);
          };

          return (
            <div className="space-y-6">
              {/* Allergy Profile Header */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <AlertOctagon className="w-5 h-5 text-rose-400" />
                      Immuno-Allergy & Cross-Reactivity Matrix
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Screens beta-lactam side chains, sulfonamide non-arylamines, and NSAID hypersensitivity pathways across active prescriptions.
                    </p>
                  </div>

                  {/* Add Allergy Input */}
                  <form onSubmit={handleAddAllergy} className="flex items-center gap-2 w-full md:w-auto">
                    <input
                      type="text"
                      placeholder="Add patient allergy (e.g. Penicillin, Sulfa)..."
                      value={newAllergyInput}
                      onChange={(e) => setNewAllergyInput(e.target.value)}
                      className="bg-slate-900 text-xs text-slate-200 border border-slate-700 px-3 py-2 rounded-lg focus:outline-none focus:border-rose-500 w-full md:w-64"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-all shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </form>
                </div>

                {/* Patient Allergy Tags */}
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-900">
                  <span className="text-xs font-semibold text-slate-400">Recorded Patient Allergies:</span>
                  {patientAllergiesList.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No allergies recorded (NKDA)</span>
                  ) : (
                    patientAllergiesList.map((alg, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
                        <span>{alg}</span>
                        <button onClick={() => handleRemoveAllergy(alg)} className="hover:text-white transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Cross-Reactivity Risk Matrix for Active Medications */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Prescription Allergy & Cross-Reactivity Analysis
                </h4>

                <div className="space-y-3">
                  {activeMedsList.map((med, mIdx) => {
                    const crossAlerts = checkAllergyCrossReactivity(patientAllergiesList, med);

                    return (
                      <div key={mIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Pill className="w-4 h-4 text-cyan-400" />
                            <span className="font-bold text-slate-100 text-sm">{med}</span>
                          </div>
                          {crossAlerts.length === 0 ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Clear / No Allergy Conflict
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> {crossAlerts.length} Allergy Conflict{crossAlerts.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {crossAlerts.length > 0 && (
                          <div className="space-y-2 pt-2">
                            {crossAlerts.map((alert, aIdx) => (
                              <div key={aIdx} className="bg-rose-950/30 border border-rose-900/40 p-3.5 rounded-lg space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                                    Known Allergy Conflict: {alert.patientAllergy}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 text-[10px] font-bold uppercase border border-rose-500/40">
                                    {alert.riskLevel} Risk ({alert.crossReactivityRate})
                                  </span>
                                </div>
                                <p className="text-slate-300 text-[11px] leading-relaxed">
                                  <strong>Pathophysiology / Mechanism:</strong> {alert.mechanism}
                                </p>
                                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-emerald-300 text-[11px]">
                                  <strong>Clinical Action:</strong> {alert.recommendation}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
