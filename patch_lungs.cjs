const fs = require('fs');
const path = 'src/data/symptomModels.ts';
let content = fs.readFileSync(path, 'utf8');

const regex = /export const LUNGS_MODELS: SymptomModel\[\] = \[[^]*?\];\n\nexport const HEART_MODELS/m;

const replacement = `export const LUNGS_MODELS: SymptomModel[] = [
  // BREATHING SYMPTOMS
  {
    id: "lungs_dyspnea",
    label: "Shortness of Breath (Dyspnea)",
    dimensions: {
      onset: ["sudden (Acute)", "gradual over days", "chronic/progressive"],
      triggers: ["at rest", "light activity", "heavy exertion (DOE)", "no clear trigger", "exposure to allergens/cold"],
      severity: ["cannot speak in full sentences", "affects normal conversation", "only with exercise"]
    },
    redFlags: [
      "Sudden severe dyspnea (Pulmonary Embolism / Pneumothorax alert)",
      "Inability to speak in full sentences",
      "Bluish tint to lips/fingernails (Cyanosis)",
      "Silent chest (no air movement heard - Asthma emergency)",
      "Use of accessory muscles (neck/rib retractions)"
    ],
    requiredExams: [
      "Vital signs including pulse oximetry",
      "Auscultation for wheezing, crackles, or absent breath sounds",
      "Assess for use of accessory muscles and work of breathing"
    ]
  },
  {
    id: "lungs_tachypnea_air_hunger",
    label: "Rapid Breathing / Air Hunger",
    dimensions: {
      character: ["feeling 'air hunger'", "rapid/shallow breathing (Tachypnea)", "gasping/panting"],
      associated: ["anxiety/panic", "chest tightness", "lightheadedness", "tingling in fingers/lips (hyperventilation)"]
    },
    redFlags: [
      "Breathing rate > 30 breaths per minute",
      "Confusion or altered mental state",
      "Central cyanosis"
    ],
    requiredExams: [
      "Count respiratory rate over full 60 seconds",
      "Arterial blood gas (ABG) if severe",
      "Rule out metabolic acidosis (e.g., Kussmaul breathing in DKA)"
    ]
  },
  {
    id: "lungs_noisy_breathing",
    label: "Noisy Breathing (Stridor/Wheezing)",
    dimensions: {
      type: ["high-pitched on inspiration (Stridor)", "whistling on expiration (Wheezing)", "snoring/gurgling (Stertor)", "grunting"],
      associated: ["cough", "throat tightness", "difficulty swallowing", "hoarseness"]
    },
    redFlags: [
      "Stridor (severe upper airway obstruction alert - Epiglottitis, Anaphylaxis, Foreign Body)",
      "Drooling or inability to swallow with noisy breathing",
      "Rapidly worsening obstruction"
    ],
    requiredExams: [
      "Immediate evaluation of airway patency",
      "Avoid throat exam with tongue depressor if epiglottitis suspected",
      "Neck X-ray or direct laryngoscopy in controlled setting"
    ]
  },
  {
    id: "lungs_positional_breathing",
    label: "Positional Breathing Issues (Orthopnea/PND)",
    dimensions: {
      type: ["difficulty breathing when flat (Orthopnea)", "waking up gasping at night (PND)", "better when leaning forward (Tripoding)"],
      severity: ["needs 1 pillow", "needs 2+ pillows", "must sleep in chair"]
    },
    redFlags: [
      "Orthopnea + leg/ankle edema + JVD (Heart failure suspicion)",
      "Sudden waking with extreme air hunger and frothy sputum",
      "Rapid worsening over 24-48 hours"
    ],
    requiredExams: [
      "Assess jugular venous distention (JVD)",
      "Auscultate for S3 gallop and basilar crackles",
      "Echocardiogram and BNP level"
    ]
  },

  // COUGH SYMPTOMS
  {
    id: "lungs_cough",
    label: "Cough",
    dimensions: {
      character: ["dry/hacking", "productive (wet/phlegm)", "whooping/paroxysmal", "barking (croupy)"],
      duration: ["acute (< 3 weeks)", "subacute (3-8 weeks)", "chronic (> 8 weeks)"],
      timing: ["nocturnal (at night)", "morning only", "post-viral sequence", "constant", "with eating/drinking (aspiration)"]
    },
    redFlags: [
      "High fever and chills (Pneumonia)",
      "Significant unexplained weight loss or night sweats (TB/Malignancy)",
      "New or changing cough in long-term smoker",
      "Coughing accompanied by syncope (Cough syncope)"
    ],
    requiredExams: [
      "Chest X-ray if chronic, atypical, or accompanied by red flags",
      "Spirometry if asthma or COPD suspected",
      "Swallow evaluation if aspiration suspected"
    ]
  },

  // SPUTUM / SECRETIONS
  {
    id: "lungs_sputum",
    label: "Sputum / Phlegm Production",
    dimensions: {
      character: ["clear/white (mucoid)", "yellow/green (purulent)", "thick/tenacious", "foul-smelling", "pink/frothy", "rust-colored"],
      amount: ["small/streaks", "significant teaspoons", "cups per day (Bronchorrhea)"]
    },
    redFlags: [
      "Blood-streaked or frank blood (Hemoptysis - TB / Cancer / PE / Bronchiectasis alert)",
      "Pink, frothy sputum (Acute Pulmonary Edema alert)",
      "Foul-smelling 'anchovy paste' or similar unique odors (Lung abscess)"
    ],
    requiredExams: [
      "Sputum culture and sensitivity",
      "Sputum for Acid Fast Bacilli (AFB) if TB suspected",
      "CT Chest for hemoptysis or suspected bronchiectasis"
    ]
  },

  // CHEST SOUNDS & SENSATION
  {
    id: "lungs_chest_tightness_congestion",
    label: "Chest Tightness / Congestion",
    dimensions: {
      character: ["squeezing sensation", "heavy weight", "congestion/rattle", "internal crackling"],
      triggers: ["cold air", "exercise", "allergens", "upper respiratory infection"]
    },
    redFlags: [
      "Radiating to neck/arm/jaw (Rule out cardiac etiology)",
      "Associated with profuse sweating (Diaphoresis)",
      "Not relieved by rest or inhalers"
    ],
    requiredExams: [
      "ECG/EKG to rule out cardiac ischemia (especially in older adults)",
      "Peak flow measurement",
      "Chest auscultation"
    ]
  },

  // CHEST DISCOMFORT
  {
    id: "lungs_pleuritic_pain",
    label: "Pain with Breathing (Pleuritic)",
    dimensions: {
      character: ["sharp/stabbing", "catches when breathing in", "localized to one side"],
      triggers: ["deep breath", "coughing", "sneezing", "movement/twisting"]
    },
    redFlags: [
      "Pleuritic chest pain + sudden dyspnea + tachycardia (Pulmonary Embolism alert)",
      "Pleuritic pain + high fever + productive cough (Pneumonia alert)",
      "Trauma to chest preceding pain (Rib fracture / Pneumothorax)"
    ],
    requiredExams: [
      "Wells Criteria for PE and D-dimer if appropriate",
      "Chest X-ray to evaluate for consolidation or pneumothorax",
      "CT Pulmonary Angiography (CTPA) if high suspicion for PE"
    ]
  },

  // INFECTIOUS / INFLAMMATORY
  {
    id: "lungs_infections_recurrent",
    label: "Recurrent Chest Infections",
    dimensions: {
      frequency: ["multiple times per year", "lingering 'colds' that go to chest", "never fully clearing"],
      associated: ["smoker history", "chronic fatigue", "fever", "copious sputum"]
    },
    redFlags: [
      "Recurrent pneumonia in the exact same lung area (Endobronchial lesion / Lung cancer)",
      "Night sweats, fever, and weight loss",
      "Childhood onset of severe recurrent infections (Cystic Fibrosis / Immunodeficiency)"
    ],
    requiredExams: [
      "High-Resolution CT (HRCT) of chest",
      "Immunoglobulin levels",
      "Consider bronchoscopy for recurrent localized infiltrates"
    ]
  }
];\n\nexport const HEART_MODELS`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Updated LUNGS_MODELS successfully.");
} else {
  console.log("Could not match the regex for LUNGS_MODELS.");
}
