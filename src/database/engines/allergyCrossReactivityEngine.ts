import { findClinicalMedicationByName } from '../medications';

export interface AllergyCrossReactivityAlert {
  patientAllergy: string;
  prescribedDrug: string;
  riskLevel: 'Severe' | 'High' | 'Moderate' | 'Low';
  crossReactivityRate: string;
  mechanism: string;
  recommendation: string;
}

// Cross-reactivity matrix database for clinical safety
const CROSS_REACTIVITY_RULES = [
  {
    allergenGroup: 'penicillin',
    keywords: ['penicillin', 'pen', 'amoxicillin', 'ampicillin', 'augmentin', 'hibiotic'],
    matches: [
      {
        targetGroup: ['amoxicillin', 'ampicillin', 'augmentin', 'hibiotic', 'curam', 'e-mox', 'julphamox'],
        riskLevel: 'Severe' as const,
        crossReactivityRate: '100% Direct Cross-Reactivity',
        mechanism: 'Shared beta-lactam core ring structure and side chains.',
        recommendation: 'ABSOLUTE CONTRAINDICATION. Avoid all aminopenicillins. Switch to Macrolides (Azithromycin) or Fluoroquinolones.'
      },
      {
        targetGroup: ['cephalexin', 'cefadroxil', 'cefazolin', '1st gen cephalosporin'],
        riskLevel: 'Moderate' as const,
        crossReactivityRate: '3% - 5% Cross-Reactivity',
        mechanism: 'Shared R1 side-chain similarity in 1st generation cephalosporins.',
        recommendation: 'Use with extreme caution or perform skin allergy testing prior to administration.'
      },
      {
        targetGroup: ['ceftriaxone', 'cefuroxime', 'cefixime', 'ceftazidime', '3rd gen cephalosporin'],
        riskLevel: 'Low' as const,
        crossReactivityRate: '< 1% Cross-Reactivity',
        mechanism: 'Distinct R1/R2 side-chains minimize IgE cross-recognition.',
        recommendation: 'Generally safe to administer unless patient has history of anaphylaxis or Stevens-Johnson Syndrome.'
      }
    ]
  },
  {
    allergenGroup: 'sulfa',
    keywords: ['sulfa', 'sulfonamide', 'bactrim', 'septra', 'trimethoprim-sulfamethoxazole'],
    matches: [
      {
        targetGroup: ['furosemide', 'lasix', 'hydrochlorothiazide', 'glimepiride', 'celecoxib'],
        riskLevel: 'Moderate' as const,
        crossReactivityRate: 'Theoretical / Low Cross-Reactivity',
        mechanism: 'Non-arylamine sulfonamides lack the N4-arylamine group responsible for IgE antibody binding.',
        recommendation: 'Monitor for skin rash or mild hypersensitivity reactions. Usually safe unless severe skin reaction history.'
      }
    ]
  },
  {
    allergenGroup: 'nsaid',
    keywords: ['aspirin', 'nsaid', 'ibuprofen', 'brufen', 'diclofenac', 'voltaren', 'cataflam', 'naproxen'],
    matches: [
      {
        targetGroup: ['ibuprofen', 'diclofenac', 'ketoprofen', 'naproxen', 'celecoxib', 'brufen', 'voltaren', 'cataflam'],
        riskLevel: 'High' as const,
        crossReactivityRate: '80% - 100% Cross-Reactivity (COX-1 inhibition mediated)',
        mechanism: 'Cross-sensitivity driven by COX-1 inhibition precipitating leukotriene overproduction (Aspirin-Exacerbated Respiratory Disease / AERD).',
        recommendation: 'Avoid all COX-1 inhibiting NSAIDs. Use Paracetamol for analgesia or selective COX-2 inhibitor under supervision.'
      }
    ]
  }
];

export function checkAllergyCrossReactivity(patientAllergies: string[], prescribedDrugName: string): AllergyCrossReactivityAlert[] {
  if (!patientAllergies || patientAllergies.length === 0 || !prescribedDrugName) return [];

  const alerts: AllergyCrossReactivityAlert[] = [];
  const drugLower = prescribedDrugName.toLowerCase();
  const medObj = findClinicalMedicationByName(prescribedDrugName);

  for (const allergy of patientAllergies) {
    if (!allergy) continue;
    const allergyLower = allergy.toLowerCase();

    // Check direct match
    if (drugLower.includes(allergyLower) || allergyLower.includes(drugLower) || (medObj && medObj.generic_name.toLowerCase().includes(allergyLower))) {
      alerts.push({
        patientAllergy: allergy,
        prescribedDrug: prescribedDrugName,
        riskLevel: 'Severe',
        crossReactivityRate: '100% Direct Allergy Match',
        mechanism: 'Direct allergen match reported in patient record.',
        recommendation: 'CONTRAINDICATED. Do not dispense prescribed medication. Select alternative drug class.'
      });
      continue;
    }

    // Check cross-reactivity matrix
    for (const rule of CROSS_REACTIVITY_RULES) {
      const isAllergenicGroup = rule.keywords.some(kw => allergyLower.includes(kw));
      if (isAllergenicGroup) {
        for (const match of rule.matches) {
          const isTargetDrug = match.targetGroup.some(tg => drugLower.includes(tg));
          if (isTargetDrug) {
            alerts.push({
              patientAllergy: allergy,
              prescribedDrug: prescribedDrugName,
              riskLevel: match.riskLevel,
              crossReactivityRate: match.crossReactivityRate,
              mechanism: match.mechanism,
              recommendation: match.recommendation
            });
          }
        }
      }
    }
  }

  return alerts;
}
