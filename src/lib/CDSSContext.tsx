import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, PatientRecord, Prescription, PrescriptionItem, LabResult, Diagnosis } from './db';

export interface CDSSAlert {
  id: string;
  patientId: string;
  type: 'drug-interaction' | 'abnormal-lab' | 'contraindication';
  severity: 'high' | 'medium' | 'low';
  message: string;
  details?: string;
  timestamp: number;
}

interface CDSSContextType {
  alerts: CDSSAlert[];
  dismissAlert: (id: string) => void;
  getAlertsForPatient: (patientId: string) => CDSSAlert[];
}

const CDSSContext = createContext<CDSSContextType | undefined>(undefined);

export function CDSSProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<CDSSAlert[]>([]);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());

  // Fetch all relevant data
  const patients = useLiveQuery(() => db.patients.toArray()) || [];
  const prescriptions = useLiveQuery(() => db.prescriptions.toArray()) || [];
  const prescriptionItems = useLiveQuery(() => db.prescription_items.toArray()) || [];
  const labResults = useLiveQuery(() => db.lab_results.toArray()) || [];
  const diagnoses = useLiveQuery(() => db.diagnoses.toArray()) || [];

  useEffect(() => {
    const newAlerts: CDSSAlert[] = [];

    // 1. Check for abnormal lab results
    labResults.forEach(lab => {
      if (lab.status === 'abnormal' || lab.status === 'critical') {
        const alertId = `lab-${lab.localId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId,
            patientId: lab.patientId,
            type: 'abnormal-lab',
            severity: lab.status === 'critical' ? 'high' : 'medium',
            message: `Abnormal Lab Result: ${lab.testName}`,
            details: `Value: ${lab.value} ${lab.unit} (Ref: ${lab.referenceRange})`,
            timestamp: new Date(lab.date).getTime() || Date.now()
          });
        }
      }
    });

    // Group prescriptions by patient
    const patientPrescriptions = new Map<string, PrescriptionItem[]>();
    prescriptions.forEach(p => {
      const items = prescriptionItems.filter(pi => pi.prescriptionId === p.id || pi.prescriptionId === String(p.localId));
      const existing = patientPrescriptions.get(p.patientId) || [];
      patientPrescriptions.set(p.patientId, [...existing, ...items]);
    });

    // Helper functions for drug classes
    const isNSAID = (name: string) => /ibuprofen|naproxen|diclofenac|celecoxib|meloxicam|ketorolac/i.test(name);
    const isSSRI = (name: string) => /fluoxetine|sertraline|citalopram|escitalopram|paroxetine/i.test(name);
    const isMAOI = (name: string) => /phenelzine|tranylcypromine|selegiline|isocarboxazid/i.test(name);
    const isNitrate = (name: string) => /nitroglycerin|isosorbide/i.test(name);
    const isStatin = (name: string) => /atorvastatin|simvastatin|rosuvastatin|pravastatin/i.test(name);
    const isMacrolide = (name: string) => /clarithromycin|erythromycin|azithromycin/i.test(name);
    const isBenzo = (name: string) => /diazepam|lorazepam|alprazolam|clonazepam|temazepam/i.test(name);

    // 2. Check for potential drug interactions
    patientPrescriptions.forEach((items, patientId) => {
      const medNames = items.map(i => (i.medicationName || '').toLowerCase());
      
      // Interaction: Warfarin + Aspirin
      if (medNames.some(n => n.includes('warfarin')) && medNames.some(n => n.includes('aspirin'))) {
        const alertId = `interaction-warfarin-aspirin-${patientId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId, patientId, type: 'drug-interaction', severity: 'high',
            message: 'Potential Drug Interaction: Warfarin and Aspirin',
            details: 'Increased risk of bleeding.', timestamp: Date.now()
          });
        }
      }

      // Interaction: ACE Inhibitor + Potassium
      if (medNames.some(n => n.includes('lisinopril') || n.includes('enalapril')) && medNames.some(n => n.includes('potassium'))) {
        const alertId = `interaction-ace-potassium-${patientId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId, patientId, type: 'drug-interaction', severity: 'medium',
            message: 'Potential Drug Interaction: ACE Inhibitor and Potassium',
            details: 'Risk of hyperkalemia.', timestamp: Date.now()
          });
        }
      }

      // Interaction: SSRI + MAOI
      if (medNames.some(isSSRI) && medNames.some(isMAOI)) {
        const alertId = `interaction-ssri-maoi-${patientId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId, patientId, type: 'drug-interaction', severity: 'high',
            message: 'Severe Drug Interaction: SSRI and MAOI',
            details: 'High risk of Serotonin Syndrome. Allow washout period between these medications.', timestamp: Date.now()
          });
        }
      }

      // Interaction: Sildenafil + Nitrates
      if (medNames.some(n => n.includes('sildenafil') || n.includes('tadalafil')) && medNames.some(isNitrate)) {
        const alertId = `interaction-sildenafil-nitrate-${patientId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId, patientId, type: 'drug-interaction', severity: 'high',
            message: 'Severe Drug Interaction: PDE5 Inhibitor and Nitrates',
            details: 'Risk of severe, potentially fatal hypotension.', timestamp: Date.now()
          });
        }
      }

      // Interaction: Statins + Macrolides
      if (medNames.some(isStatin) && medNames.some(isMacrolide)) {
        const alertId = `interaction-statin-macrolide-${patientId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId, patientId, type: 'drug-interaction', severity: 'medium',
            message: 'Potential Drug Interaction: Statin and Macrolide Antibiotic',
            details: 'Increased risk of myopathy and rhabdomyolysis.', timestamp: Date.now()
          });
        }
      }

      // Duplicate Therapy: Multiple NSAIDs
      const nsaids = medNames.filter(isNSAID);
      if (nsaids.length > 1) {
        const alertId = `duplicate-nsaid-${patientId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId, patientId, type: 'drug-interaction', severity: 'medium',
            message: 'Duplicate Therapy: Multiple NSAIDs detected',
            details: `Patient is prescribed: ${nsaids.join(', ')}. Increased risk of GI bleeding and renal toxicity.`, timestamp: Date.now()
          });
        }
      }

      // Interaction: Fluoroquinolones + Corticosteroids
      const isFluoroquinolone = (name: string) => /ciprofloxacin|levofloxacin|moxifloxacin/i.test(name);
      const isCorticosteroid = (name: string) => /prednisone|dexamethasone|hydrocortisone|methylprednisolone/i.test(name);
      if (medNames.some(isFluoroquinolone) && medNames.some(isCorticosteroid)) {
        const alertId = `interaction-fq-steroid-${patientId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId, patientId, type: 'drug-interaction', severity: 'medium',
            message: 'Potential Drug Interaction: Fluoroquinolone and Corticosteroid',
            details: 'Increased risk of severe tendon rupture, especially in older adults.', timestamp: Date.now()
          });
        }
      }

      // Interaction: Clopidogrel + Omeprazole
      if (medNames.some(n => n.includes('clopidogrel')) && medNames.some(n => n.includes('omeprazole'))) {
        const alertId = `interaction-clopidogrel-omeprazole-${patientId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId, patientId, type: 'drug-interaction', severity: 'medium',
            message: 'Potential Drug Interaction: Clopidogrel and Omeprazole',
            details: 'Omeprazole may reduce the antiplatelet effect of clopidogrel.', timestamp: Date.now()
          });
        }
      }

      // Interaction: Spironolactone + ACE Inhibitors/ARBs
      const isACEorARB = (name: string) => /lisinopril|enalapril|losartan|valsartan/i.test(name);
      if (medNames.some(n => n.includes('spironolactone')) && medNames.some(isACEorARB)) {
        const alertId = `interaction-spironolactone-ace-${patientId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId, patientId, type: 'drug-interaction', severity: 'high',
            message: 'Potential Drug Interaction: Spironolactone and ACE Inhibitor/ARB',
            details: 'Significantly increased risk of severe hyperkalemia. Close monitoring required.', timestamp: Date.now()
          });
        }
      }

      // Interaction: Lithium + NSAIDs
      if (medNames.some(n => n.includes('lithium')) && medNames.some(isNSAID)) {
        const alertId = `interaction-lithium-nsaid-${patientId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId, patientId, type: 'drug-interaction', severity: 'high',
            message: 'Potential Drug Interaction: Lithium and NSAID',
            details: 'NSAIDs can decrease lithium clearance, leading to lithium toxicity.', timestamp: Date.now()
          });
        }
      }
    });

    // 3. Check for contraindications and age-based rules
    patients.forEach(patient => {
      const patientId = patient.id || String(patient.localId);
      const patientDiags = diagnoses.filter(d => d.patientId === patientId);
      const items = patientPrescriptions.get(patientId) || [];
      const medNames = items.map(i => (i.medicationName || '').toLowerCase());
      const diagNames = patientDiags.map(d => (d.condition || '').toLowerCase());

      // Contraindication: Beta-blocker + Asthma
      if (medNames.some(n => n.includes('propranolol') || n.includes('metoprolol') || n.includes('carvedilol')) && diagNames.some(n => n.includes('asthma') || n.includes('copd'))) {
        const alertId = `contra-beta-asthma-${patientId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId, patientId, type: 'contraindication', severity: 'high',
            message: 'Contraindication: Beta-blocker in Asthma/COPD patient',
            details: 'May cause bronchospasm. Consider cardioselective beta-blocker if necessary.', timestamp: Date.now()
          });
        }
      }

      // Contraindication: NSAID + Peptic Ulcer Disease
      if (medNames.some(isNSAID) && diagNames.some(n => n.includes('ulcer') || n.includes('peptic') || n.includes('gi bleed'))) {
        const alertId = `contra-nsaid-ulcer-${patientId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId, patientId, type: 'contraindication', severity: 'high',
            message: 'Contraindication: NSAID in patient with Peptic Ulcer Disease',
            details: 'High risk of gastrointestinal bleeding.', timestamp: Date.now()
          });
        }
      }

      // Contraindication: Metformin + CKD
      if (medNames.some(n => n.includes('metformin')) && diagNames.some(n => n.includes('kidney') || n.includes('renal') || n.includes('ckd'))) {
        const alertId = `contra-metformin-ckd-${patientId}`;
        if (!dismissedAlertIds.has(alertId)) {
          newAlerts.push({
            id: alertId, patientId, type: 'contraindication', severity: 'high',
            message: 'Contraindication: Metformin in patient with Renal Impairment',
            details: 'Increased risk of lactic acidosis. Verify eGFR.', timestamp: Date.now()
          });
        }
      }

      // Age-based rules
      if (patient.age) {
        // Beers Criteria: Benzos in Elderly
        if (patient.age >= 65 && medNames.some(isBenzo)) {
          const alertId = `age-benzo-elderly-${patientId}`;
          if (!dismissedAlertIds.has(alertId)) {
            newAlerts.push({
              id: alertId, patientId, type: 'contraindication', severity: 'medium',
              message: 'Beers Criteria: Benzodiazepine in Elderly Patient (>65)',
              details: 'Increased risk of cognitive impairment, delirium, falls, and fractures.', timestamp: Date.now()
            });
          }
        }

        // Aspirin in children
        if (patient.age < 18 && medNames.some(n => n.includes('aspirin'))) {
          const alertId = `age-aspirin-child-${patientId}`;
          if (!dismissedAlertIds.has(alertId)) {
            newAlerts.push({
              id: alertId, patientId, type: 'contraindication', severity: 'high',
              message: 'Contraindication: Aspirin in Pediatric Patient (<18)',
              details: 'Risk of Reye\'s syndrome, especially during viral infections.', timestamp: Date.now()
            });
          }
        }
      }
    });

    setAlerts(newAlerts.sort((a, b) => b.timestamp - a.timestamp));
  }, [patients, prescriptions, prescriptionItems, labResults, diagnoses, dismissedAlertIds]);

  const dismissAlert = (id: string) => {
    setDismissedAlertIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const getAlertsForPatient = (patientId: string) => {
    return alerts.filter(a => a.patientId === patientId);
  };

  return (
    <CDSSContext.Provider value={{ alerts, dismissAlert, getAlertsForPatient }}>
      {children}
    </CDSSContext.Provider>
  );
}

export function useCDSS() {
  const context = useContext(CDSSContext);
  if (context === undefined) {
    throw new Error('useCDSS must be used within a CDSSProvider');
  }
  return context;
}
