import React from 'react';
import { AlertTriangle, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { ClinicalPathwayRule } from '@/data/clinicalPathways';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ClinicalGuardrailsProps {
  activePathways: ClinicalPathwayRule[];
}

export function ClinicalGuardrails({ activePathways }: ClinicalGuardrailsProps) {
  if (activePathways.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Clinical Guardrails Active</h3>
      </div>
      
      <AnimatePresence mode="popLayout">
        {activePathways.map((pathway) => (
          <motion.div
            key={pathway.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "p-4 rounded-xl border shadow-sm transition-all",
              pathway.actions.triageLevel === 'high' 
                ? "bg-red-50 border-red-200" 
                : "bg-blue-50 border-blue-200"
            )}
          >
            <div className="flex gap-3">
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                pathway.actions.triageLevel === 'high' ? "bg-red-100" : "bg-blue-100"
              )}>
                <AlertTriangle className={cn(
                  "w-5 h-5",
                  pathway.actions.triageLevel === 'high' ? "text-red-600" : "text-blue-600"
                )} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={cn(
                    "font-bold text-base",
                    pathway.actions.triageLevel === 'high' ? "text-red-900" : "text-blue-900"
                  )}>
                    {pathway.title}
                  </h4>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                    pathway.actions.triageLevel === 'high' ? "bg-red-200 text-red-800" : "bg-blue-200 text-blue-800"
                  )}>
                    {pathway.actions.triageLevel} Priority
                  </span>
                </div>
                
                <p className={cn(
                  "text-sm mb-3",
                  pathway.actions.triageLevel === 'high' ? "text-red-700" : "text-blue-700"
                )}>
                  {pathway.description}
                </p>

                {pathway.actions.alertMessage && (
                  <div className="bg-white/50 p-2 rounded-lg border border-red-200 mb-3 flex items-start gap-2">
                    <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-red-800 italic">
                      {pathway.actions.alertMessage}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Standard of Care Recommendations:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pathway.actions.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs bg-white/40 p-1.5 rounded border border-slate-200/50">
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
