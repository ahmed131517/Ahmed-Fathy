
/**
 * Adapter to map internal Vital records to FHIR R4 Observation (Vital Signs) resources.
 */
export const VitalsFHIRAdapter = {
  toFHIR(vital: any): any {
    const components = [];

    if (vital.bp_systolic && vital.bp_diastolic) {
       components.push({
         code: { coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic blood pressure" }] },
         valueQuantity: { value: vital.bp_systolic, unit: "mmHg" }
       });
       components.push({
         code: { coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic blood pressure" }] },
         valueQuantity: { value: vital.bp_diastolic, unit: "mmHg" }
       });
    }

    if (vital.hr) {
      components.push({
        code: { coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }] },
        valueQuantity: { value: vital.hr, unit: "beats/min" }
      });
    }

    return {
      resourceType: "Observation",
      id: vital.id,
      status: "final",
      category: [
        { coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs" }] }
      ],
      subject: { reference: `Patient/${vital.patient_id}` },
      effectiveDateTime: vital.date,
      component: components
    };
  }
};
