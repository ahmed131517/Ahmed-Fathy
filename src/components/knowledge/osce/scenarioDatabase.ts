import { Scenario } from "./osceTypes";

export const SAMPLE_SCENARIOS: Scenario[] = [
  {
    id: "mi-001",
    title: "55yo M with Chest Pain",
    specialty: "Cardiology",
    difficulty: "Beginner",
    chiefComplaint: "My chest hurts like an elephant is sitting on it.",
    patientInfo: {
      name: "Arthur Pendelton",
      age: 55,
      gender: "Male",
      personality: "Anxious, in severe pain, sweating. Breathes heavily between words.",
      startingCondition: "Deteriorating"
    },
    initialVitals: {
      bp: "160/95",
      hr: 110,
      rr: 22,
      temp: 37.1,
      spo2: 94
    },
    diagnosis: "Acute Anterior STEMI",
    history: "Pain started 1 hour ago while carrying groceries. Radiates to left jaw and arm. Nauseous. Smokes 1 pack/day for 30 years. Father died of heart attack at 60.",
    medications: "Atorvastatin 20mg (but hasn't taken it in weeks), Omeprazole for acid reflux.",
    allergies: "Aspirin (Causes mild rash, NOT anaphylaxis)",
    physicalExamFindings: {
      general: "Diaphoretic, anxious, clutching chest (Levine's sign).",
      cardiovascular: "Tachycardic, regular rhythm. Normal S1/S2, no murmurs. Mildly elevated JVP.",
      respiratory: "Clear to auscultation bilaterally. No wheezes.",
      abdominal: "Soft, non-tender.",
      neurological: "Alert and oriented x3. No focal deficits."
    },
    investigations: {
      "ECG": "Sinus Tachycardia, 3mm ST elevation in V1-V4, reciprocal depression in II, III, aVF.",
      "Troponin": "0.85 ng/mL (Elevated)",
      "CXR": "Normal cardiomediastinal silhouette, no cardiomegaly. Mild pulmonary congestion.",
      "CBC": "WBC 11.0, Hb 14.5, Plt 250"
    },
    progressionLogic: "If aspirin, nitrates, or reperfusion therapy is not initiated within 10 minutes, patient will go into Ventricular Tachycardia.",
    redFlags: ["Left arm radiation", "Diaphoresis", "Family history of premature CAD", "Smoking history"]
  },
  {
    id: "pe-001",
    title: "30yo F with Sudden Dyspnea",
    specialty: "Internal Medicine",
    difficulty: "Intermediate",
    chiefComplaint: "I can't catch my breath and my chest hurts when I take a deep breath.",
    patientInfo: {
      name: "Jessica Miller",
      age: 30,
      gender: "Female",
      personality: "Panicked, hyperventilating. Recently returned from a long-haul flight.",
      startingCondition: "Stable"
    },
    initialVitals: {
      bp: "110/70",
      hr: 115,
      rr: 28,
      temp: 37.3,
      spo2: 91
    },
    diagnosis: "Pulmonary Embolism",
    history: "Sudden onset shortness of breath 2 hours ago. Sharp right-sided chest pain worse on inspiration. Flew back from Australia 2 days ago. Takes oral contraceptive pill.",
    medications: "Ethinyl estradiol/levonorgestrel (OCP)",
    allergies: "None",
    physicalExamFindings: {
      general: "Tachypneic, speaking in short sentences. Not using accessory muscles but looks uncomfortable.",
      cardiovascular: "Tachycardic. Prominent P2 heart sound.",
      respiratory: "Clear breath sounds bilaterally. No crackles or wheezes.",
      abdominal: "Normal.",
      neurological: "Normal.",
      extremities: "Left calf is swollen, warm, and mildly tender to palpation. Right calf normal."
    },
    investigations: {
      "ECG": "Sinus Tachycardia. S1Q3T3 pattern present. T-wave inversions in V1-V4.",
      "Troponin": "Mildly elevated (0.05 ng/mL)",
      "D-Dimer": "Positive (>1000 ng/mL)",
      "CXR": "Clear lungs. Hampton's Hump visible in right lower lobe.",
      "CTPA": "Large filling defect in the right main pulmonary artery extending into lobar branches, consistent with acute PE."
    },
    progressionLogic: "If untreated and tachycardia worsens, patient may become hypotensive and require vasopressors.",
    redFlags: ["Recent long flight", "OCP use", "Pleuritic chest pain", "Tachycardia out of proportion", "Unilateral leg swelling"]
  },
  {
    id: "app-001",
    title: "19yo M with Abdominal Pain",
    specialty: "Surgery",
    difficulty: "Beginner",
    chiefComplaint: "My stomach really hurts, mostly on the lower right side.",
    patientInfo: {
      name: "Tyler Jenkins",
      age: 19,
      gender: "Male",
      personality: "Guarding his stomach, winces when moving. Very uncomfortable.",
      startingCondition: "Stable"
    },
    initialVitals: {
      bp: "120/80",
      hr: 98,
      rr: 18,
      temp: 38.2,
      spo2: 99
    },
    diagnosis: "Acute Appendicitis",
    history: "Pain started around the umbilicus yesterday evening, then moved to the right lower quadrant this morning. Nauseous, vomited twice. Has not eaten in 24 hours.",
    medications: "None.",
    allergies: "Penicillin (Hives)",
    physicalExamFindings: {
      general: "Appears in mild to moderate distress. Lying still on the bed.",
      cardiovascular: "Regular rate and rhythm. No murmurs.",
      respiratory: "Clear to auscultation.",
      abdominal: "Significant tenderness in RLQ at McBurney's point. Rebound tenderness present. Positive Rovsing's sign.",
      neurological: "Normal."
    },
    investigations: {
      "CBC": "WBC 14.5 (Elevated), neutrophils 85%",
      "Ultrasound": "Appendix is enlarged (9mm diameter), non-compressible, with periappendiceal fluid.",
      "CT": "Enlarged appendix with fat stranding and appendicolith.",
      "Urinalysis": "Unremarkable, no WBC or nitrites."
    },
    progressionLogic: "Delaying surgery may result in rupture of the appendix and subsequent peritonitis.",
    redFlags: ["Migration of pain to RLQ", "Fever", "Anorexia and vomiting", "Rebound tenderness"]
  },
  {
    id: "dka-001",
    title: "22yo F with Nausea and Confusion",
    specialty: "Emergency",
    difficulty: "Advanced",
    chiefComplaint: "My daughter is throwing up constantly and seems really out of it.",
    patientInfo: {
      name: "Samantha Brooks",
      age: 22,
      gender: "Female",
      personality: "Lethargic, confused, answering questions slowly. Mother is answering most questions.",
      startingCondition: "Deteriorating"
    },
    initialVitals: {
      bp: "90/55",
      hr: 125,
      rr: 28,
      temp: 37.0,
      spo2: 96
    },
    diagnosis: "Diabetic Ketoacidosis (DKA) secondary to UTI",
    history: "Diagnosed with Type 1 Diabetes at age 10. Had a burning sensation when urinating 3 days ago. Stopped taking insulin yesterday because she wasn't eating due to nausea.",
    medications: "Glargine and Lispro, but non-compliant for 24 hours.",
    allergies: "Sulfa drugs",
    physicalExamFindings: {
      general: "Lethargic, poor skin turgor, dry mucous membranes. Fruity odor to breath.",
      cardiovascular: "Tachycardic. Weak peripheral pulses.",
      respiratory: "Deep, rapid breathing (Kussmaul respirations). Lungs clear.",
      abdominal: "Diffuse mild tenderness, no rebound or guarding.",
      neurological: "Lethargic, oriented only to person. GCS 13."
    },
    investigations: {
      "ABG": "pH 7.15, pCO2 25, HCO3 10",
      "CBC": "WBC 16.0",
      "BMP": "Na 130, K 5.8, Cl 98, HCO3 10, BUN 35, Cr 1.6, Glucose 450 mg/dL",
      "Urinalysis": "Large ketones, large glucose, positive leukocyte esterase, positive nitrites."
    },
    progressionLogic: "If fluids and insulin are not started promptly, patient will progress to coma.",
    redFlags: ["History of T1DM", "Omitted insulin", "Kussmaul respirations", "Altered mental status", "Fruity breath"]
  },
  {
    id: "pna-001",
    title: "68yo M with Cough and Fever",
    specialty: "Internal Medicine",
    difficulty: "Intermediate",
    chiefComplaint: "I've been coughing up green stuff and I feel awful.",
    patientInfo: {
      name: "Robert Hughes",
      age: 68,
      gender: "Male",
      personality: "Exhausted, occasionally coughing during the conversation.",
      startingCondition: "Stable"
    },
    initialVitals: {
      bp: "105/65",
      hr: 102,
      rr: 24,
      temp: 39.1,
      spo2: 92
    },
    diagnosis: "Community-Acquired Pneumonia (Lobar)",
    history: "Started feeling unwell 3 days ago with a dry cough that has now become productive of thick green sputum. Chills and rigors last night. Sharp right-sided chest pain when taking a deep breath.",
    medications: "Lisinopril for hypertension.",
    allergies: "None.",
    physicalExamFindings: {
      general: "Looks acutely ill, flushed cheeks. Sweaty.",
      cardiovascular: "Tachycardic, regular.",
      respiratory: "Bronchial breath sounds and crackles in the right lower zone. Dullness to percussion on the right base.",
      abdominal: "Normal.",
      neurological: "Alert and oriented x3.",
      extremities: "No cyanosis or edema."
    },
    investigations: {
      "CBC": "WBC 18.0 (Neutrophilia 90%)",
      "CXR": "Right lower lobe consolidation with air bronchograms. No pleural effusion.",
      "BMP": "BUN 22, Cr 1.0, Na 136",
      "ABG": "pH 7.38, pCO2 35, pO2 65 (Mild hypoxia)"
    },
    progressionLogic: "If antibiotics are delayed, patient may become septic with dropping BP and confusion.",
    redFlags: ["Productive cough with purulent sputum", "High fever", "Pleuritic chest pain", "Age > 65 with tachycardia"]
  },
  {
    id: "cva-001",
    title: "72yo F with Sudden Weakness",
    specialty: "Emergency",
    difficulty: "Advanced",
    chiefComplaint: "My... arm is... heavy...",
    patientInfo: {
      name: "Margaret Lin",
      age: 72,
      gender: "Female",
      personality: "Anxious, struggling to form words (expressive aphasia). Very frustrated.",
      startingCondition: "Deteriorating"
    },
    initialVitals: {
      bp: "185/100",
      hr: 88,
      rr: 16,
      temp: 36.8,
      spo2: 97
    },
    diagnosis: "Acute Ischemic Stroke (L MCA)",
    history: "Onset of symptoms was exactly 45 minutes ago while watching TV. Right face dropped, and she couldn't lift her right arm. Has a history of Atrial Fibrillation.",
    medications: "Metoprolol. Was prescribed Apixaban but 'couldn't afford it' and stopped taking it 2 months ago.",
    allergies: "Sulfa",
    physicalExamFindings: {
      general: "Alert but visibly distressed by inability to speak clearly.",
      cardiovascular: "Irregularly irregular rhythm (Atrial Fibrillation).",
      respiratory: "Clear.",
      abdominal: "Normal.",
      neurological: "Expressive aphasia. Right facial droop (spares forehead). 0/5 power in right arm, 3/5 power in right leg. Left side normal. NIHSS = 12.",
      extremities: "Normal."
    },
    investigations: {
      "CT": "CT Head non-contrast: No acute hemorrhage. Early loss of gray-white differentiation in Left MCA territory.",
      "ECG": "Atrial Fibrillation with rapid ventricular response.",
      "CBC": "Normal.",
      "BMP": "Glucose 105",
      "Coagulation": "PT/INR 1.1 (Not anticoagulated)"
    },
    progressionLogic: "Time is brain. Every minute past the tPA window (4.5h) reduces chance of full recovery. If BP is not managed, higher risk of hemorrhagic conversion.",
    redFlags: ["Sudden focal neurologic deficit", "Aphasia", "History of untreated A-Fib", "Time of onset < 1 hour"]
  }
];
