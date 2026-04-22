import { DRUG_INTERACTIONS } from '@/data/drugInteractions';
import { Patient } from '@/data/patients';
import { Diagnosis } from '@/data/diagnosisMappings';

export interface SafetyAlert {
  type: 'Interaction' | 'Contraindication' | 'Allergy';
  severity: 'Minor' | 'Moderate' | 'Severe';
  message: string;
}

export function checkSafetyAlerts(patient: Patient, diagnosis: Diagnosis): SafetyAlert[] {
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

  // Check contraindications (simplified example)
  if (patient.medications && diagnosis.name === 'Heart Failure' && patient.medications.some(m => m.name === 'NSAIDs')) {
    alerts.push({
      type: 'Contraindication',
      severity: 'Severe',
      message: 'NSAIDs can worsen Heart Failure.'
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
