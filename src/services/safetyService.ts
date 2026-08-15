import { Patient } from '@/data/patients';
import { 
  ClinicalSafetyOrchestrator, 
  UnifiedSafetyReport, 
  UnifiedSafetyAlert 
} from '@/services/ClinicalSafetyOrchestrator';

export interface SafetyAlert {
  type: 'Interaction' | 'Contraindication' | 'Allergy' | 'Renal' | 'Hepatic' | 'Duplicate' | 'Geriatric';
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Major';
  drug?: string;
  message: string;
}

/**
 * Single Authoritative Safety Function
 * Delegates directly to ClinicalSafetyOrchestrator for unified, conflict-free arbitration.
 */
export function checkSafetyAlerts(patient: Patient, diagnosis: any): SafetyAlert[] {
  if (!patient) return [];

  const report: UnifiedSafetyReport = ClinicalSafetyOrchestrator.evaluateSync({
    patient,
    diagnosis
  });

  // Map unified orchestrator alerts to legacy SafetyAlert interface
  return report.alerts.map(a => {
    let legacyType: SafetyAlert['type'] = 'Contraindication';
    if (a.sourceEngine === 'Allergy') legacyType = 'Allergy';
    else if (a.sourceEngine === 'DDI') legacyType = 'Interaction';
    else if (a.sourceEngine === 'Renal') legacyType = 'Renal';
    else if (a.sourceEngine === 'Hepatic') legacyType = 'Hepatic';
    else if (a.sourceEngine === 'DuplicateTherapy') legacyType = 'Duplicate';
    else if (a.sourceEngine === 'EmergencyRules') legacyType = 'Geriatric';

    let legacySeverity: SafetyAlert['severity'] = 'Moderate';
    if (a.severity === 'Contraindicated' || a.severity === 'Severe') legacySeverity = 'Severe';
    else if (a.severity === 'Major') legacySeverity = 'Major';
    else if (a.severity === 'Moderate') legacySeverity = 'Moderate';
    else legacySeverity = 'Minor';

    return {
      type: legacyType,
      severity: legacySeverity,
      drug: a.drug,
      message: `${a.title}: ${a.message}${a.actionRequired ? ` (Action: ${a.actionRequired})` : ''}`
    };
  });
}

/**
 * Full access to the single authoritative ClinicalSafetyOrchestrator
 */
export async function evaluateUnifiedSafety(patient: Patient, diagnosis: any, medications?: any[]): Promise<UnifiedSafetyReport> {
  return ClinicalSafetyOrchestrator.evaluate({
    patient,
    diagnosis,
    medications,
    options: { includeAsyncRxNav: true }
  });
}
