import React from 'react';
import { Activity } from 'lucide-react';

interface PrescriptionVitalsProps {
  vitals: {
    bp: string;
    p: string;
    temp: string;
    rr: string;
    sao2: string;
    rbs: string;
    oe: string;
    co: string;
    ph: string;
  };
  setVitals: (v: any) => void;
}

export function PrescriptionVitals({ vitals, setVitals }: PrescriptionVitalsProps) {
  const updateVital = (key: string, value: string) => {
    setVitals({ ...vitals, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-500" /> Patient Vitals
        </h3>
      </div>
      <div className="p-4 grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">BP</label>
          <input 
            type="text" 
            value={vitals.bp}
            onChange={(e) => updateVital('bp', e.target.value)}
            className="w-full p-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none" 
            placeholder="120/80"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">P</label>
          <input 
            type="text" 
            value={vitals.p}
            onChange={(e) => updateVital('p', e.target.value)}
            className="w-full p-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none" 
            placeholder="72"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Temp</label>
          <input 
            type="text" 
            value={vitals.temp}
            onChange={(e) => updateVital('temp', e.target.value)}
            className="w-full p-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none" 
            placeholder="37.0"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RR</label>
          <input 
            type="text" 
            value={vitals.rr}
            onChange={(e) => updateVital('rr', e.target.value)}
            className="w-full p-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none" 
            placeholder="16"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SaO2</label>
          <input 
            type="text" 
            value={vitals.sao2}
            onChange={(e) => updateVital('sao2', e.target.value)}
            className="w-full p-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none" 
            placeholder="98%"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RBS</label>
          <input 
            type="text" 
            value={vitals.rbs}
            onChange={(e) => updateVital('rbs', e.target.value)}
            className="w-full p-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none" 
            placeholder="110"
          />
        </div>
      </div>
    </div>
  );
}
