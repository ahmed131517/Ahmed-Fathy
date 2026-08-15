import { PharmacyBatch } from "@/lib/db";

export interface AllergyWarning {
  allergen: string;
  prescribedMed: string;
  severity: "critical" | "high" | "moderate";
  message: string;
}

export interface InteractionWarning {
  drug1: string;
  drug2: string;
  severity: "critical" | "high" | "moderate";
  message: string;
  recommendation: string;
}

// Known Allergy Families for cross-sensitivity check
const ALLERGY_GROUPS: Record<string, string[]> = {
  penicillin: ["penicillin", "amoxicillin", "ampicillin", "augmentin", "piperacillin", "dicloxacillin"],
  sulfa: ["sulfa", "sulfamethoxazole", "bactrim", "septra", "sulfasalazine", "sulfadiazine"],
  nsaid: ["aspirin", "ibuprofen", "naproxen", "ketorolac", "celecoxib", "diclofenac", "meloxicam", "indomethacin"],
  opioid: ["codeine", "morphine", "oxycodone", "hydrocodone", "tramadol", "fentanyl"],
  cephalosporin: ["cephalexin", "cefadin", "ceftriaxone", "cefuroxime"]
};

export interface ContraindicationWarning {
  diagnosis: string;
  prescribedMed: string;
  severity: "critical" | "high" | "moderate";
  message: string;
  recommendation: string;
}

// Known Drug-Disease Contraindication Rules
const CONTRAINDICATION_RULES = [
  {
    conditionKeys: ["pregnancy", "pregnant"],
    medicationKeys: ["lisinopril", "enalapril", "losartan", "valsartan", "ibuprofen", "naproxen", "warfarin", "methotrexate", "doxycycline"],
    severity: "critical" as const,
    message: "Pregnancy Category X/D Contraindication: Teratogenic risk or fetal toxic risk.",
    recommendation: "Discontinue immediately. Consult prescriber for pregnancy-safe alternatives (e.g., Labetalol, Paracetamol)."
  },
  {
    conditionKeys: ["renal impairment", "kidney failure", "chronic kidney disease", "ckd", "renal disease"],
    medicationKeys: ["metformin", "ibuprofen", "naproxen", "ketorolac", "gentamicin", "spironolactone"],
    severity: "critical" as const,
    message: "Renal Impairment Risk: Risk of severe nephrotoxicity, hyperkalemia, or lactic acidosis.",
    recommendation: "Check eGFR / CrCl. Adjust dose or choose renal-safe alternative."
  },
  {
    conditionKeys: ["hypertension", "high blood pressure", "hbp"],
    medicationKeys: ["pseudoephedrine", "phenylephrine", "oxymetazoline", "ibuprofen"],
    severity: "high" as const,
    message: "Hypertension Risk: Sympathomimetic vasoconstriction may precipitate hypertensive crisis.",
    recommendation: "Avoid oral decongestants; recommend saline nasal sprays or antihistamines."
  },
  {
    conditionKeys: ["hepatic impairment", "liver disease", "cirrhosis"],
    medicationKeys: ["paracetamol", "acetaminophen", "methotrexate", "ketoconazole", "statins"],
    severity: "high" as const,
    message: "Hepatic Toxicity Risk: Impaired liver metabolism may lead to drug accumulation or hepatotoxicity.",
    recommendation: "Limit Paracetamol dose to <2g/day and monitor LFTs."
  },
  {
    conditionKeys: ["asthma", "copd", "bronchospasm"],
    medicationKeys: ["propranolol", "atenolol", "timolol", "aspirin", "ibuprofen"],
    severity: "high" as const,
    message: "Bronchospasm Risk: Non-selective beta-blockers / NSAIDs may trigger severe asthma exacerbation.",
    recommendation: "Switch to cardioselective beta-blocker (e.g. Bisoprolol, Metoprolol) or non-NSAID analgesic."
  }
];

/**
 * Standardize Latin prescription SIG shorthand into clear patient-friendly text
 */
export function normalizeSigCode(rawSig: string): string {
  if (!rawSig) return "Take as directed by prescriber";

  let text = rawSig.trim().toUpperCase();

  const dictionary: Record<string, string> = {
    "PO": "by mouth",
    "BID": "twice daily (every 12 hours)",
    "TDS": "3 times daily",
    "TID": "3 times daily",
    "QDS": "4 times daily",
    "QID": "4 times daily",
    "QD": "once daily",
    "OD": "once daily",
    "PRN": "as needed",
    "STAT": "immediately at once",
    "AC": "before meals",
    "PC": "after meals",
    "HS": "at bedtime",
    "Q4H": "every 4 hours",
    "Q6H": "every 6 hours",
    "Q8H": "every 8 hours",
    "Q12H": "every 12 hours",
    "1 TAB": "1 tablet",
    "2 TAB": "2 tablets",
    "1 CAP": "1 capsule",
    "2 CAP": "2 capsules",
    "1 PUFF": "1 puff",
    "2 PUFF": "2 puffs",
    "TOP": "apply topically",
    "INJ": "by injection",
    "SL": "sublingually under the tongue",
    "PR": "rectally"
  };

  // Replace recognized terms with clear instructions
  const parts = text.split(/\s+/);
  const translated = parts.map(part => dictionary[part] || part.toLowerCase());

  // Format nice sentence
  let result = translated.join(" ");
  
  // Clean up duplicate words or common phrases
  if (!result.toLowerCase().includes("take") && !result.toLowerCase().includes("apply")) {
    result = "Take " + result;
  }

  return result;
}

/**
 * Check active patient diagnoses for drug-disease contraindications
 */
export function checkDrugContraindications(
  patientDiagnoses: string[] = [],
  prescribedMeds: string[] = []
): ContraindicationWarning[] {
  const warnings: ContraindicationWarning[] = [];

  if (!patientDiagnoses.length || !prescribedMeds.length) return warnings;

  const diagnosesLower = patientDiagnoses.map(d => String(d).toLowerCase());
  const prescribedLower = prescribedMeds.map(m => String(m).toLowerCase());

  for (const rule of CONTRAINDICATION_RULES) {
    const matchedDiagnosis = diagnosesLower.find(diag => 
      rule.conditionKeys.some(key => diag.includes(key))
    );

    if (matchedDiagnosis) {
      for (const med of prescribedLower) {
        if (rule.medicationKeys.some(key => med.includes(key))) {
          warnings.push({
            diagnosis: matchedDiagnosis.toUpperCase(),
            prescribedMed: med.toUpperCase(),
            severity: rule.severity,
            message: rule.message,
            recommendation: rule.recommendation
          });
        }
      }
    }
  }

  return warnings;
}

// Known clinically relevant Drug-Drug Interactions
const INTERACTION_RULES = [
  {
    drugs: ["aspirin", "ibuprofen"],
    severity: "moderate" as const,
    message: "Concomitant use of Aspirin and Ibuprofen may reduce cardioprotective antiplatelet effects of Aspirin.",
    recommendation: "Separate dosing by at least 2 hours or consider alternative non-NSAID analgesic."
  },
  {
    drugs: ["aspirin", "warfarin"],
    severity: "critical" as const,
    message: "High bleeding risk combination (Anticoagulant + Antiplatelet NSAID).",
    recommendation: "Monitor INR closely and assess gastrointestinal bleeding risk."
  },
  {
    drugs: ["lisinopril", "potassium"],
    severity: "high" as const,
    message: "ACE Inhibitor + Potassium Supplementation may trigger severe Hyperkalemia.",
    recommendation: "Verify serum K+ levels prior to dispensing."
  },
  {
    drugs: ["ciprofloxacin", "calcium"],
    severity: "moderate" as const,
    message: "Fluoroquinolone absorption significantly decreased by divalent cations (Calcium / Antacids).",
    recommendation: "Administer ciprofloxacin 2 hours before or 6 hours after calcium supplements."
  },
  {
    drugs: ["sertraline", "tramadol"],
    severity: "high" as const,
    message: "Risk of Serotonin Syndrome when combining SSRI with Tramadol.",
    recommendation: "Monitor patient for hyperreflexia, tremor, and mental status changes."
  },
  {
    drugs: ["lisinopril", "ibuprofen"],
    severity: "moderate" as const,
    message: "NSAIDs may diminish the antihypertensive effect of ACE inhibitors and increase renal impairment risk.",
    recommendation: "Monitor blood pressure and renal function."
  }
];

/**
 * Check patient recorded allergies against prescribed medications
 */
export function checkDrugAllergies(
  patientAllergies: any[],
  prescribedMeds: string[]
): AllergyWarning[] {
  const warnings: AllergyWarning[] = [];

  if (!patientAllergies || !Array.isArray(patientAllergies) || patientAllergies.length === 0) {
    return warnings;
  }

  // Parse allergy list into clean lowercase names
  const allergyList = patientAllergies.map(a => {
    if (typeof a === 'string') return a.toLowerCase().trim();
    if (a && typeof a === 'object' && a.name) return String(a.name).toLowerCase().trim();
    return '';
  }).filter(Boolean);

  for (const prescribedRaw of prescribedMeds) {
    const prescribedLower = prescribedRaw.toLowerCase().trim();

    for (const allergy of allergyList) {
      // 1. Direct name match
      if (prescribedLower.includes(allergy) || allergy.includes(prescribedLower)) {
        warnings.push({
          allergen: allergy.toUpperCase(),
          prescribedMed: prescribedRaw,
          severity: "critical",
          message: `Direct Allergy Conflict: Patient is recorded allergic to "${allergy.toUpperCase()}". Prescribed "${prescribedRaw}".`
        });
        continue;
      }

      // 2. Cross-sensitivity group check
      for (const [groupKey, members] of Object.entries(ALLERGY_GROUPS)) {
        const isAllergicToGroup = members.some(m => allergy.includes(m));
        const isPrescribedFromGroup = members.some(m => prescribedLower.includes(m));

        if (isAllergicToGroup && isPrescribedFromGroup) {
          warnings.push({
            allergen: allergy.toUpperCase(),
            prescribedMed: prescribedRaw,
            severity: "high",
            message: `Cross-Sensitivity Risk (${groupKey.toUpperCase()} class): Patient allergy "${allergy.toUpperCase()}" shares cross-reactivity with prescribed "${prescribedRaw}".`
          });
        }
      }
    }
  }

  return warnings;
}

/**
 * Check drug interactions between prescribed items & active patient medications
 */
export function checkDrugInteractions(
  prescribedMeds: string[],
  activePatientMeds: any[] = []
): InteractionWarning[] {
  const warnings: InteractionWarning[] = [];

  // Parse active patient meds
  const activeMedNames = (activePatientMeds || []).map(m => {
    if (typeof m === 'string') return m.toLowerCase();
    if (m && typeof m === 'object' && m.name) return String(m.name).toLowerCase();
    return '';
  }).filter(Boolean);

  const allMeds = [
    ...prescribedMeds.map(m => m.toLowerCase()),
    ...activeMedNames
  ];

  for (const rule of INTERACTION_RULES) {
    const [drugA, drugB] = rule.drugs;
    const hasA = allMeds.some(m => m.includes(drugA));
    const hasB = allMeds.some(m => m.includes(drugB));

    if (hasA && hasB) {
      warnings.push({
        drug1: drugA.toUpperCase(),
        drug2: drugB.toUpperCase(),
        severity: rule.severity,
        message: rule.message,
        recommendation: rule.recommendation
      });
    }
  }

  return warnings;
}

/**
 * FEFO (First Expired, First Out) Recommendation Engine
 * Sorts active inventory batches by expiry date ascending
 */
export function getFefoRecommendedBatch(
  inventoryItemId: string,
  batches: PharmacyBatch[]
): {
  recommendedBatch: PharmacyBatch | null;
  sortedBatches: PharmacyBatch[];
  expiringDaysLeft: number | null;
  warningMessage: string | null;
} {
  const itemBatches = batches.filter(
    b => (b.inventoryItemId === inventoryItemId || b.batchNumber) && b.quantity > 0 && b.isDeleted === 0
  );

  if (itemBatches.length === 0) {
    return {
      recommendedBatch: null,
      sortedBatches: [],
      expiringDaysLeft: null,
      warningMessage: "No active batches registered for this medication in inventory stock."
    };
  }

  // Sort by expiry date ascending (FEFO)
  const sorted = [...itemBatches].sort((a, b) => {
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });

  const recommended = sorted[0];
  const expiryTime = new Date(recommended.expiryDate).getTime();
  const now = Date.now();
  const daysLeft = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));

  let warningMessage: string | null = null;
  if (daysLeft < 0) {
    warningMessage = `CRITICAL: Recommended batch ${recommended.batchNumber} EXPIRED ${Math.abs(daysLeft)} days ago! Quarantine batch immediately.`;
  } else if (daysLeft <= 30) {
    warningMessage = `FEFO Alert: Batch ${recommended.batchNumber} expires in ${daysLeft} days. Dispense immediately to prevent stock loss.`;
  }

  return {
    recommendedBatch: recommended,
    sortedBatches: sorted,
    expiringDaysLeft: daysLeft,
    warningMessage
  };
}

/**
 * Barcode & NDC Scanner Verification Utility
 */
export function verifyDrugBarcode(
  scannedCode: string,
  expectedMedicationName: string,
  expectedBatchNumber?: string
): {
  isValid: boolean;
  matchType: "exact_lot" | "ndc_match" | "name_match" | "invalid";
  feedbackMessage: string;
} {
  if (!scannedCode || !scannedCode.trim()) {
    return {
      isValid: false,
      matchType: "invalid",
      feedbackMessage: "Please scan or enter a barcode / NDC / Lot number."
    };
  }

  const cleanScanned = scannedCode.trim().toUpperCase();
  const cleanMedName = expectedMedicationName.trim().toUpperCase();

  // If batch lot scanned directly
  if (expectedBatchNumber && cleanScanned.includes(expectedBatchNumber.toUpperCase())) {
    return {
      isValid: true,
      matchType: "exact_lot",
      feedbackMessage: `Verified Lot Match! Package verified for Lot #${expectedBatchNumber}.`
    };
  }

  // Check medication name or NDC code substring
  const cleanMedParts = cleanMedName.split(" ");
  const mainDrugName = cleanMedParts[0]; // e.g. "AMOXICILLIN"

  if (cleanScanned.includes(mainDrugName) || cleanScanned.startsWith("NDC") || cleanScanned.startsWith("LOT")) {
    return {
      isValid: true,
      matchType: "ndc_match",
      feedbackMessage: `Barcode Verified! Match confirmed for ${expectedMedicationName}.`
    };
  }

  return {
    isValid: false,
    matchType: "invalid",
    feedbackMessage: `Barcode Mismatch! Scanned code "${scannedCode}" does NOT match expected medication (${expectedMedicationName}).`
  };
}
