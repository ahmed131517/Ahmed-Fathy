import { Patient } from '@/data/patients';
import { Symptom } from '@/lib/SymptomContext';
import { Diagnosis } from '@/data/diagnosisMappings';

/**
 * FHIR R4 Standardized Interoperability API
 * Converts application state to HL7 FHIR formatted resources.
 */

export function generateFhirBundle(
  patient: Patient,
  symptoms: (Symptom & { analysisData?: any })[],
  differentialDiagnoses: Diagnosis[],
  practitionerName: string = "Dr. AI Assistant"
) {
  const bundleId = crypto.randomUUID();
  const patientId = patient.id || crypto.randomUUID();
  const timestamp = new Date().toISOString();

  // 1. Map Patient Resource
  const patientResource = {
    resourceType: "Patient",
    id: patientId,
    name: [
      {
        use: "usual",
        text: patient.name,
        family: patient.name.split(' ').pop() || '',
        given: [patient.name.split(' ')[0] || '']
      }
    ],
    gender: patient.gender === "male" ? "male" : patient.gender === "female" ? "female" : "unknown",
    birthDate: new Date(new Date().setFullYear(new Date().getFullYear() - patient.age)).toISOString().split('T')[0], // Approximation from age
    identifier: [
      {
        system: "urn:oid:1.2.36.146.595.217.0.1",
        value: patient.id
      }
    ]
  };

  // 2. Map Symptoms to Observation Resources
  const observationResources = symptoms.map(symptom => {
    return {
      resourceType: "Observation",
      id: crypto.randomUUID(),
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "survey",
              display: "Survey"
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: (symptom as any).snomed_code || "386661006", // fallback code if missing
            display: symptom.label
          }
        ],
        text: symptom.label
      },
      subject: {
        reference: `Patient/${patientId}`,
        display: patient.name
      },
      effectiveDateTime: timestamp,
      valueString: symptom.analysisData ? JSON.stringify(symptom.analysisData) : "Present",
      note: symptom.analysisData?.redFlags ? [
        {
          text: `Red Flags: ${symptom.analysisData.redFlags.join(', ')}`
        }
      ] : undefined
    };
  });

  // 3. Map Differential Diagnoses to Condition Resources (Provisional)
  const conditionResources = differentialDiagnoses.map((diag, index) => {
    return {
      resourceType: "Condition",
      id: crypto.randomUUID(),
      clinicalStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
            code: "active"
          }
        ]
      },
      verificationStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
            code: "provisional",
            display: "Provisional"
          }
        ]
      },
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/condition-category",
              code: "problem-list-item",
              display: "Problem List Item"
            }
          ]
        }
      ],
      code: {
        text: diag.name
      },
      subject: {
        reference: `Patient/${patientId}`,
        display: patient.name
      },
      recordedDate: timestamp,
      note: [
        {
          text: `Differential Diagnosis Rank: ${index + 1}. ${diag.description}`
        }
      ]
    };
  });

  // Construct FHIR Bundle
  const bundle = {
    resourceType: "Bundle",
    id: bundleId,
    type: "collection",
    timestamp: timestamp,
    entry: [
      {
        fullUrl: `urn:uuid:${patientId}`,
        resource: patientResource
      },
      ...observationResources.map(obs => ({
        fullUrl: `urn:uuid:${obs.id}`,
        resource: obs
      })),
      ...conditionResources.map(cond => ({
        fullUrl: `urn:uuid:${cond.id}`,
        resource: cond
      }))
    ]
  };

  return bundle;
}
