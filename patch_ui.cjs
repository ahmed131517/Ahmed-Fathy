const fs = require('fs');
let content = fs.readFileSync('src/components/DifferentialDiagnosisGrid.tsx', 'utf8');

const oldBlock = `            {/* Rule-Out Logic / Distinguishing Features */}
            {selectedDiagnosis.likelihoodRatios && (
              <div className="mb-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Clinical Reasoning (LR Weights)
                </h5>
                <div className="space-y-1.5">
                  {selectedDiagnosis.likelihoodRatios.map((lr, i) => {
                    const isPresent = symptoms.some(s => s.id === lr.symptomId);
                    
                    // Cap the bar width visual at LR 10 for display purposes
                    const lrPosScore = Math.min(lr.lrPositive, 10);
                    const lrNegScore = Math.min(1 / (lr.lrNegative || 1), 10); // Inverse for negative

                    return (
                      <div key={i} className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
                        <div className="flex items-center justify-between z-10">
                          <span className="text-[10px] text-slate-700 font-bold capitalize">{lr.symptomId.replace(/_/g, ' ')}</span>
                          <span className={cn(
                            "text-[9px] font-black px-1.5 py-0.5 rounded border shadow-sm",
                            isPresent ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"
                          )}>
                            {isPresent ? \`Match: +\${lr.lrPositive}x\` : \`Absent: \${lr.lrNegative}x\`}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-1 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                          {/* Positive predictive value bar */}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[7px] text-emerald-600 font-bold uppercase tracking-widest">Rule-In Power (LR+)</span>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: \`\${(lrPosScore / 10) * 100}%\` }} />
                            </div>
                          </div>
                          {/* Negative predictive value bar */}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[7px] text-indigo-600 font-bold uppercase tracking-widest">Rule-Out Power (LR-)</span>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-400 rounded-full" style={{ width: \`\${(lrNegScore / 10) * 100}%\` }} />
                            </div>
                          </div>
                        </div>

                        {/* Subtle background highlight if matched */}
                        {isPresent && (
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}`;

const newBlock = `            {/* Symptom Presentation Match / Clinical Reasoning */}
            <div className="mb-4">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Symptom Presentation Match
              </h5>
              <div className="space-y-1.5">
                {Array.from(new Set([
                  ...selectedDiagnosis.commonSymptoms,
                  ...(selectedDiagnosis.likelihoodRatios?.map(lr => lr.symptomId) || [])
                ])).map((sId, i) => {
                  const isPresent = symptoms.some(s => s.id === sId);
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
                          {isPresent ? (lr ? \`Match: +\${lr.lrPositive}x\` : 'Match') : (lr ? \`Absent: \${lr.lrNegative}x\` : 'Absent')}
                        </span>
                      </div>
                      
                      {lr && (
                        <div className="grid grid-cols-2 gap-2 mt-1 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                          {/* Positive predictive value bar */}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[7px] text-emerald-600 font-bold uppercase tracking-widest">Rule-In Power (LR+)</span>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: \`\${(lrPosScore / 10) * 100}%\` }} />
                            </div>
                          </div>
                          {/* Negative predictive value bar */}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[7px] text-indigo-600 font-bold uppercase tracking-widest">Rule-Out Power (LR-)</span>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-400 rounded-full" style={{ width: \`\${(lrNegScore / 10) * 100}%\` }} />
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
            </div>`;

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync('src/components/DifferentialDiagnosisGrid.tsx', content, 'utf8');
  console.log("Successfully updated UI!");
} else {
  console.log("Could not find the block to replace.");
}
