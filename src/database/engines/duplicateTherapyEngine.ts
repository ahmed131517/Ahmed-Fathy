import { findClinicalMedicationByName } from '../medications';

export interface DiscontinuationScheduleStep {
  dayRange: string;
  instruction: string;
}

export interface DiscontinuationSchedule {
  drugToDiscontinue: string;
  drugToKeep: string;
  rationale: string;
  taperRequired: boolean;
  steps: DiscontinuationScheduleStep[];
  monitoringParameters: string[];
}

export interface DuplicateTherapyAlert {
  drugClass: string;
  duplicatingDrugs: string[];
  severity: 'Severe' | 'Major' | 'Moderate';
  clinicalRisk: string;
  recommendation: string;
  discontinuationSchedule?: DiscontinuationSchedule;
}

export function checkDuplicateTherapy(medicationNames: string[]): DuplicateTherapyAlert[] {
  if (!medicationNames || medicationNames.length < 2) return [];

  const alerts: DuplicateTherapyAlert[] = [];
  const classMap = new Map<string, string[]>();

  for (const name of medicationNames) {
    if (!name) continue;
    const med = findClinicalMedicationByName(name);
    const drugClass = med ? med.Drug_Class : inferDrugClassFromName(name);

    if (drugClass && drugClass !== 'Unknown') {
      const existing = classMap.get(drugClass) || [];
      if (!existing.includes(name)) {
        existing.push(name);
      }
      classMap.set(drugClass, existing);
    }
  }

  // Evaluate class map for duplicates
  classMap.forEach((drugs, dClass) => {
    if (drugs.length >= 2) {
      let severity: 'Severe' | 'Major' | 'Moderate' = 'Major';
      let clinicalRisk = `Concurrent use of multiple agents within the ${dClass} class.`;
      let recommendation = `Select a single appropriate ${dClass} agent and discontinue redundant drug to avoid severe adverse toxicity.`;
      
      const lowerClass = dClass.toLowerCase();

      // Determine Preferred Drug (Keep) and Redundant Drug (Discontinue)
      // We will prefer the first drug as drugToKeep, and discontinue the rest.
      const drugToKeep = drugs[0];
      const drugToDiscontinue = drugs[1]; // simplified for duplication of 2

      let schedule: DiscontinuationSchedule = {
        drugToDiscontinue,
        drugToKeep,
        rationale: `To eliminate therapeutic redundancy and reduce additive toxicity.`,
        taperRequired: false,
        steps: [
          {
            dayRange: 'Day 1',
            instruction: `Stop taking ${drugToDiscontinue} immediately.`
          },
          {
            dayRange: 'Day 1 and ongoing',
            instruction: `Continue taking ${drugToKeep} at your prescribed dosage.`
          }
        ],
        monitoringParameters: ['Resolution of symptoms', 'General adverse effects']
      };

      if (lowerClass.includes('nsaid') || lowerClass.includes('anti-inflammatory')) {
        severity = 'Severe';
        clinicalRisk = 'Duplicate NSAID therapy dramatically increases severe Gastrointestinal Ulceration/Bleeding and Acute Kidney Injury risk without additional analgesic efficacy.';
        recommendation = 'Immediately discontinue one NSAID. Combine non-NSAID analgesics (e.g. Paracetamol) if additional pain control is required.';
        
        schedule = {
          drugToDiscontinue,
          drugToKeep,
          rationale: `Immediate cessation of ${drugToDiscontinue} is indicated because dual NSAID therapy doubles renal and gastrointestinal toxicity risks with zero additional pain-relief benefits.`,
          taperRequired: false,
          steps: [
            {
              dayRange: 'Day 1',
              instruction: `Stop taking ${drugToDiscontinue} completely and immediately.`
            },
            {
              dayRange: 'Day 1 and ongoing',
              instruction: `Continue ${drugToKeep} only as needed for inflammation or pain. If additional pain control is required, use non-NSAID analgesics such as Paracetamol (up to 4000 mg/day max).`
            }
          ],
          monitoringParameters: [
            'Blood pressure (monitor for NSAID-induced hypertension)',
            'Renal function (BUN/Serum Creatinine)',
            'Gastrointestinal signs (dark/tarry stools, abdominal pain, heartburn)'
          ]
        };
      } else if (lowerClass.includes('ace inhibitor') || lowerClass.includes('arb') || lowerClass.includes('angiotensin')) {
        severity = 'Severe';
        clinicalRisk = 'Dual RAS blockade (combining multiple ACE inhibitors or ARBs) markedly increases severe Hypotension, Hyperkalemia, and Renal Failure.';
        recommendation = 'Discontinue redundant RAS inhibitor immediately.';

        schedule = {
          drugToDiscontinue,
          drugToKeep,
          rationale: `Concurrent use of multiple renin-angiotensin system (RAS) inhibitors causes profound arterial vasodilation and impairs renal efferent vasoconstriction, predisposing the patient to acute kidney injury.`,
          taperRequired: false,
          steps: [
            {
              dayRange: 'Day 1',
              instruction: `Discontinue ${drugToDiscontinue} immediately. Do not take any further doses.`
            },
            {
              dayRange: 'Day 1 and ongoing',
              instruction: `Continue ${drugToKeep} as the single active RAS inhibitor at your standard prescribed dose.`
            }
          ],
          monitoringParameters: [
            'Serum Potassium (K+) levels within 3 to 5 days',
            'Serum Creatinine and eGFR to verify renal stability',
            'Blood Pressure (lying and standing to check for orthostatic hypotension)'
          ]
        };
      } else if (lowerClass.includes('fluoroquinolone') || lowerClass.includes('quinolone')) {
        severity = 'Major';
        clinicalRisk = 'Duplicate Quinolone antibiotic therapy increases tendonitis, QTc prolongation, and CNS toxicity.';
        recommendation = 'Discontinue duplicate fluoroquinolone agent.';

        schedule = {
          drugToDiscontinue,
          drugToKeep,
          rationale: `Antibiotic duplications do not enhance clinical cure rates but significantly increase antibiotic-associated side effects, QTc interval prolongation, and the development of multidrug-resistant organisms.`,
          taperRequired: false,
          steps: [
            {
              dayRange: 'Day 1',
              instruction: `Stop ${drugToDiscontinue} immediately.`
            },
            {
              dayRange: 'Day 1 to End of Course',
              instruction: `Complete the remaining course of the preferred agent ${drugToKeep} as guided by infectious disease recommendations.`
            }
          ],
          monitoringParameters: [
            'Bowel movements (monitor for watery diarrhea / Clostridioides difficile)',
            'Joint or tendon pain (particularly Achilles tendon tenderness)',
            'Electrocardiogram (ECG) if patient has risk factors for QTc prolongation'
          ]
        };
      } else if (lowerClass.includes('proton pump inhibitor') || lowerClass.includes('ppi')) {
        severity = 'Moderate';
        clinicalRisk = 'Concurrent duplicate PPI therapy increases risk of severe hypomagnesemia, C. difficile infection, and osteoporosis.';
        recommendation = 'Maintain a single PPI agent at optimized morning dosing.';

        schedule = {
          drugToDiscontinue,
          drugToKeep,
          rationale: `Abrupt cessation of duplicate PPI therapy can trigger rebound gastric acid hypersecretion. A gradual step-down taper of the redundant PPI minimizes acid rebound while maintaining symptom control.`,
          taperRequired: true,
          steps: [
            {
              dayRange: 'Days 1-7',
              instruction: `Reduce the dose of ${drugToDiscontinue} by 50% (or take it every other day) while continuing to take ${drugToKeep} every morning 30 minutes before your first meal.`
            },
            {
              dayRange: 'Day 8 and ongoing',
              instruction: `Stop ${drugToDiscontinue} entirely. Continue taking only ${drugToKeep} once daily before breakfast.`
            }
          ],
          monitoringParameters: [
            'Recurrent heartburn, acid reflux, or epigastric pain',
            'Bowel habits (to rule out PPI-associated diarrhea)',
            'Serum magnesium levels during long-term maintenance'
          ]
        };
      } else if (lowerClass.includes('beta blocker') || lowerClass.includes('beta-blocker')) {
        severity = 'Severe';
        clinicalRisk = 'Duplicate beta-blocker therapy causes profound bradycardia, severe hypotension, heart block, and profound lethargy.';
        recommendation = 'Discontinue one beta-blocker using a slow tapering schedule to prevent rebound cardiovascular events.';

        schedule = {
          drugToDiscontinue,
          drugToKeep,
          rationale: `Sudden withdrawal of beta-blockers can trigger reflex sympathetic hyperactivity, causing dangerous rebound tachycardia, severe hypertension, or cardiac ischemia. A structured taper is mandatory.`,
          taperRequired: true,
          steps: [
            {
              dayRange: 'Days 1-5',
              instruction: `Reduce the dosage of ${drugToDiscontinue} by 50%. Continue taking ${drugToKeep} at its current prescribed dose.`
            },
            {
              dayRange: 'Days 6-10',
              instruction: `Reduce the dosage of ${drugToDiscontinue} further to 25% of the original dose (or take the half-dose every other day). Continue ${drugToKeep} regularly.`
            },
            {
              dayRange: 'Day 11 and ongoing',
              instruction: `Discontinue ${drugToDiscontinue} completely. Maintain ${drugToKeep} as your sole beta-blocker therapy.`
            }
          ],
          monitoringParameters: [
            'Daily Resting Heart Rate (target: 55-70 bpm; alert provider if < 50 bpm)',
            'Daily Blood Pressure (BP)',
            'Chest pain, shortness of breath, palpitations, or exercise intolerance'
          ]
        };
      } else if (lowerClass.includes('statin') || lowerClass.includes('lipid')) {
        severity = 'Major';
        clinicalRisk = 'Duplicate statin therapy significantly increases the risk of skeletal muscle toxicity, myotoxicity/myalgias, rhabdomyolysis, and elevation of hepatic transaminases.';
        recommendation = 'Discontinue the less potent statin immediately and maintain the more clinically indicated statin.';

        schedule = {
          drugToDiscontinue,
          drugToKeep,
          rationale: `Simultaneous use of multiple HMG-CoA reductase inhibitors does not produce therapeutic synergy but exponentially increases plasma drug levels, risking muscle fiber breakdown (rhabdomyolysis).`,
          taperRequired: false,
          steps: [
            {
              dayRange: 'Day 1',
              instruction: `Stop taking ${drugToDiscontinue} immediately.`
            },
            {
              dayRange: 'Day 1 and ongoing',
              instruction: `Continue taking the preferred high-efficacy statin ${drugToKeep} once daily, preferably in the evening.`
            }
          ],
          monitoringParameters: [
            'Unexplained muscle pain, tenderness, or weakness (especially if accompanied by fever or dark tea-colored urine)',
            'Hepatic transaminases (ALT/AST) if liver toxicity is suspected'
          ]
        };
      }

      alerts.push({
        drugClass: dClass,
        duplicatingDrugs: drugs,
        severity,
        clinicalRisk,
        recommendation,
        discontinuationSchedule: schedule
      });
    }
  });

  return alerts;
}

function inferDrugClassFromName(name: string): string {
  const lower = name.toLowerCase();
  if (/ibuprofen|diclofenac|naproxen|ketoprofen|meloxicam|celecoxib|voltaren|brufen|cataflam/i.test(lower)) return 'Nonsteroidal Anti-inflammatory Drug (NSAID)';
  if (/enalapril|captopril|lisinopril|ramipril|perindopril|renitec|ezapril/i.test(lower)) return 'ACE Inhibitor';
  if (/losartan|valsartan|candesartan|irbesartan|exforge/i.test(lower)) return 'Angiotensin Receptor Blocker (ARB)';
  if (/ciprofloxacin|levofloxacin|moxifloxacin|ciprobay|ciprofar/i.test(lower)) return 'Fluoroquinolone Antibiotic';
  if (/omeprazole|pantoprazole|esomeprazole|lansoprazole|controloc|gastrazole/i.test(lower)) return 'Proton Pump Inhibitor (PPI)';
  if (/paracetamol|acetaminophen|panadol|cetal|abimol/i.test(lower)) return 'Analgesic & Antipyretic';
  if (/amoxicillin|augmentin|hibiotic|curam|e-mox/i.test(lower)) return 'Penicillin Antibiotic';
  if (/metoprolol|atenolol|carvedilol|propranolol|bisoprolol/i.test(lower)) return 'Beta-Blocker';
  if (/atorvastatin|simvastatin|rosuvastatin|pravastatin|lipitor|ator|lipimax/i.test(lower)) return 'HMG-CoA Reductase Inhibitor (Statin)';
  return 'Unknown';
}
