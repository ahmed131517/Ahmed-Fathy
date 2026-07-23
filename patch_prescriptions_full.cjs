const fs = require('fs');
let code = fs.readFileSync('src/pages/Prescriptions.tsx', 'utf8');

// 1. Update import from data/medications
code = code.replace(
  'import { medicationsDatabase } from "@/data/medications";',
  'import { medicationsDatabase, enrichDrug } from "@/data/medications";'
);

// 2. Update allMedications definition
code = code.replace(
  'const allMedications = Object.values(medicationsDatabase).flat();',
  'const allMedications = Object.values(medicationsDatabase).flat().map(m => enrichDrug(m));'
);

// 3. Replace handleMedicationSelect
const oldSelect = `  const handleMedicationSelect = async (med: any) => {
    if (med.id && typeof med.id === 'number') {
      // It's a DB med
      try {
        const details = await medicationService.getMedicationDetails(med.id);
        // Map DB details to the format expected by the UI
        const mappedMed = {
          id: details.id,
          name: details.generic_name,
          contraindications: details.contraindications,
          sideEffects: details.sideEffects,
          interactions: details.interactions,
          mechanism_of_action: details.mechanism_of_action,
          adult_dose: details.adult_dose,
          pediatric_dose: details.pediatric_dose,
          pregnancy_category: details.pregnancy_category,
          patient_counseling: details.patient_counseling,
          forms: details.brands.map(b => ({ id: \`brand_\${b.id}\`, name: b.brand_name }))
        };
        // If no brands, check strengths or just use generic
        if (mappedMed.forms.length === 0) {
          mappedMed.forms = [{ id: \`generic_\${details.id}\`, name: "Generic" }];
        }
        setSelectedMedForForms(mappedMed);
      } catch (error) {
        console.error("Failed to get med details", error);
        toast.error("Failed to load medication details");
      }
    } else {
      // It's a mock med
      setSelectedMedForForms(med);
    }
  };`;

const newSelect = `  const handleMedicationSelect = async (med: any) => {
    if (med.id && typeof med.id === 'number') {
      try {
        const details = await medicationService.getMedicationDetails(med.id);
        const mappedMed = enrichDrug({
          ...details,
          id: details.id,
          name: details.generic_name,
          generic_name: details.generic_name,
          forms: details.brands && details.brands.length > 0 
            ? details.brands.map(b => ({ id: \`brand_\${b.id}\`, name: b.brand_name }))
            : [{ id: \`generic_\${details.id}\`, name: "Generic Form" }]
        });
        setSelectedMedForForms(mappedMed);
      } catch (error) {
        setSelectedMedForForms(enrichDrug(med));
      }
    } else {
      setSelectedMedForForms(enrichDrug(med));
    }
  };`;

if (code.includes('handleMedicationSelect = async')) {
  const selectStart = code.indexOf('const handleMedicationSelect = async');
  const selectEnd = code.indexOf('const handleAddMedication =', selectStart);
  if (selectStart !== -1 && selectEnd !== -1) {
    code = code.slice(0, selectStart) + newSelect + "\n\n  " + code.slice(selectEnd);
    console.log("Replaced handleMedicationSelect successfully.");
  }
}

// 4. Replace selectedMedForForms rendering block
const cardStartMarker = '<div className="p-3 border-b border-slate-100 bg-slate-50 space-y-3">';
const cardEndMarker = '<div className="p-3 space-y-2 max-h-60 overflow-y-auto">\n                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Dosage Form</h5>';

const newCardBody = `<div className="p-3 border-b border-slate-100 bg-slate-50 space-y-3 max-h-[400px] overflow-y-auto">
                {/* Badges */}
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {selectedMedForForms.drug_class && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold">
                      Class: {selectedMedForForms.drug_class}
                    </span>
                  )}
                  {selectedMedForForms.route && (
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-medium">
                      Route: {selectedMedForForms.route}
                    </span>
                  )}
                  {selectedMedForForms.strength && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium">
                      Strength: {selectedMedForForms.strength}
                    </span>
                  )}
                  {selectedMedForForms.dosage_form && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">
                      Form: {selectedMedForForms.dosage_form}
                    </span>
                  )}
                </div>

                {/* Egyptian Brands */}
                {selectedMedForForms.brand_names_egypt && Array.isArray(selectedMedForForms.brand_names_egypt) && selectedMedForForms.brand_names_egypt.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">🇪🇬 Brand Names (Egypt)</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedMedForForms.brand_names_egypt.map((b: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-medium">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mechanism of Action */}
                {selectedMedForForms.mechanism_of_action && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">Mechanism of Action</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{selectedMedForForms.mechanism_of_action}</p>
                  </div>
                )}

                {/* Indications */}
                {selectedMedForForms.indications && Array.isArray(selectedMedForForms.indications) && selectedMedForForms.indications.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Indications</h5>
                    <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                      {selectedMedForForms.indications.map((ind: string, i: number) => <li key={i}>{ind}</li>)}
                    </ul>
                  </div>
                )}

                {/* Contraindications */}
                {selectedMedForForms.contraindications && Array.isArray(selectedMedForForms.contraindications) && selectedMedForForms.contraindications.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-500" /> Contraindications
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedMedForForms.contraindications.map((c: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dosing Guidelines */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 text-xs">
                  {selectedMedForForms.adult_dose && (
                    <div>
                      <span className="font-semibold text-slate-700 block text-[10px] uppercase">Adult Dose</span>
                      <span className="text-slate-600 text-[11px]">{selectedMedForForms.adult_dose}</span>
                    </div>
                  )}
                  {selectedMedForForms.pediatric_dose && (
                    <div>
                      <span className="font-semibold text-slate-700 block text-[10px] uppercase">Pediatric Dose</span>
                      <span className="text-slate-600 text-[11px]">{selectedMedForForms.pediatric_dose}</span>
                    </div>
                  )}
                  {selectedMedForForms.renal_dose && (
                    <div>
                      <span className="font-semibold text-slate-700 block text-[10px] uppercase">Renal Dose</span>
                      <span className="text-slate-600 text-[11px]">{selectedMedForForms.renal_dose}</span>
                    </div>
                  )}
                  {selectedMedForForms.hepatic_dose && (
                    <div>
                      <span className="font-semibold text-slate-700 block text-[10px] uppercase">Hepatic Dose</span>
                      <span className="text-slate-600 text-[11px]">{selectedMedForForms.hepatic_dose}</span>
                    </div>
                  )}
                </div>

                {/* Pregnancy & Lactation */}
                {(selectedMedForForms.pregnancy_category || selectedMedForForms.lactation) && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 text-xs">
                    {selectedMedForForms.pregnancy_category && (
                      <div>
                        <span className="font-semibold text-slate-700 block text-[10px] uppercase">Pregnancy Category</span>
                        <span className="text-slate-600 text-[11px]">{selectedMedForForms.pregnancy_category}</span>
                      </div>
                    )}
                    {selectedMedForForms.lactation && (
                      <div>
                        <span className="font-semibold text-slate-700 block text-[10px] uppercase">Lactation</span>
                        <span className="text-slate-600 text-[11px]">{selectedMedForForms.lactation}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Side Effects & Interactions */}
                {selectedMedForForms.sideEffects && Array.isArray(selectedMedForForms.sideEffects) && selectedMedForForms.sideEffects.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Side Effects</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.sideEffects.join(", ")}</p>
                  </div>
                )}

                {selectedMedForForms.interactions && Array.isArray(selectedMedForForms.interactions) && selectedMedForForms.interactions.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Drug Interactions</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.interactions.join(", ")}</p>
                  </div>
                )}

                {selectedMedForForms.food_interactions && Array.isArray(selectedMedForForms.food_interactions) && selectedMedForForms.food_interactions.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Food Interactions</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.food_interactions.join(", ")}</p>
                  </div>
                )}

                {/* Monitoring & Labs */}
                {selectedMedForForms.monitoring_parameters && Array.isArray(selectedMedForForms.monitoring_parameters) && selectedMedForForms.monitoring_parameters.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Monitoring Parameters</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.monitoring_parameters.join(", ")}</p>
                  </div>
                )}

                {selectedMedForForms.lab_tests && Array.isArray(selectedMedForForms.lab_tests) && selectedMedForForms.lab_tests.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Lab Tests</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.lab_tests.join(", ")}</p>
                  </div>
                )}

                {selectedMedForForms.storage && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">Storage</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.storage}</p>
                  </div>
                )}

                {/* Patient Counseling */}
                {selectedMedForForms.patient_counseling && Array.isArray(selectedMedForForms.patient_counseling) && selectedMedForForms.patient_counseling.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Patient Counseling</h5>
                    <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                      {selectedMedForForms.patient_counseling.map((c: string, i: number) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                {/* References */}
                {selectedMedForForms.references && Array.isArray(selectedMedForForms.references) && selectedMedForForms.references.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">References</h5>
                    <p className="text-[10px] text-slate-500 italic">{selectedMedForForms.references.join(" • ")}</p>
                  </div>
                )}
              </div>

              `;

const idxStart = code.indexOf(cardStartMarker);
const idxEnd = code.indexOf('<div className="p-3 space-y-2 max-h-60 overflow-y-auto">', idxStart);

if (idxStart !== -1 && idxEnd !== -1) {
  code = code.slice(0, idxStart) + newCardBody + code.slice(idxEnd);
  console.log("Replaced card body successfully.");
} else {
  console.log("Could not locate card body markers!", idxStart, idxEnd);
}

fs.writeFileSync('src/pages/Prescriptions.tsx', code);
