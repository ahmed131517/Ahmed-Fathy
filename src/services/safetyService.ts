import { DRUG_INTERACTIONS } from '@/data/drugInteractions';
import { Patient } from '@/data/patients';

export interface SafetyAlert {
  type: 'Interaction' | 'Contraindication' | 'Allergy' | 'Renal' | 'Hepatic' | 'Duplicate' | 'Geriatric';
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Major';
  drug?: string;
  message: string;
}

const THERAPEUTIC_CLASSES: Record<string, string[]> = {
  'ACE Inhibitors': ['Lisinopril', 'Enalapril', 'Ramipril', 'Benazepril', 'Captopril', 'Fosinopril'],
  'ARBs': ['Losartan', 'Valsartan', 'Candesartan', 'Irbesartan', 'Olmesartan', 'Telmisartan'],
  'Statins': ['Atorvastatin', 'Simvastatin', 'Rosuvastatin', 'Pravastatin', 'Lovastatin', 'Fluvastatin'],
  'NSAIDs': ['Ibuprofen', 'Naproxen', 'Diclofenac', 'Celecoxib', 'Meloxicam', 'Indomethacin', 'Ketorolac'],
  'Proton Pump Inhibitors': ['Omeprazole', 'Pantoprazole', 'Lansoprazole', 'Esomeprazole', 'Rabeprazole'],
  'Beta Blockers': ['Metoprolol', 'Atenolol', 'Carvedilol', 'Propranolol', 'Bisoprolol', 'Labetalol', 'Nadolol'],
  'SSRIs': ['Sertraline', 'Fluoxetine', 'Escitalopram', 'Citalopram', 'Paroxetine', 'Fluvoxamine'],
  'Calcium Channel Blockers': ['Amlodipine', 'Diltiazem', 'Verapamil', 'Nifedipine', 'Felodipine'],
  'Loop Diuretics': ['Furosemide', 'Bumetanide', 'Torsemide'],
};

export function checkSafetyAlerts(patient: Patient, diagnosis: any): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];
  const activeMeds = patient.medications || [];

  // 1. Duplicate Therapy Detection
  const detectedClasses: Record<string, string[]> = {};
  activeMeds.forEach(med => {
    for (const [className, members] of Object.entries(THERAPEUTIC_CLASSES)) {
      if (members.some(m => med.name.toLowerCase().includes(m.toLowerCase()))) {
        if (!detectedClasses[className]) detectedClasses[className] = [];
        detectedClasses[className].push(med.name);
      }
    }
  });

  Object.entries(detectedClasses).forEach(([className, meds]) => {
    if (meds.length > 1) {
      alerts.push({
        type: 'Duplicate',
        severity: 'Major',
        message: `Therapeutic duplication detected: ${meds.join(' and ')} are both ${className}. This increases risk of adverse effects without therapeutic benefit.`
      });
    }
  });

  // 2. Geriatric Safety (Beers Criteria)
  if (patient.age >= 65) {
    const BeersPIMs = [
      { meds: ['Amitriptyline', 'Nortriptyline', 'Imipramine'], message: 'Highly anticholinergic; risk of orthostatic hypotension and falls.' },
      { meds: ['Diphenhydramine', 'Hydroxyzine'], message: 'High risk of confusion, dry mouth, and constipation; avoid for insomnia/allergies.' },
      { meds: ['Diazepam', 'Alprazolam', 'Chlordiazepoxide'], message: 'Increased risk of cognitive impairment, delirium, transitions to falls/fractures.' },
      { meds: ['Glyburide'], message: 'High risk of severe prolonged hypoglycemia.' },
      { meds: ['Indomethacin', 'Ketorolac'], message: 'Higher risk of GI bleeding/PUD and renal injury compared to other NSAIDs.' },
    ];

    BeersPIMs.forEach(rule => {
      const hasMed = activeMeds.some(m => rule.meds.some(pattern => m.name.toLowerCase().includes(pattern.toLowerCase())));
      if (hasMed) {
        alerts.push({
          type: 'Geriatric',
          severity: 'Moderate',
          message: `Geriatric Safety (Beers Criteria): ${rule.message}`
        });
      }
    });
  }

  // 3. Drug-Drug Interactions (from database)
  for (let i = 0; i < activeMeds.length; i++) {
    for (let j = i + 1; j < activeMeds.length; j++) {
      const interaction = DRUG_INTERACTIONS.find(
        (inter) =>
          (inter.drugA === activeMeds[i].name && inter.drugB === activeMeds[j].name) ||
          (inter.drugA === activeMeds[j].name && inter.drugB === activeMeds[i].name)
      );
      if (interaction) {
        alerts.push({
          type: 'Interaction',
          severity: interaction.severity,
          message: `Interaction between ${interaction.drugA} and ${interaction.drugB}: ${interaction.description}`
        });
      }
    }
  }

  // 4. Drug-Disease Contraindications
  const contraindicationRules = [
    { 
      condition: /heart failure|chf/i, 
      meds: ['NSAIDs', 'Ibuprofen', 'Naproxen', 'Diclofenac', 'Celecoxib', 'Pioglitazone'], 
      message: 'Can cause fluid retention and increase risk of CHF exacerbation.' 
    },
    { 
      condition: /asthma|copd/i, 
      meds: ['Propranolol', 'Atenolol', 'Metoprolol', 'Beta Blockers', 'Carvedilol', 'Labetalol'], 
      message: 'Non-selective beta-blockers can trigger bronchospasm.' 
    },
    { 
      condition: /diabetes|hyperglycemia/i, 
      meds: ['Prednisone', 'Dexamethasone', 'Steroids', 'Hydrocortisone'], 
      message: 'Corticosteroids increase blood glucose levels.' 
    },
    { 
      condition: /peptic ulcer|gastritis|gastro/i, 
      meds: ['NSAIDs', 'Aspirin', 'Ibuprofen', 'Anticoagulants', 'Warfarin', 'Rivaroxaban'], 
      message: 'Increases risk of gastrointestinal bleeding/perforation.' 
    },
    { 
      condition: /pregnancy|pregnant/i, 
      meds: ['Lisinopril', 'Enalapril', 'Losartan', 'Valsartan', 'Statins', 'Warfarin', 'Methotrexate', 'Phenytoin', 'Valproic Acid'], 
      message: 'Teratogenic risk: Contraindicated in pregnancy.' 
    },
    {
      condition: /hypertension/i,
      meds: ['Pseudoephedrine', 'Phenylephrine', 'NSAIDs'],
      message: 'May increase blood pressure or antagonize antihypertensive therapy.'
    },
    {
      condition: /glaucoma/i,
      meds: ['Atropine', 'Scopolamine', 'Amitriptyline', 'Diphenhydramine'],
      message: 'Anticholinergics can exacerbate narrow-angle glaucoma.'
    },
    {
      condition: /gout/i,
      meds: ['Thiazide', 'Hydrochlorothiazide', 'Aspirin'],
      message: 'May increase uric acid levels and trigger gout flares.'
    },
    {
      condition: /bradycardia|heart block/i,
      meds: ['Beta Blockers', 'Propranolol', 'Metoprolol', 'Atenolol', 'Verapamil', 'Diltiazem', 'Digoxin'],
      message: 'May further decrease heart rate and worsen bradycardia/heart block.'
    },
    {
      condition: /parkinson/i,
      meds: ['Metoclopramide', 'Prochlorperazine', 'Promethazine', 'Haloperidol', 'Risperidone'],
      message: 'Dopamine antagonists may worsen Parkinsonian symptoms.'
    },
    {
      condition: /dementia|alzheimer/i,
      meds: ['Amitriptyline', 'Diphenhydramine', 'Oxybutynin', 'Hydroxyzine', 'Scopolamine'],
      message: 'Anticholinergic drugs can worsen cognitive function in patients with dementia.'
    },
    {
      condition: /benign prostatic hyperplasia|bph/i,
      meds: ['Amitriptyline', 'Diphenhydramine', 'Pseudoephedrine', 'Phenylephrine'],
      message: 'May worsen urinary retention in patients with BPH.'
    }
  ];

  if (patient.medications && diagnosis.name) {
    const combinedConditions = [
      diagnosis.name,
      ...(patient.chronicConditions || [])
    ];

    contraindicationRules.forEach(rule => {
      const hasCondition = combinedConditions.some(c => rule.condition.test(c));
      const hasMed = patient.medications!.some(m => 
        rule.meds.some(pattern => m.name.toLowerCase().includes(pattern.toLowerCase()))
      );

      if (hasCondition && hasMed) {
        alerts.push({
          type: 'Contraindication',
          severity: 'Severe',
          message: rule.message
        });
      }
    });
  }

  // Check allergies
  if (patient.medications && patient.allergies) {
    const allergyClasses: Record<string, string[]> = {
      'Penicillin': ['Amoxicillin', 'Ampicillin', 'Penicillin G', 'Penicillin V', 'Piperacillin', 'Ticarcillin'],
      'NSAIDs': ['Ibuprofen', 'Aspirin', 'Naproxen', 'Celecoxib', 'Diclofenac', 'Indomethacin', 'Ketorolac'],
      'Sulfa': ['Sulfamethoxazole', 'Sulfasalazine', 'Sulfisoxazole'],
    };

    for (const med of patient.medications) {
      // Direct match
      const directAllergy = patient.allergies.find(a => a.name.toLowerCase() === med.name.toLowerCase());
      if (directAllergy) {
        alerts.push({
          type: 'Allergy',
          severity: directAllergy.severity,
          message: `Patient is allergic to ${med.name} (Severity: ${directAllergy.severity}).`
        });
        continue;
      }

      // Class match
      for (const [allergyClass, members] of Object.entries(allergyClasses)) {
        const hasClassAllergy = patient.allergies.find(a => a.name.toLowerCase().includes(allergyClass.toLowerCase()));
        if (hasClassAllergy && members.some(m => m.toLowerCase() === med.name.toLowerCase())) {
          alerts.push({
            type: 'Allergy',
            severity: hasClassAllergy.severity,
            message: `Patient has a ${allergyClass} allergy. ${med.name} belongs to this class (Severity: ${hasClassAllergy.severity}).`
          });
        }
      }
    }
  }

  return alerts;
}
