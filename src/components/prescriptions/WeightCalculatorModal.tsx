import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  X, 
  Scale, 
  Activity, 
  Droplets, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeightCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientWeight?: string;
  initialConcentration?: string;
  medicationName: string;
  form?: string;
  onApply: (dosage: string, instructions: string) => void;
}

export const WeightCalculatorModal: React.FC<WeightCalculatorModalProps> = ({
  isOpen,
  onClose,
  patientWeight,
  initialConcentration,
  medicationName,
  form = "",
  onApply
}) => {
  const [weight, setWeight] = useState(patientWeight || "");
  const [dosePerKg, setDosePerKg] = useState("");

  // Sync weight from props when modal opens or patient weight changes
  useEffect(() => {
    if (isOpen && patientWeight) {
      setWeight(patientWeight);
    }
  }, [isOpen, patientWeight]);
  const [concentration, setConcentration] = useState(initialConcentration || "");
  const [concentrationValue, setConcentrationValue] = useState("");
  const [concentrationVolume, setConcentrationVolume] = useState("");
  const [frequency, setFrequency] = useState("BID");
  
  const [result, setResult] = useState<{
    totalDoseMg: number;
    volumeMl: number;
    units: number;
    text: string;
  } | null>(null);

  useEffect(() => {
    if (weight && dosePerKg) {
      const w = parseFloat(weight);
      const d = parseFloat(dosePerKg);
      
      if (!isNaN(w) && !isNaN(d)) {
        const totalDoseMg = w * d;
        let volumeMl = 0;
        let units = 0;
        let resultText = `${totalDoseMg} mg per dose`;

        const val = parseFloat(concentrationValue);
        const vol = parseFloat(concentrationVolume);

        const isLiquid = /syrup|suspension|liquid|solution|drops|vial|ampoule|inj/i.test(form);
        const isSolid = /tab|cap|tablet|capsule/i.test(form);

        if (!isNaN(val) && val > 0) {
          if (isLiquid && !isNaN(vol)) {
            volumeMl = (totalDoseMg * vol) / val;
            resultText = `${totalDoseMg} mg (${volumeMl.toFixed(1)} ml) per dose`;
          } else if (isSolid) {
            units = totalDoseMg / val;
            const unitLabel = form.toLowerCase().includes('cap') ? 'cap' : 'tab';
            resultText = `${totalDoseMg} mg (${units % 1 === 0 ? units : units.toFixed(1)} ${unitLabel}) per dose`;
          }
        }

        setResult({
          totalDoseMg,
          volumeMl,
          units,
          text: resultText
        });
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [weight, dosePerKg, concentrationValue, concentrationVolume, form]);

  // Try to parse initial concentration if it looks like "500mg/5ml" or "100mg"
  useEffect(() => {
    if (initialConcentration) {
      const match = initialConcentration.match(/(\d+)\s*mg\s*\/\s*(\d+)\s*ml/i);
      if (match) {
        setConcentrationValue(match[1]);
        setConcentrationVolume(match[2]);
      } else {
        const singleMatch = initialConcentration.match(/(\d+)\s*mg/i);
        if (singleMatch) {
          setConcentrationValue(singleMatch[1]);
          setConcentrationVolume("1");
        }
      }
    }
  }, [initialConcentration]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-lg">Peds Dose Calculator</h3>
                <p className="text-indigo-100 text-xs">{medicationName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Weight (kg)</label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="kg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Dose (mg/kg)</label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number"
                    value={dosePerKg}
                    onChange={(e) => setDosePerKg(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="mg/kg"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-600 uppercase">Concentration Details</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Amount (mg)</label>
                  <input 
                    type="number"
                    value={concentrationValue}
                    onChange={(e) => setConcentrationValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    placeholder="250"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Volume (ml)</label>
                  <input 
                    type="number"
                    value={concentrationVolume}
                    onChange={(e) => setConcentrationVolume(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    placeholder="5"
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-center overflow-hidden"
                >
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Calculated Dose</p>
                  <p className="text-2xl font-black text-emerald-700">{result.text}</p>
                  <p className="text-[10px] text-emerald-500 mt-2 italic font-medium">
                    {weight} kg × {dosePerKg} mg/kg = {result.totalDoseMg} mg
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-slate-600 font-bold text-sm hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              disabled={!result}
              onClick={() => {
                if (result) {
                  const isLiquid = /syrup|suspension|liquid|solution|drops|vial|ampoule|inj/i.test(form);
                  const isSolid = /tab|cap|tablet|capsule/i.test(form);
                  
                  let dosageStr = `${result.totalDoseMg} mg`;
                  
                  if (isLiquid && result.volumeMl > 0) {
                    dosageStr = `${result.volumeMl.toFixed(1)} ml`;
                  } else if (isSolid && result.units > 0) {
                    const unitLabel = form.toLowerCase().includes('cap') ? 'cap' : 'tab';
                    dosageStr = `${result.units % 1 === 0 ? result.units : result.units.toFixed(1)} ${unitLabel}`;
                  }

                  const instructionStr = `Calculated based on ${dosePerKg} mg/kg for ${weight} kg weight.`;
                  onApply(dosageStr, instructionStr);
                }
              }}
              className="flex-2 flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-100"
            >
              <Check className="w-4 h-4" />
              Apply to Prescription
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
