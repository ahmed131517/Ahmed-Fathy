export interface LabTest {
  name: string;
  category: string;
  unit?: string;
  referenceRange?: string;
  components?: { name: string; unit?: string; referenceRange?: string }[];
}

export const LAB_REFERENCE_DATA: Record<string, LabTest[]> = {
  hematology: [
    { 
      name: "CBC with Differential", 
      category: "hematology",
      components: [
        { name: "Hemoglobin (Hb)", unit: "g/dL", referenceRange: "13.5-17.5" },
        { name: "Hematocrit (Hct)", unit: "%", referenceRange: "41-50" },
        { name: "RBC Count", unit: "10^6/uL", referenceRange: "4.5-5.9" },
        { name: "WBC Count", unit: "10^3/uL", referenceRange: "4.5-11.0" },
        { name: "Platelet Count", unit: "10^3/uL", referenceRange: "150-450" },
        { name: "MCV", unit: "fL", referenceRange: "80-100" },
        { name: "MCH", unit: "pg", referenceRange: "27-33" },
        { name: "MCHC", unit: "g/dL", referenceRange: "32-36" },
        { name: "RDW", unit: "%", referenceRange: "11-15" },
        { name: "Neutrophils (%)", unit: "%", referenceRange: "40-75" },
        { name: "Lymphocytes (%)", unit: "%", referenceRange: "20-45" },
        { name: "Monocytes (%)", unit: "%", referenceRange: "2-10" },
        { name: "Eosinophils (%)", unit: "%", referenceRange: "1-6" },
        { name: "Basophils (%)", unit: "%", referenceRange: "0-1" },
      ]
    },
    { 
      name: "Complete Blood Count (CBC)", 
      category: "hematology",
      components: [
        { name: "Hemoglobin (Hb)", unit: "g/dL", referenceRange: "13.5-17.5" },
        { name: "Hematocrit (Hct)", unit: "%", referenceRange: "41-50" },
        { name: "RBC Count", unit: "10^6/uL", referenceRange: "4.5-5.9" },
        { name: "WBC Count", unit: "10^3/uL", referenceRange: "4.5-11.0" },
        { name: "Platelet Count", unit: "10^3/uL", referenceRange: "150-450" },
        { name: "MCV", unit: "fL", referenceRange: "80-100" },
        { name: "MCH", unit: "pg", referenceRange: "27-33" },
        { name: "MCHC", unit: "g/dL", referenceRange: "32-36" },
        { name: "RDW", unit: "%", referenceRange: "11-15" },
      ]
    },
    { name: "Hemoglobin (Hb)", category: "hematology", unit: "g/dL", referenceRange: "13.5-17.5" },
    { name: "Hematocrit (Hct)", category: "hematology", unit: "%", referenceRange: "41-50" },
    { name: "RBC Count", category: "hematology", unit: "10^6/uL", referenceRange: "4.5-5.9" },
    { name: "WBC Count", category: "hematology", unit: "10^3/uL", referenceRange: "4.5-11.0" },
    { name: "Platelet Count", category: "hematology", unit: "10^3/uL", referenceRange: "150-450" },
    { name: "MCV", category: "hematology", unit: "fL", referenceRange: "80-100" },
    { name: "MCH", category: "hematology", unit: "pg", referenceRange: "27-33" },
    { name: "MCHC", category: "hematology", unit: "g/dL", referenceRange: "32-36" },
    { name: "RDW", category: "hematology", unit: "%", referenceRange: "11-15" },
    { 
      name: "Differential Count", 
      category: "hematology",
      components: [
        { name: "Neutrophils (%)", unit: "%", referenceRange: "40-75" },
        { name: "Lymphocytes (%)", unit: "%", referenceRange: "20-45" },
        { name: "Monocytes (%)", unit: "%", referenceRange: "2-10" },
        { name: "Eosinophils (%)", unit: "%", referenceRange: "1-6" },
        { name: "Basophils (%)", unit: "%", referenceRange: "0-1" },
      ]
    },
    { 
      name: "RBC Indices", 
      category: "hematology",
      components: [
        { name: "MCV", unit: "fL", referenceRange: "80-100" },
        { name: "MCH", unit: "pg", referenceRange: "27-33" },
        { name: "MCHC", unit: "g/dL", referenceRange: "32-36" },
        { name: "RDW", unit: "%", referenceRange: "11-15" },
      ]
    },
    { name: "Reticulocyte Count", category: "hematology", unit: "%", referenceRange: "0.5-1.5" },
    { name: "Peripheral Blood Smear", category: "hematology" },
    { name: "Erythrocyte Sedimentation Rate (ESR)", category: "hematology", unit: "mm/hr", referenceRange: "0-20" },
    {
      name: "Coagulation Profile (Extended)",
      category: "hematology",
      components: [
        { name: "Prothrombin Time (PT)", unit: "sec", referenceRange: "11-13.5" },
        { name: "INR", referenceRange: "0.8-1.1" },
        { name: "aPTT", unit: "sec", referenceRange: "25-35" },
        { name: "Thrombin Time (TT)", unit: "sec", referenceRange: "14-19" },
        { name: "Fibrinogen", unit: "mg/dL", referenceRange: "200-400" },
      ]
    },
    { name: "Prothrombin Time (PT)", category: "hematology", unit: "sec", referenceRange: "11-13.5" },
    { name: "INR", category: "hematology", unit: "", referenceRange: "0.8-1.1" },
    { name: "aPTT", category: "hematology", unit: "sec", referenceRange: "25-35" },
    { name: "Thrombin Time (TT)", category: "hematology", unit: "sec", referenceRange: "14-19" },
    { name: "D-dimer", category: "hematology", unit: "ng/mL", referenceRange: "<500" },
    { name: "Fibrinogen", category: "hematology", unit: "mg/dL", referenceRange: "200-400" },
    { name: "Anti-Xa Level", category: "hematology", unit: "IU/mL", referenceRange: "0.1-1.0" },
    { name: "Factor Assays (VII, VIII, IX, X)", category: "hematology" },
    { name: "Von Willebrand Factor (vWF) Ag", category: "hematology", unit: "%", referenceRange: "50-150" },
    { name: "LDH", category: "hematology", unit: "U/L", referenceRange: "140-280" },
    { name: "Haptoglobin", category: "hematology", unit: "mg/dL", referenceRange: "30-200" },
    { name: "Indirect Bilirubin", category: "hematology", unit: "mg/dL", referenceRange: "0.1-0.8" },
    { name: "Direct Coombs Test (DAT)", category: "hematology" },
    { name: "Hemoglobin Electrophoresis", category: "hematology" },
    { name: "G6PD Assay", category: "hematology", unit: "U/g Hb", referenceRange: "7.0-10.0" },
    { name: "Osmotic Fragility Test", category: "hematology" },
    { name: "Bone Marrow Aspiration & Biopsy", category: "hematology" },
    { name: "Flow Cytometry", category: "hematology" },
  ],
  renal: [
    { name: "Serum Creatinine", category: "renal", unit: "mg/dL", referenceRange: "0.7-1.3" },
    { name: "Serum Urea", category: "renal", unit: "mg/dL", referenceRange: "15-45" },
    { name: "Blood Urea Nitrogen (BUN)", category: "renal", unit: "mg/dL", referenceRange: "7-20" },
    { name: "eGFR", category: "renal", unit: "mL/min/1.73m2", referenceRange: ">60" },
    { name: "Creatinine Clearance", category: "renal", unit: "mL/min", referenceRange: "90-139" },
    { name: "Uric Acid", category: "renal", unit: "mg/dL", referenceRange: "3.4-7.0" },
    { name: "Urine Sodium", category: "renal", unit: "mEq/L", referenceRange: "40-220" },
    { name: "Fractional Excretion of Sodium (FENa)", category: "renal", unit: "%", referenceRange: "1-2" },
    { name: "Urine Osmolality", category: "renal", unit: "mOsm/kg", referenceRange: "50-1200" },
    { name: "Microalbuminuria", category: "renal", unit: "mg/24h", referenceRange: "<30" },
    { name: "24-hour Urine Protein", category: "renal", unit: "mg/24h", referenceRange: "<150" },
    { name: "Urine Protein/Creatinine Ratio (UPCR)", category: "renal", unit: "mg/g", referenceRange: "<150" },
    { name: "Urine Albumin/Creatinine Ratio (UACR)", category: "renal", unit: "mg/g", referenceRange: "<30" },
  ],
  hepatic: [
    {
      name: "Liver Function Tests (LFTs)",
      category: "hepatic",
      components: [
        { name: "ALT (SGPT)", unit: "U/L", referenceRange: "7-55" },
        { name: "AST (SGOT)", unit: "U/L", referenceRange: "8-48" },
        { name: "ALP", unit: "U/L", referenceRange: "40-129" },
        { name: "GGT", unit: "U/L", referenceRange: "9-48" },
        { name: "Total Bilirubin", unit: "mg/dL", referenceRange: "0.1-1.2" },
        { name: "Direct Bilirubin", unit: "mg/dL", referenceRange: "0-0.3" },
        { name: "Albumin", unit: "g/dL", referenceRange: "3.5-5.0" },
        { name: "Total Protein", unit: "g/dL", referenceRange: "6.0-8.3" },
      ]
    },
    { name: "ALT (SGPT)", category: "hepatic", unit: "U/L", referenceRange: "7-55" },
    { name: "AST (SGOT)", category: "hepatic", unit: "U/L", referenceRange: "8-48" },
    { name: "Alkaline Phosphatase (ALP)", category: "hepatic", unit: "U/L", referenceRange: "40-129" },
    { name: "GGT", category: "hepatic", unit: "U/L", referenceRange: "9-48" },
    { name: "Total Bilirubin", category: "hepatic", unit: "mg/dL", referenceRange: "0.1-1.2" },
    { name: "Direct Bilirubin", category: "hepatic", unit: "mg/dL", referenceRange: "0-0.3" },
    { name: "Albumin", category: "hepatic", unit: "g/dL", referenceRange: "3.5-5.0" },
    { name: "Total Protein", category: "hepatic", unit: "g/dL", referenceRange: "6.0-8.3" },
    { name: "Prothrombin Time (PT)", category: "hepatic", unit: "sec", referenceRange: "11-13.5" },
    { name: "INR", category: "hepatic", referenceRange: "0.8-1.1" },
    { name: "Ammonia", category: "hepatic", unit: "μmol/L", referenceRange: "15-45" },
    { name: "LDH", category: "hepatic", unit: "U/L", referenceRange: "140-280" },
    { name: "5' Nucleotidase", category: "hepatic", unit: "U/L", referenceRange: "2-17" },
  ],
  lipids: [
    { 
      name: "Lipid Profile (Comprehensive)", 
      category: "lipids",
      components: [
        { name: "Total Cholesterol", unit: "mg/dL", referenceRange: "<200" },
        { name: "LDL Cholesterol", unit: "mg/dL", referenceRange: "<100" },
        { name: "HDL Cholesterol", unit: "mg/dL", referenceRange: ">40" },
        { name: "Triglycerides", unit: "mg/dL", referenceRange: "<150" },
        { name: "VLDL", unit: "mg/dL", referenceRange: "2-30" },
      ]
    },
    { name: "Total Cholesterol", category: "lipids", unit: "mg/dL", referenceRange: "<200" },
    { name: "LDL Cholesterol", category: "lipids", unit: "mg/dL", referenceRange: "<100" },
    { name: "HDL Cholesterol", category: "lipids", unit: "mg/dL", referenceRange: ">40" },
    { name: "Triglycerides", category: "lipids", unit: "mg/dL", referenceRange: "<150" },
    { name: "VLDL", category: "lipids", unit: "mg/dL", referenceRange: "2-30" },
    { name: "Apolipoprotein A1", category: "lipids", unit: "mg/dL", referenceRange: "110-205" },
    { name: "Apolipoprotein B", category: "lipids", unit: "mg/dL", referenceRange: "55-130" },
    { name: "Lipoprotein(a)", category: "lipids", unit: "mg/dL", referenceRange: "<30" },
  ],
  electrolytes: [
    {
      name: "Electrolytes Panel",
      category: "electrolytes",
      components: [
        { name: "Sodium (Na⁺)", unit: "mEq/L", referenceRange: "135-145" },
        { name: "Potassium (K⁺)", unit: "mEq/L", referenceRange: "3.6-5.2" },
        { name: "Chloride (Cl⁻)", unit: "mEq/L", referenceRange: "96-106" },
        { name: "Bicarbonate (HCO₃⁻)", unit: "mEq/L", referenceRange: "22-29" },
      ]
    },
    { name: "Sodium (Na⁺)", category: "electrolytes", unit: "mEq/L", referenceRange: "135-145" },
    { name: "Potassium (K⁺)", category: "electrolytes", unit: "mEq/L", referenceRange: "3.6-5.2" },
    { name: "Chloride (Cl⁻)", category: "electrolytes", unit: "mEq/L", referenceRange: "96-106" },
    { name: "Bicarbonate (HCO₃⁻)", category: "electrolytes", unit: "mEq/L", referenceRange: "22-29" },
    { name: "Calcium (Total)", category: "electrolytes", unit: "mg/dL", referenceRange: "8.5-10.2" },
    { name: "Ionized Calcium", category: "electrolytes", unit: "mmol/L", referenceRange: "1.12-1.32" },
    { name: "Magnesium", category: "electrolytes", unit: "mg/dL", referenceRange: "1.7-2.2" },
    { name: "Phosphate", category: "electrolytes", unit: "mg/dL", referenceRange: "2.5-4.5" },
    { name: "Anion Gap", category: "electrolytes", unit: "mEq/L", referenceRange: "8-16" },
    { name: "Serum Osmolality", category: "electrolytes", unit: "mOsm/kg", referenceRange: "275-295" },
    {
      name: "Acid-Base Analysis (ABG)",
      category: "electrolytes",
      components: [
        { name: "pH", referenceRange: "7.35-7.45" },
        { name: "pCO2", unit: "mmHg", referenceRange: "35-45" },
        { name: "pO2", unit: "mmHg", referenceRange: "75-100" },
        { name: "HCO3", unit: "mEq/L", referenceRange: "22-26" },
        { name: "Base Excess", unit: "mEq/L", referenceRange: "-2 to +2" },
        { name: "O2 Saturation", unit: "%", referenceRange: "94-100" },
      ]
    },
  ],
  pancreatic: [
    { name: "Fasting Blood Glucose (FBG)", category: "pancreatic", unit: "mg/dL", referenceRange: "70-99" },
    { name: "Random Blood Glucose (RBG)", category: "pancreatic", unit: "mg/dL", referenceRange: "70-140" },
    { name: "HbA1c", category: "pancreatic", unit: "%", referenceRange: "<5.7" },
    {
      name: "Oral Glucose Tolerance Test (OGTT)",
      category: "pancreatic",
      components: [
        { name: "OGTT - 0 hour (Fasting)", unit: "mg/dL", referenceRange: "70-95" },
        { name: "OGTT - 1 hour", unit: "mg/dL", referenceRange: "<180" },
        { name: "OGTT - 2 hour", unit: "mg/dL", referenceRange: "<140" },
      ]
    },
    { name: "Serum Amylase", category: "pancreatic", unit: "U/L", referenceRange: "30-110" },
    { name: "Serum Lipase", category: "pancreatic", unit: "U/L", referenceRange: "0-160" },
    { name: "Insulin", category: "pancreatic", unit: "uIU/mL", referenceRange: "2.6-24.9" },
    { name: "C-peptide", category: "pancreatic", unit: "ng/mL", referenceRange: "1.1-4.4" },
  ],
  metabolic: [
    {
      name: "Basic Metabolic Panel (BMP)",
      category: "metabolic",
      components: [
        { name: "Glucose", unit: "mg/dL", referenceRange: "70-99" },
        { name: "Calcium", unit: "mg/dL", referenceRange: "8.5-10.2" },
        { name: "Sodium", unit: "mEq/L", referenceRange: "135-145" },
        { name: "Potassium", unit: "mEq/L", referenceRange: "3.6-5.2" },
        { name: "Chloride", unit: "mEq/L", referenceRange: "96-106" },
        { name: "Bicarbonate", unit: "mEq/L", referenceRange: "22-29" },
        { name: "BUN", unit: "mg/dL", referenceRange: "7-20" },
        { name: "Creatinine", unit: "mg/dL", referenceRange: "0.7-1.3" },
      ]
    },
    {
      name: "Comprehensive Metabolic Panel (CMP)",
      category: "metabolic",
      components: [
        { name: "Glucose", unit: "mg/dL", referenceRange: "70-99" },
        { name: "Calcium", unit: "mg/dL", referenceRange: "8.5-10.2" },
        { name: "Albumin", unit: "g/dL", referenceRange: "3.5-5.0" },
        { name: "Total Protein", unit: "g/dL", referenceRange: "6.0-8.3" },
        { name: "Sodium", unit: "mEq/L", referenceRange: "135-145" },
        { name: "Potassium", unit: "mEq/L", referenceRange: "3.6-5.2" },
        { name: "Chloride", unit: "mEq/L", referenceRange: "96-106" },
        { name: "Bicarbonate", unit: "mEq/L", referenceRange: "22-29" },
        { name: "BUN", unit: "mg/dL", referenceRange: "7-20" },
        { name: "Creatinine", unit: "mg/dL", referenceRange: "0.7-1.3" },
        { name: "ALP", unit: "U/L", referenceRange: "40-129" },
        { name: "ALT", unit: "U/L", referenceRange: "7-55" },
        { name: "AST", unit: "U/L", referenceRange: "8-48" },
        { name: "Bilirubin", unit: "mg/dL", referenceRange: "0.1-1.2" },
      ]
    },
    { name: "Serum Proteins", category: "metabolic", unit: "g/dL", referenceRange: "6.0-8.3" },
    { name: "Albumin/Globulin ratio", category: "metabolic", unit: "", referenceRange: "1.1-2.5" },
    { name: "Lactate", category: "metabolic", unit: "mmol/L", referenceRange: "0.5-2.2" },
    { name: "Pyruvate", category: "metabolic", unit: "mg/dL", referenceRange: "0.3-0.9" },
    { name: "Serum Osmolality", category: "metabolic", unit: "mOsm/kg", referenceRange: "275-295" },
    { 
      name: "Iron Studies", 
      category: "metabolic", 
      components: [
        { name: "Serum Iron", unit: "mcg/dL", referenceRange: "60-170" },
        { name: "Ferritin", unit: "ng/mL", referenceRange: "10-300" },
        { name: "TIBC", unit: "mcg/dL", referenceRange: "240-450" },
        { name: "Transferrin Saturation", unit: "%", referenceRange: "20-50" },
      ]
    },
    { name: "Serum Iron", category: "metabolic", unit: "mcg/dL", referenceRange: "60-170" },
    { name: "Ferritin", category: "metabolic", unit: "ng/mL", referenceRange: "10-300" },
    { name: "TIBC", category: "metabolic", unit: "mcg/dL", referenceRange: "240-450" },
    { name: "Transferrin Saturation", category: "metabolic", unit: "%", referenceRange: "20-50" },
    { name: "Iron Studies (Iron, Ferritin, TIBC)", category: "metabolic" },
  ],
  microbiology: [
    { name: "Blood Culture", category: "microbiology" },
    { name: "Urine Culture", category: "microbiology" },
    { name: "Sputum Culture", category: "microbiology" },
    { name: "Stool Culture", category: "microbiology" },
    { name: "CSF Culture", category: "microbiology" },
    { name: "Gram Stain", category: "microbiology" },
    { name: "Ziehl-Neelsen (AFB Stain)", category: "microbiology" },
    { name: "Fungal Stains (KOH/Calcofluor)", category: "microbiology" },
    { name: "PCR Pathogen Detection", category: "microbiology" },
    { name: "Viral Load Testing", category: "microbiology" },
    { name: "Antimicrobial Susceptibility (AST)", category: "microbiology" },
  ],
  serology: [
    { name: "C-Reactive Protein (CRP)", category: "serology", unit: "mg/L", referenceRange: "<10" },
    { name: "Erythrocyte Sedimentation Rate (ESR)", category: "serology", unit: "mm/hr", referenceRange: "0-20" },
    { name: "Procalcitonin", category: "serology", unit: "ng/mL", referenceRange: "<0.10" },
    { name: "Rheumatoid Factor (RF)", category: "serology", unit: "IU/mL", referenceRange: "<20" },
    { name: "Antinuclear Antibody (ANA)", category: "serology" },
    { name: "Anti-dsDNA", category: "serology" },
    { name: "Anti-CCP", category: "serology", unit: "U/mL", referenceRange: "<20" },
    { name: "ANCA (p-ANCA, c-ANCA)", category: "serology" },
    { 
      name: "ENA Panel", 
      category: "serology",
      components: [
        { name: "Anti-SSA (Ro)" },
        { name: "Anti-SSB (La)" },
        { name: "Anti-Sm" },
        { name: "Anti-RNP" },
        { name: "Anti-Scl-70" },
        { name: "Anti-Jo-1" },
      ]
    },
    {
      name: "Immunoglobulins Profile",
      category: "serology",
      components: [
        { name: "IgG", unit: "mg/dL", referenceRange: "700-1600" },
        { name: "IgA", unit: "mg/dL", referenceRange: "70-400" },
        { name: "IgM", unit: "mg/dL", referenceRange: "40-230" },
        { name: "IgE", unit: "IU/mL", referenceRange: "<100" },
      ]
    },
    { name: "IgG", category: "serology", unit: "mg/dL", referenceRange: "700-1600" },
    { name: "IgA", category: "serology", unit: "mg/dL", referenceRange: "70-400" },
    { name: "IgM", category: "serology", unit: "mg/dL", referenceRange: "40-230" },
    { name: "IgE", category: "serology", unit: "IU/mL", referenceRange: "<100" },
    {
      name: "Complement (C3, C4)",
      category: "serology",
      components: [
        { name: "C3", unit: "mg/dL", referenceRange: "80-160" },
        { name: "C4", unit: "mg/dL", referenceRange: "15-45" },
      ]
    },
    { name: "C3", category: "serology", unit: "mg/dL", referenceRange: "80-160" },
    { name: "C4", category: "serology", unit: "mg/dL", referenceRange: "15-45" },
  ],
  urine: [
    { 
      name: "Urinalysis (Routine)", 
      category: "urine",
      components: [
        { name: "Specific Gravity", referenceRange: "1.005-1.030" },
        { name: "pH", referenceRange: "4.6-8.0" },
        { name: "Protein", referenceRange: "Negative" },
        { name: "Glucose", referenceRange: "Negative" },
        { name: "Ketones", referenceRange: "Negative" },
        { name: "Bilirubin", referenceRange: "Negative" },
        { name: "Blood", referenceRange: "Negative" },
        { name: "Nitrite", referenceRange: "Negative" },
        { name: "Leukocyte Esterase", referenceRange: "Negative" },
      ]
    },
    { name: "Urine Routine (Dipstick)", category: "urine" },
    { name: "Urine Microscopy (RBCs, WBCs, casts, crystals)", category: "urine" },
    { name: "Urine Culture", category: "urine" },
    { name: "Microalbuminuria", category: "urine", unit: "mg/24h", referenceRange: "<30" },
    { name: "Bence Jones Protein", category: "urine", referenceRange: "Negative" },
    { name: "Urine Protein/Creatinine Ratio", category: "urine" },
    { name: "24-hour Urine Protein", category: "urine" },
  ],
  imaging: [
    { name: "X-ray", category: "imaging" },
    { name: "Ultrasound (US)", category: "imaging" },
    { name: "CT Scan", category: "imaging" },
    { name: "MRI", category: "imaging" },
    { name: "PET Scan", category: "imaging" },
    { name: "Fluoroscopy", category: "imaging" },
    { name: "Interventional Radiology", category: "imaging" },
    { name: "Doppler Studies", category: "imaging" },
  ],
  cardiology: [
    {
      name: "Cardiac Markers",
      category: "cardiology",
      components: [
        { name: "Troponin I", unit: "ng/mL", referenceRange: "<0.04" },
        { name: "CK-MB", unit: "ng/mL", referenceRange: "<5.0" },
        { name: "BNP", unit: "pg/mL", referenceRange: "<100" },
      ]
    },
    { name: "Troponin I", category: "cardiology", unit: "ng/mL", referenceRange: "<0.04" },
    { name: "Troponin T", category: "cardiology", unit: "ng/mL", referenceRange: "<0.01" },
    { name: "CK-MB", category: "cardiology", unit: "ng/mL", referenceRange: "<5.0" },
    { name: "BNP", category: "cardiology", unit: "pg/mL", referenceRange: "<100" },
    { name: "NT-proBNP", category: "cardiology", unit: "pg/mL", referenceRange: "<125" },
    { name: "Myoglobin", category: "cardiology", unit: "ng/mL", referenceRange: "<85" },
    { name: "Electrocardiogram (ECG)", category: "cardiology" },
    { name: "Echocardiography", category: "cardiology" },
    { name: "Stress Test", category: "cardiology" },
    { name: "Holter Monitoring", category: "cardiology" },
  ],
  endocrinology: [
    {
      name: "Thyroid Profile (Full)",
      category: "endocrinology",
      components: [
        { name: "TSH", unit: "mIU/L", referenceRange: "0.4-4.0" },
        { name: "Free T3", unit: "pg/mL", referenceRange: "2.3-4.2" },
        { name: "Free T4", unit: "ng/dL", referenceRange: "0.8-1.8" },
      ]
    },
    { name: "TSH", category: "endocrinology", unit: "mIU/L", referenceRange: "0.4-4.0" },
    { name: "Free T3", category: "endocrinology", unit: "pg/mL", referenceRange: "2.3-4.2" },
    { name: "Free T4", category: "endocrinology", unit: "ng/dL", referenceRange: "0.8-1.8" },
    { name: "Anti-TPO Antibodies", category: "endocrinology", unit: "IU/mL", referenceRange: "<34" },
    { name: "Anti-Thyroglobulin Antibodies", category: "endocrinology", unit: "IU/mL", referenceRange: "<115" },
    { name: "Cortisol (Am/Pm)", category: "endocrinology", unit: "ug/dL", referenceRange: "5-23" },
    { name: "ACTH", category: "endocrinology", unit: "pg/mL", referenceRange: "10-60" },
    { name: "Dexamethasone Suppression Test", category: "endocrinology" },
    { name: "Insulin", category: "endocrinology", unit: "uIU/mL", referenceRange: "2.6-24.9" },
    { name: "C-peptide", category: "endocrinology", unit: "ng/mL", referenceRange: "1.1-4.4" },
    { name: "Prolactin", category: "endocrinology", unit: "ng/mL", referenceRange: "4-23" },
    { name: "FSH", category: "endocrinology", unit: "mIU/mL", referenceRange: "1.5-12.4" },
    { name: "LH", category: "endocrinology", unit: "mIU/mL", referenceRange: "1.7-8.6" },
    { name: "Testosterone", category: "endocrinology", unit: "ng/dL", referenceRange: "240-950" },
    { name: "Estrogen", category: "endocrinology" },
    { name: "PTH", category: "endocrinology", unit: "pg/mL", referenceRange: "10-65" },
    { name: "Vitamin D", category: "endocrinology", unit: "ng/mL", referenceRange: "30-100" },
    { name: "Growth Hormone (GH)", category: "endocrinology", unit: "ng/mL", referenceRange: "<5" },
    { name: "IGF-1", category: "endocrinology", unit: "ng/mL", referenceRange: "115-300" },
  ],
  toxicology: [
    { name: "Lithium Level", category: "toxicology", unit: "mEq/L", referenceRange: "0.6-1.2" },
    { name: "Digoxin Level", category: "toxicology", unit: "ng/mL", referenceRange: "0.8-2.0" },
    { name: "Phenytoin Level", category: "toxicology", unit: "ug/mL", referenceRange: "10-20" },
    { name: "Toxicology Screen (Urine)", category: "toxicology" },
    { name: "Toxicology Screen (Serum)", category: "toxicology" },
    { name: "Heavy Metals (Lead, Mercury, Arsenic)", category: "toxicology" },
    { name: "Alcohol Level", category: "toxicology", unit: "mg/dL", referenceRange: "0" },
  ],
  "tumor-markers": [
    { name: "AFP", category: "tumor-markers", unit: "ng/mL", referenceRange: "<10" },
    { name: "CEA", category: "tumor-markers", unit: "ng/mL", referenceRange: "<3.0" },
    { name: "CA-125", category: "tumor-markers", unit: "U/mL", referenceRange: "<35" },
    { name: "CA 19-9", category: "tumor-markers", unit: "U/mL", referenceRange: "<37" },
    { name: "PSA", category: "tumor-markers", unit: "ng/mL", referenceRange: "<4.0" },
    { name: "β-hCG", category: "tumor-markers" },
    { name: "CA 15-3", category: "tumor-markers", unit: "U/mL", referenceRange: "<30" },
    { name: "Calcitonin", category: "tumor-markers", unit: "pg/mL", referenceRange: "<8.4" },
    { name: "NSE", category: "tumor-markers", unit: "ng/mL", referenceRange: "<16.3" },
  ],
  "special-chemistry": [
    { name: "Homocysteine", category: "special-chemistry", unit: "umol/L", referenceRange: "<15" },
    { name: "Ceruloplasmin", category: "special-chemistry", unit: "mg/dL", referenceRange: "20-60" },
    { name: "Alpha-1 Antitrypsin", category: "special-chemistry", unit: "mg/dL", referenceRange: "90-200" },
    { name: "Enzyme Assays", category: "special-chemistry" },
    { name: "Trace Elements (Zinc, Copper, Selenium)", category: "special-chemistry" },
  ],
  "stool-analysis": [
    { name: "Stool Routine", category: "stool-analysis" },
    { name: "Occult Blood", category: "stool-analysis" },
    { name: "Ova & Parasites", category: "stool-analysis" },
    { name: "Stool Culture", category: "stool-analysis" },
    { name: "Fecal Calprotectin", category: "stool-analysis", unit: "ug/g", referenceRange: "<50" },
    { name: "Fecal Fat Test", category: "stool-analysis" },
  ],
  "body-fluids": [
    {
      name: "CSF Analysis",
      category: "body-fluids",
      components: [
        { name: "CSF Appearance" },
        { name: "CSF Pressure", unit: "mm H2O", referenceRange: "90-180" },
        { name: "CSF WBC Count", unit: "/uL", referenceRange: "0-5" },
        { name: "CSF Glucose", unit: "mg/dL", referenceRange: "40-70" },
        { name: "CSF Protein", unit: "mg/dL", referenceRange: "15-45" },
      ]
    },
    { name: "CSF analysis (protein, glucose, cells)", category: "body-fluids" },
    { name: "Pleural Fluid Analysis", category: "body-fluids" },
    { name: "Ascitic Fluid Analysis", category: "body-fluids" },
    { name: "Synovial Fluid Analysis", category: "body-fluids" },
    { name: "Pericardial Fluid Analysis", category: "body-fluids" },
  ],
  molecular: [
    { name: "PCR (Viral/Bacterial)", category: "molecular" },
    { name: "Gene Mutation Panels", category: "molecular" },
    { name: "Karyotyping", category: "molecular" },
    { name: "FISH", category: "molecular" },
    { name: "NGS (Next Generation Sequencing)", category: "molecular" },
  ]
};

export const ALL_TESTS = Object.values(LAB_REFERENCE_DATA).flat();

export interface LabTemplate {
  name: string;
  description: string;
  tests: string[]; // Names of tests to include
}

export const LAB_TEMPLATES: LabTemplate[] = [
  {
    name: "Top 20 Tests",
    description: "Most common hospital tests: CBC, LFTs, Renal, Glucose, HbA1c, CRP, Troponin, D-dimer, Coagulation, and Electrolytes.",
    tests: [
      "Complete Blood Count (CBC)",
      "ALT (SGPT)",
      "AST (SGOT)",
      "Total Bilirubin",
      "Direct Bilirubin",
      "Serum Creatinine",
      "Albumin",
      "Blood Urea Nitrogen (BUN)",
      "Fasting Blood Glucose (FBG)",
      "HbA1c",
      "C-Reactive Protein (CRP)",
      "Troponin I",
      "D-dimer",
      "Prothrombin Time (PT)",
      "INR",
      "aPTT",
      "Sodium (Na⁺)",
      "Potassium (K⁺)",
      "Chloride (Cl⁻)",
      "Bicarbonate (HCO₃⁻)",
      "Calcium (Total)",
      "Magnesium",
      "Phosphate",
      "Acid-Base Analysis (ABG)"
    ]
  },
  {
    name: "Daily Routine",
    description: "Standard daily monitoring: CBC, Creatinine, Urea, CRP, PT/INR, aPTT, Na, K, Ca, and ABG.",
    tests: [
      "Complete Blood Count (CBC)",
      "Serum Creatinine",
      "Serum Urea",
      "C-Reactive Protein (CRP)",
      "Prothrombin Time (PT)",
      "INR",
      "aPTT",
      "Sodium (Na⁺)",
      "Potassium (K⁺)",
      "Calcium (Total)",
      "Acid-Base Analysis (ABG)"
    ]
  }
];
