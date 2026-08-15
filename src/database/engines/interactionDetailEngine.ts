import { findClinicalMedicationByName } from '../medications';

export interface DetailedInteraction {
  drug1: string;
  drug2: string;
  severity: '★★★★★ Major' | '★★★ Moderate' | '★ Minor';
  severityLevel: 'Major' | 'Moderate' | 'Minor';
  mechanism: string;
  clinicalRisk: string;
  management: string;
  reference: string;
}

export function evaluateDetailedDrugInteractions(medicationNames: string[]): DetailedInteraction[] {
  if (!medicationNames || medicationNames.length < 2) return [];

  const results: DetailedInteraction[] = [];

  for (let i = 0; i < medicationNames.length; i++) {
    for (let j = i + 1; j < medicationNames.length; j++) {
      const name1 = medicationNames[i];
      const name2 = medicationNames[j];

      const med1 = findClinicalMedicationByName(name1);
      const med2 = findClinicalMedicationByName(name2);

      // Check registered interactions in med1
      if (med1 && med1.interactions) {
        for (const inter of med1.interactions) {
          if (name2.toLowerCase().includes(inter.drug.toLowerCase()) || inter.drug.toLowerCase().includes(name2.toLowerCase())) {
            results.push({
              drug1: med1.generic_name,
              drug2: name2,
              severity: inter.severity === 'Major' ? '★★★★★ Major' : inter.severity === 'Moderate' ? '★★★ Moderate' : '★ Minor',
              severityLevel: inter.severity,
              mechanism: inter.mechanism,
              clinicalRisk: `High risk of adverse pharmacokinetic/pharmacodynamic interaction between ${med1.generic_name} and ${name2}.`,
              management: inter.management,
              reference: 'Lexicomp / DrugBank Clinical Interaction Reference'
            });
          }
        }
      }

      // Check registered interactions in med2
      if (med2 && med2.interactions) {
        for (const inter of med2.interactions) {
          if (name1.toLowerCase().includes(inter.drug.toLowerCase()) || inter.drug.toLowerCase().includes(name1.toLowerCase())) {
            // avoid duplicate
            if (!results.some(r => (r.drug1 === med2.generic_name && r.drug2 === name1) || (r.drug1 === name1 && r.drug2 === med2.generic_name))) {
              results.push({
                drug1: med2.generic_name,
                drug2: name1,
                severity: inter.severity === 'Major' ? '★★★★★ Major' : inter.severity === 'Moderate' ? '★★★ Moderate' : '★ Minor',
                severityLevel: inter.severity,
                mechanism: inter.mechanism,
                clinicalRisk: `High risk of interaction between ${med2.generic_name} and ${name1}.`,
                management: inter.management,
                reference: 'Lexicomp / DrugBank Clinical Interaction Reference'
              });
            }
          }
        }
      }
    }
  }

  return results;
}
