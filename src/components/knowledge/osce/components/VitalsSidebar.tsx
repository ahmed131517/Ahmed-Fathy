import React from 'react';
import { HeartPulse } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Scenario, VitalSigns } from '../osceTypes';

interface VitalsSidebarProps {
  scenario: Scenario | null;
  timeRemaining: number;
  currentVitals: VitalSigns;
  orderedInvestigations: string[];
  isActive: boolean;
  onOrderInvestigation: (type: string) => void;
}

export function VitalsSidebar({
  scenario,
  timeRemaining,
  currentVitals,
  orderedInvestigations,
  isActive,
  onOrderInvestigation
}: VitalsSidebarProps) {
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-64 flex flex-col gap-4 shrink-0">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
            {scenario?.patientInfo.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{scenario?.patientInfo.name}</h3>
            <p className="text-xs text-slate-500">{scenario?.patientInfo.age}y {scenario?.patientInfo.gender}</p>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="text-xs uppercase font-bold text-slate-500 mb-1">Time Remaining</div>
          <div className={cn("text-xl font-mono font-bold", timeRemaining < 300 ? "text-red-600" : "text-green-600")}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex-1 overflow-y-auto">
        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm"><HeartPulse className="w-4 h-4"/> Vitals Monitor</h4>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-red-50 p-2 rounded-xl border border-red-100">
            <div className="text-[10px] uppercase font-bold text-red-600 mb-1">HR</div>
            <div className="text-lg font-bold text-red-700">{currentVitals.hr}</div>
          </div>
          <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
            <div className="text-[10px] uppercase font-bold text-blue-600 mb-1">BP</div>
            <div className="text-base font-bold text-blue-700">{currentVitals.bp}</div>
          </div>
          <div className="bg-cyan-50 p-2 rounded-xl border border-cyan-100">
            <div className="text-[10px] uppercase font-bold text-cyan-600 mb-1">SpO2</div>
            <div className="text-lg font-bold text-cyan-700">{currentVitals.spo2}%</div>
          </div>
          <div className="bg-orange-50 p-2 rounded-xl border border-orange-100">
            <div className="text-[10px] uppercase font-bold text-orange-600 mb-1">RR</div>
            <div className="text-lg font-bold text-orange-700">{currentVitals.rr}</div>
          </div>
          <div className="bg-green-50 p-2 rounded-xl border border-green-100 col-span-2">
            <div className="text-[10px] uppercase font-bold text-green-600 mb-1">Temp</div>
            <div className="text-base font-bold text-green-700">{currentVitals.temp} °C</div>
          </div>
        </div>

        <h4 className="font-bold text-slate-900 mb-3 text-sm">Order Labs & Imaging</h4>
        <div className="grid grid-cols-2 gap-2">
          {['ECG', 'CXR', 'CBC', 'BMP', 'Troponin', 'D-Dimer', 'ABG', 'Ultrasound', 'CT', 'Urinalysis'].map(ix => (
            <button 
              key={ix}
              onClick={() => onOrderInvestigation(ix)}
              disabled={orderedInvestigations.includes(ix) || !isActive}
              className="text-[11px] py-1.5 px-2 border border-slate-200 rounded hover:bg-indigo-50 disabled:opacity-50 font-medium transition-colors"
            >
              {ix}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
