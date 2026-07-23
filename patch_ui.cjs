const fs = require('fs');
let code = fs.readFileSync('src/pages/Prescriptions.tsx', 'utf8');

const targetSection = `                {selectedMedForForms.interactions && Array.isArray(selectedMedForForms.interactions) && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Key Interactions</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.interactions.join(", ")}</p>
                  </div>
                )}`;

const replacementSection = `                {selectedMedForForms.interactions && Array.isArray(selectedMedForForms.interactions) && selectedMedForForms.interactions.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Key Interactions</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.interactions.join(", ")}</p>
                  </div>
                )}
                
                {selectedMedForForms.mechanism_of_action && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mechanism of Action</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.mechanism_of_action}</p>
                  </div>
                )}
                {selectedMedForForms.adult_dose && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Adult Dose</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.adult_dose}</p>
                  </div>
                )}
                {selectedMedForForms.pediatric_dose && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pediatric Dose</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.pediatric_dose}</p>
                  </div>
                )}
                {selectedMedForForms.pregnancy_category && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pregnancy Category</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.pregnancy_category}</p>
                  </div>
                )}
                {selectedMedForForms.patient_counseling && Array.isArray(selectedMedForForms.patient_counseling) && selectedMedForForms.patient_counseling.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Patient Counseling</h5>
                    <ul className="text-xs text-slate-600 list-disc list-inside">
                      {selectedMedForForms.patient_counseling.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}`;

if (code.includes(targetSection)) {
  code = code.replace(targetSection, replacementSection);
  fs.writeFileSync('src/pages/Prescriptions.tsx', code);
  console.log("UI replaced successfully.");
} else {
  console.log("UI Target section not found!");
}
