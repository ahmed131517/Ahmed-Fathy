export interface LabTest {
  name: string;
  category: string;
  unit?: string;
  referenceRange?: string;
}

export const LAB_REFERENCE_DATA: Record<string, LabTest[]> = {
  hematology: [
    { name: "Complete Blood Count (CBC)", category: "hematology" },
    { name: "Hemoglobin", category: "hematology", unit: "g/dL", referenceRange: "13.5-17.5" },
    { name: "White Blood Cell Count (WBC)", category: "hematology", unit: "10^3/uL", referenceRange: "4.5-11.0" },
    { name: "Platelet Count", category: "hematology", unit: "10^3/uL", referenceRange: "150-450" },
    { name: "Prothrombin Time (PT)", category: "hematology", unit: "sec", referenceRange: "11-13.5" },
  ],
  renal: [
    { name: "Creatinine", category: "renal", unit: "mg/dL", referenceRange: "0.7-1.3" },
    { name: "Blood Urea Nitrogen (BUN)", category: "renal", unit: "mg/dL", referenceRange: "7-20" },
    { name: "eGFR", category: "renal", unit: "mL/min/1.73m2", referenceRange: ">60" },
  ],
  hepatic: [
    { name: "ALT (Alanine Aminotransferase)", category: "hepatic", unit: "U/L", referenceRange: "7-55" },
    { name: "AST (Aspartate Aminotransferase)", category: "hepatic", unit: "U/L", referenceRange: "8-48" },
    { name: "Alkaline Phosphatase", category: "hepatic", unit: "U/L", referenceRange: "40-129" },
    { name: "Bilirubin, Total", category: "hepatic", unit: "mg/dL", referenceRange: "0.1-1.2" },
  ],
  lipids: [
    { name: "Total Cholesterol", category: "lipids", unit: "mg/dL", referenceRange: "<200" },
    { name: "HDL Cholesterol", category: "lipids", unit: "mg/dL", referenceRange: ">40" },
    { name: "LDL Cholesterol", category: "lipids", unit: "mg/dL", referenceRange: "<100" },
    { name: "Triglycerides", category: "lipids", unit: "mg/dL", referenceRange: "<150" },
  ],
  electrolytes: [
    { name: "Sodium", category: "electrolytes", unit: "mEq/L", referenceRange: "135-145" },
    { name: "Potassium", category: "electrolytes", unit: "mEq/L", referenceRange: "3.6-5.2" },
    { name: "Chloride", category: "electrolytes", unit: "mEq/L", referenceRange: "96-106" },
    { name: "Bicarbonate", category: "electrolytes", unit: "mEq/L", referenceRange: "22-29" },
  ],
  imaging: [
    { name: "Chest X-Ray", category: "imaging" },
    { name: "Abdominal Ultrasound", category: "imaging" },
    { name: "CT Brain (Non-Contrast)", category: "imaging" },
    { name: "MRI Lumbar Spine", category: "imaging" },
  ],
  urine: [
    { name: "Urinalysis, Complete", category: "urine" },
    { name: "Urine Culture", category: "urine" },
    { name: "Urine Protein/Creatinine Ratio", category: "urine" },
  ]
};

export const ALL_TESTS = Object.values(LAB_REFERENCE_DATA).flat();
