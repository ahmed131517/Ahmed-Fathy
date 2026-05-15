import React from 'react';
import { ClinicalCalculators } from '@/services/clinical.calculators';
import { SimulationService } from '@/services/clinical.simulations.service';
import { PatientRecord } from '@/lib/db';
import { Zap, BrainCircuit, Activity } from 'lucide-react';

interface Props {
  patient: any; // Using 'any' as PatientRecord structure might vary slightly, will cast if needed
  latestVitals: any;
}

export function ClinicalIntelligencePanel({ patient, latestVitals }: Props) {
  if (!patient) return null;
  
  const bmi = ClinicalCalculators.calculateBMI(latestVitals?.weight || 0, latestVitals?.height || 0);
  const eGFR = ClinicalCalculators.calculateEGFR(patient?.age || 0, latestVitals?.weight || 0, latestVitals?.glucose || 1, false); 
  const sim = SimulationService.simulateTreatment(patient, "ACE inhibitor");

  return (
    <div className="card-panel p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BrainCircuit className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-lg">Clinical Intelligence</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <p className="text-xs text-slate-500 font-bold uppercase">BMI</p>
          <p className="text-xl font-bold font-mono">{bmi}</p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <p className="text-xs text-slate-500 font-bold uppercase">eGFR</p>
          <p className="text-xl font-bold font-mono">{eGFR}</p>
        </div>
      </div>

      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-indigo-600" />
          <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Patient Twin: ACEi Simulation</p>
        </div>
        <p className="text-sm text-indigo-800 dark:text-indigo-300">
          Improvement Probability: <span className="font-bold">{(sim.improvementProb * 100).toFixed(0)}%</span>
        </p>
        {sim.risks.length > 0 && (
          <ul className="mt-2 text-xs text-amber-700 dark:text-amber-400">
            {sim.risks.map((risk, i) => <li key={i}>⚠️ {risk}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
