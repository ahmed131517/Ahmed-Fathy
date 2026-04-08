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
  ],
  pancreatic: [
    { name: "Amylase", category: "pancreatic", unit: "U/L", referenceRange: "30-110" },
    { name: "Lipase", category: "pancreatic", unit: "U/L", referenceRange: "0-160" },
  ],
  metabolic: [
    { name: "Glucose (Fasting)", category: "metabolic", unit: "mg/dL", referenceRange: "70-99" },
    { name: "HbA1c", category: "metabolic", unit: "%", referenceRange: "<5.7" },
    { name: "Albumin", category: "metabolic", unit: "g/dL", referenceRange: "3.5-5.0" },
    { name: "Total Protein", category: "metabolic", unit: "g/dL", referenceRange: "6.0-8.3" },
  ],
  microbiology: [
    { name: "Blood Culture", category: "microbiology" },
    { name: "Sputum Culture", category: "microbiology" },
    { name: "Wound Culture", category: "microbiology" },
  ],
  serology: [
    { name: "C-Reactive Protein (CRP)", category: "serology", unit: "mg/L", referenceRange: "<10" },
    { name: "Rheumatoid Factor (RF)", category: "serology", unit: "IU/mL", referenceRange: "<20" },
    { name: "Antinuclear Antibody (ANA)", category: "serology" },
  ],
  cardiology: [
    { name: "Electrocardiogram (ECG)", category: "cardiology" },
    { name: "Echocardiogram", category: "cardiology" },
    { name: "Troponin I", category: "cardiology", unit: "ng/mL", referenceRange: "<0.04" },
  ],
  endocrinology: [
    { name: "TSH", category: "endocrinology", unit: "mIU/L", referenceRange: "0.4-4.0" },
    { name: "Free T4", category: "endocrinology", unit: "ng/dL", referenceRange: "0.8-1.8" },
    { name: "Cortisol", category: "endocrinology", unit: "ug/dL", referenceRange: "5-23" },
  ],
  toxicology: [
    { name: "Urine Drug Screen", category: "toxicology" },
    { name: "Blood Alcohol Level", category: "toxicology", unit: "mg/dL", referenceRange: "0" },
  ],
  "tumor-markers": [
    { name: "PSA (Prostate Specific Antigen)", category: "tumor-markers", unit: "ng/mL", referenceRange: "<4.0" },
    { name: "CA-125", category: "tumor-markers", unit: "U/mL", referenceRange: "<35" },
    { name: "CEA", category: "tumor-markers", unit: "ng/mL", referenceRange: "<3.0" },
  ],
  "special-chemistry": [
    { name: "Vitamin B12", category: "special-chemistry", unit: "pg/mL", referenceRange: "200-900" },
    { name: "Folate", category: "special-chemistry", unit: "ng/mL", referenceRange: ">3" },
    { name: "Iron", category: "special-chemistry", unit: "mcg/dL", referenceRange: "60-170" },
  ],
  "stool-analysis": [
    { name: "Stool O&P", category: "stool-analysis" },
    { name: "Fecal Occult Blood", category: "stool-analysis" },
  ],
  "body-fluids": [
    { name: "CSF Analysis", category: "body-fluids" },
    { name: "Synovial Fluid Analysis", category: "body-fluids" },
  ],
  molecular: [
    { name: "COVID-19 PCR", category: "molecular" },
    { name: "Genetic Screening", category: "molecular" },
  ]
};

export const ALL_TESTS = Object.values(LAB_REFERENCE_DATA).flat();
