import { DRUG_INTERACTIONS } from '@/data/drugInteractions';
import { Patient } from '@/data/patients';

export interface SafetyAlert {
  type: 'Interaction' | 'Contraindication' | 'Allergy' | 'Renal' | 'Hepatic';
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Major';
  message: string;
}

export function checkSafetyAlerts(patient: Patient, diagnosis: any): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];

  // Check medication interactions
  if (patient.medications) {
    for (let i = 0; i < patient.medications.length; i++) {
      for (let j = i + 1; j < patient.medications.length; j++) {
        const interaction = DRUG_INTERACTIONS.find(
          (inter) =>
            (inter.drugA === patient.medications![i].name && inter.drugB === patient.medications![j].name) ||
            (inter.drugA === patient.medications![j].name && inter.drugB === patient.medications![i].name)
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
  }

  // Check contraindications
  const contraindicationRules = [
    { 
      condition: /heart failure|chf/i, 
      meds: ['NSAIDs', 'Ibuprofen', 'Naproxen', 'Diclofenac'], 
      message: 'NSAIDs can cause fluid retention and worsen heart failure symptoms.' 
    },
    { 
      condition: /asthma|copd/i, 
      meds: ['Propranolol', 'Atenolol', 'Metoprolol', 'Beta Blockers'], 
      message: 'Non-selective beta-blockers can trigger bronchospasm in patients with asthma/COPD.' 
    },
    { 
      condition: /diabetes|hyperglycemia/i, 
      meds: ['Prednisone', 'Dexamethasone', 'Steroids'], 
      message: 'Corticosteroids can significantly increase blood glucose levels.' 
    },
    { 
      condition: /peptic ulcer|gastritis|gastro/i, 
      meds: ['NSAIDs', 'Aspirin', 'Ibuprofen'], 
      message: 'NSAIDs increase the risk of gastric perforation and GI bleeding.' 
    },
    { 
      condition: /pregnancy|pregnant/i, 
      meds: ['Lisinopril', 'Enalapril', 'Losartan', 'Valsartan', 'Statins', 'Warfarin'], 
      message: 'Teratogenic risk: This medication is contraindicated or should be used with extreme caution in pregnancy.' 
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
