import { ClinicalMedication } from '../types/medication';

export const ANTIBIOTICS_DATABASE: ClinicalMedication[] = [
  {
    id: 'amoxicillin',
    generic_name: 'Amoxicillin',
    brand_names: ['Amoxil', 'Hiconcil', 'Moxen', 'E-Mox', 'Julphamox', 'Amoxipen'],
    ATC_code: 'J01CA04',
    RxNorm: '723',
    SNOMED: '372687004',
    DrugBank_ID: 'DB01060',
    Drug_Class: 'Penicillin Antibiotic',
    Subclass: 'Aminopenicillin',
    FDA_Approval: true,
    Egypt_Approval: true,
    Controlled_Drug: false,
    OTC: false,
    Prescription: true,

    Pregnancy: {
      trimester1: 'Compatible / Low Risk',
      trimester2: 'Compatible / Low Risk',
      trimester3: 'Compatible / Low Risk',
      recommendation: 'First-line antibiotic in pregnancy',
      riskLevel: 'Low',
      category: 'Category B'
    },
    Lactation: {
      milkTransfer: 'Excreted in small amounts in human milk',
      infantRisk: 'Low',
      alternativeDrug: 'Ampicillin',
      advice: 'Compatible with breastfeeding. Monitor infant for mild diarrhea or rash.'
    },

    Black_Box_Warning: 'None',
    Storage: 'Store dry powder below 25°C. Reconstituted suspension stable for 14 days under refrigeration (2°C - 8°C).',
    Manufacturer: 'GlaxoSmithKline / EIPICO / Sedico / Julphar',
    Price: 45,
    Availability: 'In Stock',

    disease_dosing: [
      {
        indication: 'Community-Acquired Pneumonia (CAP)',
        icd10: 'J18.9',
        dose: '1000 mg (1 g) PO',
        frequency: 'TID (every 8 hours)',
        duration: '5 - 7 days',
        guideline: 'IDSA / ATS 2024 Guidelines',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Acute Otitis Media (AOM)',
        icd10: 'H66.9',
        dose: '80-90 mg/kg/day PO divided BID',
        frequency: 'BID (every 12 hours)',
        duration: '10 days (5-7 days if ≥6 yrs)',
        guideline: 'AAP Pediatric Otitis Media Guidelines',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Acute Bacterial Sinusitis',
        icd10: 'J01.9',
        dose: '875 mg PO',
        frequency: 'BID',
        duration: '5 - 7 days',
        guideline: 'IDSA Rhinosinusitis Guidelines',
        evidenceLevel: 'B-II'
      },
      {
        indication: 'Helicobacter pylori Eradication',
        icd10: 'B96.81',
        dose: '1000 mg PO',
        frequency: 'BID',
        duration: '14 days',
        guideline: 'ACG Clinical Guideline H. pylori',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Dental Infection / Abscess',
        icd10: 'K04.7',
        dose: '500 mg PO',
        frequency: 'TID',
        duration: '5 days',
        guideline: 'ADA Antibiotic Stewardship Guidelines',
        evidenceLevel: 'B-I'
      },
      {
        indication: 'Infective Endocarditis Prophylaxis',
        icd10: 'Z29.2',
        dose: '2000 mg (2 g) PO single dose',
        frequency: 'Once 30-60 min before procedure',
        duration: 'Single dose',
        guideline: 'AHA Endocarditis Prevention Guidelines',
        evidenceLevel: 'B-II'
      }
    ],

    egyptian_brands: [
      { brand_name: 'E-Mox 500mg', company: 'EIPICO', price_egp: 38.5, availability: 'Available', dosage_forms: ['Capsule', 'Oral Suspension'] },
      { brand_name: 'Amoxil 1g', company: 'GlaxoSmithKline (GSK Egypt)', price_egp: 65.0, availability: 'Shortage', dosage_forms: ['Tablet', 'Syrup'] },
      { brand_name: 'Julphamox 500mg', company: 'Julphar Egypt', price_egp: 32.0, availability: 'Available', dosage_forms: ['Capsule'] },
      { brand_name: 'Hiconcil 250mg/5ml', company: 'Sedico', price_egp: 28.0, availability: 'Available', dosage_forms: ['Oral Suspension'] }
    ],

    monitoring: {
      baseline: ['Renal Function (CrCl/eGFR)', 'Penicillin Allergy History'],
      during: ['Signs of anaphylaxis', 'Bowel movement frequency (C. difficile risk)', 'Renal function if prolonged >14 days'],
      frequency: 'Baseline and weekly if long-term course'
    },

    patient_counseling: {
      missedDose: 'Take as soon as remembered. If close to next dose, skip and resume regular schedule. Never double dose.',
      storage: 'Keep oral suspension refrigerated after mixing. Discard after 14 days.',
      driving: 'No known impairment to driving or operating machinery.',
      alcohol: 'Avoid excessive alcohol consumption to prevent gastric irritation.',
      food: 'Can be taken with or without food. Taking with food reduces stomach upset.',
      warningSymptoms: ['Mild rash', 'Mild diarrhea', 'Nausea'],
      emergencySymptoms: ['Severe breathing difficulty', 'Swelling of face/lips/throat (Anaphylaxis)', 'Watery/bloody diarrhea (C. diff colitis)'],
      pregnancyAdvice: 'Safe for use during pregnancy when prescribed by a physician.'
    },

    renal_adjustment: {
      required: true,
      guidance: 'Adjust dosage in moderate to severe renal impairment (CrCl < 30 mL/min).',
      doseByCrCl: [
        { crclRange: 'CrCl ≥ 30 mL/min', recommendedDose: 'No dose adjustment needed (Standard 500-1000 mg q8h-q12h)' },
        { crclRange: 'CrCl 10–30 mL/min', recommendedDose: '500 mg PO every 12 hours' },
        { crclRange: 'CrCl < 10 mL/min', recommendedDose: '500 mg PO every 24 hours' },
        { crclRange: 'Hemodialysis', recommendedDose: '500 mg PO every 24 hours + additional 500 mg post-dialysis' }
      ]
    },

    hepatic_adjustment: {
      childPughA: 'No dose adjustment required',
      childPughB: 'No dose adjustment required',
      childPughC: 'Use with caution; monitor liver enzymes if prolonged'
    },

    pediatric_min_age: '3 months (Full term neonates dose by weight)',
    max_daily_dose_mg: 4000,
    side_effects: ['Diarrhea', 'Nausea', 'Skin Rash', 'Vomiting', 'Candidiasis / Thrush'],
    contraindications: ['Severe Penicillin or Beta-lactam Hypersensitivity', 'History of Amoxicillin-associated cholestatic jaundice'],
    interactions: [
      { drug: 'Allopurinol', severity: 'Moderate', mechanism: 'Increased incidence of skin rash', management: 'Monitor for skin rash; consider alternative if possible.' },
      { drug: 'Warfarin', severity: 'Moderate', mechanism: 'Altered gut flora reducing Vitamin K synthesis, elevating INR', management: 'Monitor INR closely when starting antibiotic.' },
      { drug: 'Methotrexate', severity: 'Major', mechanism: 'Decreased renal clearance of Methotrexate leading to toxicity', management: 'Avoid combination or monitor Methotrexate serum levels.' }
    ]
  },

  {
    id: 'amoxicillin_clavulanate',
    generic_name: 'Amoxicillin + Clavulanic Acid',
    brand_names: ['Augmentin', 'Hibiotic', 'Curam', 'Megamox', 'Klavox', 'Delmentin'],
    ATC_code: 'J01CR02',
    RxNorm: '1000858',
    SNOMED: '372688009',
    DrugBank_ID: 'DB01060',
    Drug_Class: 'Beta-lactam + Beta-lactamase Inhibitor',
    Subclass: 'Aminopenicillin Combination',
    FDA_Approval: true,
    Egypt_Approval: true,
    Controlled_Drug: false,
    OTC: false,
    Prescription: true,

    Pregnancy: {
      trimester1: 'Category B - Low Risk',
      trimester2: 'Category B - Low Risk',
      trimester3: 'Use with caution near term (PPROM necrotizing enterocolitis risk in neonates)',
      recommendation: 'Safe in early pregnancy; evaluate alternatives in preterm rupture of membranes',
      riskLevel: 'Low',
      category: 'Category B'
    },
    Lactation: {
      milkTransfer: 'Excreted in low concentrations',
      infantRisk: 'Low',
      advice: 'Compatible with breastfeeding. Monitor infant for diarrhea or diaper rash.'
    },

    Black_Box_Warning: 'None',
    Storage: 'Store below 25°C in original moisture-proof foil pack. Suspension refrigerated max 7-10 days.',
    Manufacturer: 'GlaxoSmithKline / Amoun / EIPICO / Novartis',
    Price: 110,
    Availability: 'In Stock',

    disease_dosing: [
      {
        indication: 'Acute Bacterial Rhinosinusitis (High-Risk/Resistant)',
        icd10: 'J01.9',
        dose: '2000 mg (2 g) PO',
        frequency: 'BID (every 12 hours)',
        duration: '7 - 10 days',
        guideline: 'IDSA Sinusitis Guidelines 2024',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Human or Animal Bite Wounds',
        icd10: 'T14.1',
        dose: '875/125 mg PO',
        frequency: 'BID',
        duration: '7 - 10 days',
        guideline: 'IDSA Skin & Soft Tissue Infection Guidelines',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Complicated UTI / Pyelonephritis (Outpatient Step-down)',
        icd10: 'N12',
        dose: '875/125 mg PO',
        frequency: 'BID',
        duration: '10 - 14 days',
        guideline: 'EAU Urological Infection Guidelines',
        evidenceLevel: 'B-II'
      }
    ],

    egyptian_brands: [
      { brand_name: 'Augmentin 1g', company: 'GSK Egypt', price_egp: 135.0, availability: 'Shortage', dosage_forms: ['Tablet', 'Oral Suspension'] },
      { brand_name: 'Hibiotic 1g', company: 'Amoun Pharmaceuticals', price_egp: 105.0, availability: 'Available', dosage_forms: ['Tablet', 'Oral Suspension'] },
      { brand_name: 'Curam 1g', company: 'Sandoz / Novartis', price_egp: 115.0, availability: 'Available', dosage_forms: ['Tablet'] },
      { brand_name: 'Megamox 625mg', company: 'Hikma', price_egp: 78.0, availability: 'Available', dosage_forms: ['Tablet'] }
    ],

    monitoring: {
      baseline: ['Hepatic Function Tests (ALT/AST/Bilirubin)', 'Renal Function (CrCl)'],
      during: ['Liver enzymes if therapy > 14 days', 'Diarrhea assessment'],
      frequency: 'Weekly during prolonged courses'
    },

    patient_counseling: {
      missedDose: 'Take as soon as remembered with a meal.',
      storage: 'Keep tablets in blister pack until taken to protect from moisture.',
      driving: 'No known effect on driving ability.',
      alcohol: 'Avoid alcohol to reduce hepatotoxicity and gastrointestinal upset.',
      food: 'Take at the START of a meal to enhance absorption and minimize GI distress.',
      warningSymptoms: ['Nausea', 'Loose stools'],
      emergencySymptoms: ['Jaundice (Yellowing of eyes/skin)', 'Severe abdominal cramping with bloody diarrhea'],
      pregnancyAdvice: 'Consult physician before use; generally acceptable in early/mid pregnancy.'
    },

    renal_adjustment: {
      required: true,
      guidance: 'CrCl < 30 mL/min requires dose reduction or avoiding 875 mg / 1000 mg formulations.',
      doseByCrCl: [
        { crclRange: 'CrCl 10–30 mL/min', recommendedDose: '500/125 mg PO every 12 hours' },
        { crclRange: 'CrCl < 10 mL/min', recommendedDose: '500/125 mg PO every 24 hours' }
      ]
    },

    hepatic_adjustment: {
      childPughA: 'Monitor liver enzymes closely',
      childPughB: 'Use with caution; high risk of cholestatic jaundice',
      childPughC: 'Contraindicated or severe caution'
    },

    pediatric_min_age: '3 months',
    max_daily_dose_mg: 4000,
    side_effects: ['Diarrhea', 'Loose Stools', 'Cholestatic Jaundice', 'Nausea', 'Vaginal Candidiasis'],
    contraindications: ['Penicillin Allergy', 'History of Augmentin-induced hepatic dysfunction'],
    interactions: [
      { drug: 'Oral Contraceptive Pills', severity: 'Minor', mechanism: 'Minor reduction in estrogen recirculation', management: 'Use barrier backup contraception during treatment.' }
    ]
  },

  {
    id: 'ciprofloxacin',
    generic_name: 'Ciprofloxacin',
    brand_names: ['Ciprobay', 'Ciprofar', 'Serviflox', 'Ciprocin', 'Microflox'],
    ATC_code: 'J01MA02',
    RxNorm: '2551',
    SNOMED: '372833007',
    DrugBank_ID: 'DB00537',
    Drug_Class: 'Fluoroquinolone Antibiotic',
    Subclass: 'Second Generation Quinolone',
    FDA_Approval: true,
    Egypt_Approval: true,
    Controlled_Drug: false,
    OTC: false,
    Prescription: true,

    Pregnancy: {
      trimester1: 'Avoid (Category C / FDA Warning)',
      trimester2: 'Avoid',
      trimester3: 'Avoid (Articular cartilage toxicity risk in animal studies)',
      recommendation: 'Avoid during pregnancy unless no safe alternative exists',
      riskLevel: 'High',
      category: 'Category C'
    },
    Lactation: {
      milkTransfer: 'Excreted into breast milk in high concentrations',
      infantRisk: 'Moderate',
      alternativeDrug: 'Beta-lactams / Macrolides',
      advice: 'Avoid during breastfeeding or pump and discard milk for 48 hours post-dose.'
    },

    Black_Box_Warning: 'Boxed Warning: Tendonitis, tendon rupture, peripheral neuropathy, CNS effects, and exacerbation of Myasthenia Gravis.',
    Storage: 'Store below 30°C away from direct sunlight.',
    Manufacturer: 'Bayer / EIPICO / CID / Hikma',
    Price: 60,
    Availability: 'In Stock',

    disease_dosing: [
      {
        indication: 'Complicated Urinary Tract Infection (cUTI)',
        icd10: 'N39.0',
        dose: '500 mg PO',
        frequency: 'BID (every 12 hours)',
        duration: '7 - 10 days',
        guideline: 'IDSA Uncomplicated & Complicated UTI Guidelines 2024',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Acute Uncomplicated Pyelonephritis',
        icd10: 'N10',
        dose: '500 mg PO',
        frequency: 'BID',
        duration: '7 days',
        guideline: 'IDSA Guidelines',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Infectious Diarrhea / Traveler\'s Diarrhea',
        icd10: 'A09',
        dose: '500 mg PO',
        frequency: 'BID',
        duration: '3 days',
        guideline: 'ACG Clinical Guideline Disorders of Diarrhea',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Chronic Bacterial Prostatitis',
        icd10: 'N41.1',
        dose: '500 mg PO',
        frequency: 'BID',
        duration: '28 days (4 weeks)',
        guideline: 'EAU Guidelines on Urological Infections',
        evidenceLevel: 'A-I'
      }
    ],

    egyptian_brands: [
      { brand_name: 'Ciprobay 500mg', company: 'Bayer', price_egp: 92.0, availability: 'Available', dosage_forms: ['Tablet', 'IV Infusion'] },
      { brand_name: 'Ciprofar 500mg', company: 'EIPICO', price_egp: 42.0, availability: 'Available', dosage_forms: ['Tablet'] },
      { brand_name: 'Serviflox 500mg', company: 'Novartis Egypt', price_egp: 48.0, availability: 'Available', dosage_forms: ['Tablet'] }
    ],

    monitoring: {
      baseline: ['Renal Function (CrCl)', 'EKG for QTc baseline if taking QTc-prolonging agents', 'Tendon pain history'],
      during: ['Tendon pain or swelling (Achilles)', 'Blood glucose in diabetics', 'Mental status / CNS symptoms'],
      frequency: 'Immediate evaluation upon tendon pain or neurological signs'
    },

    patient_counseling: {
      missedDose: 'Take as soon as remembered. Do not take two doses at once.',
      storage: 'Keep at room temperature.',
      driving: 'May cause dizziness or lightheadedness; caution while driving.',
      alcohol: 'Avoid alcohol as it increases CNS dizziness side effects.',
      food: 'Do NOT take with milk, yogurt, or calcium-fortified juice alone. Separately take 2 hours before or 6 hours after calcium/antacids.',
      warningSymptoms: ['Mild dizziness', 'Nausea', 'Sun sensitivity'],
      emergencySymptoms: ['Sudden tendon pain, pop, or swelling (Achilles tendon rupture)', 'Burning pain or numbness in feet/hands', 'Hallucinations or severe depression'],
      pregnancyAdvice: 'Strictly avoided in pregnant women unless directed by a specialist.'
    },

    renal_adjustment: {
      required: true,
      guidance: 'Significant renal clearance; dose reduction required for CrCl < 50 mL/min.',
      doseByCrCl: [
        { crclRange: 'CrCl 30–50 mL/min', recommendedDose: '250–500 mg PO every 12 hours' },
        { crclRange: 'CrCl < 30 mL/min', recommendedDose: '250–500 mg PO every 24 hours' },
        { crclRange: 'Hemodialysis', recommendedDose: '250–500 mg PO every 24 hours (given post-dialysis)' }
      ]
    },

    hepatic_adjustment: {
      childPughA: 'No adjustment necessary',
      childPughB: 'No adjustment necessary',
      childPughC: 'Monitor closely'
    },

    pediatric_min_age: '18 years (Except complicated UTI or Anthrax exposure in pediatric emergency)',
    max_daily_dose_mg: 1500,
    side_effects: ['Nausea', 'Tendonitis / Tendon Rupture', 'QTc Prolongation', 'Photosensitivity', 'Clostridium difficile Diarrhea'],
    contraindications: ['Hypersensitivity to Quinolones', 'Concurrent administration of Tizanidine', 'Myasthenia Gravis'],
    interactions: [
      { drug: 'Theophylline', severity: 'Major', mechanism: 'Inhibition of CYP1A2 leading to severe theophylline toxicity', management: 'Avoid or reduce theophylline dose by 50% with level monitoring.' },
      { drug: 'Antacids / Iron / Calcium', severity: 'Major', mechanism: 'Chelation reducing ciprofloxacin absorption by up to 90%', management: 'Take Ciprofloxacin 2 hours before or 6 hours after multivalent cations.' },
      { drug: 'Warfarin', severity: 'Major', mechanism: 'Enhances anticoagulant effect', management: 'Monitor INR frequently and adjust Warfarin dose.' }
    ]
  }
];
