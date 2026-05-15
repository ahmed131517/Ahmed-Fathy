import { Patient } from '@/data/patients';

/**
 * Adapter to map internal Patient records to FHIR R4 Patient resources.
 */
export const PatientFHIRAdapter = {
  toFHIR(patient: Patient): any {
    return {
      resourceType: "Patient",
      id: patient.id,
      active: patient.status === 'active',
      name: [
        {
          family: patient.lastName,
          given: [patient.firstName]
        }
      ],
      telecom: patient.phone ? [{ system: "phone", value: patient.phone }] : [],
      gender: patient.gender?.toLowerCase() || 'unknown',
      birthDate: patient.dob,
      // Mapping extensions or other fields can go here
    };
  }
};
