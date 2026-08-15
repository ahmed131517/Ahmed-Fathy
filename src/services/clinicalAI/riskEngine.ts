import { Patient } from '@/data/patients';
import { Diagnosis } from '@/data/diagnosisMappings';
import { 
  ClinicalSafetyOrchestrator, 
  UnifiedSafetyReport 
} from '@/services/ClinicalSafetyOrchestrator';

export interface SafetyAlert {
  type: 'Interaction' | 'Contraindication' | 'Allergy';
  severity: 'Minor' | 'Moderate' | 'Severe';
  message: string;
}

/**
 * Single Authoritative Safety Function for clinicalAI/riskEngine
 * Delegates to ClinicalSafetyOrchestrator to eliminate overlapping engines and conflicting safety decisions.
 */
export function checkSafetyAlerts(patient: Patient, diagnosis: Diagnosis | any): SafetyAlert[] {
  if (!patient) return [];

  const report: UnifiedSafetyReport = ClinicalSafetyOrchestrator.evaluateSync({
    patient,
    diagnosis
  });

  return report.alerts.map(a => {
    let type: SafetyAlert['type'] = 'Contraindication';
    if (a.sourceEngine === 'Allergy') type = 'Allergy';
    else if (a.sourceEngine === 'DDI') type = 'Interaction';

    let severity: SafetyAlert['severity'] = 'Moderate';
    if (a.severity === 'Contraindicated' || a.severity === 'Severe') severity = 'Severe';
    else if (a.severity === 'Major') severity = 'Severe';
    else if (a.severity === 'Moderate') severity = 'Moderate';
    else severity = 'Minor';

    return {
      type,
      severity,
      message: `${a.title}: ${a.message}`
    };
  });
}
