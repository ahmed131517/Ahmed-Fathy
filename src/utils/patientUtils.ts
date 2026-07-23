export const getPatientStatusTags = (patient: any, timelineEvents: any[] = []): string[] => {
  if (!patient) return ["Unknown"];
  
  const tags: string[] = [];
  
  // 1. Core patient status from DB
  const primaryStatus = patient.status || "Stable";
  tags.push(primaryStatus);
  
  // 2. See if there are pending follow-ups or encounters
  const hasPendingAppt = timelineEvents.some(
    e => e.type === 'Encounter' && e.status === 'pending'
  );
  if (hasPendingAppt) {
    tags.push("Follow-up Pending");
  }

  // 3. Check for recent abnormal findings that might warrant a "Requires Review" or "Monitor" tag
  const hasRecentAbnormal = timelineEvents.some(e => {
    if (e.type === 'Lab Result') {
      return e.details?.results?.some((r: any) => r.status === 'abnormal' || r.status === 'critical');
    }
    return false;
  });

  if (hasRecentAbnormal && !tags.includes("Requires Review")) {
    tags.push("Requires Review");
  } else if (!hasPendingAppt && !hasRecentAbnormal) {
     // If they are stable and nothing abnormal, maybe routine care
     if (patient.chronicConditions && patient.chronicConditions.length > 0) {
        tags.push("Routine Care");
     }
  }
  
  return tags;
};

export const getStatusTagClass = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes('stable') || t.includes('controlled') || t.includes('normal')) {
    return "px-2 py-1 bg-emerald-100 text-emerald-700 rounded transition-colors duration-200";
  }
  if (t.includes('pending') || t.includes('review') || t.includes('guarded') || t.includes('moderate')) {
    return "px-2 py-1 bg-amber-100 text-amber-700 rounded transition-colors duration-200";
  }
  if (t.includes('critical') || t.includes('uncontrolled') || t.includes('high risk') || t.includes('severe') || t.includes('error')) {
    return "px-2 py-1 bg-rose-100 text-rose-700 rounded transition-colors duration-200";
  }
  return "px-2 py-1 bg-blue-100 text-blue-700 rounded transition-colors duration-200";
};

export const getCriticalFinding = (patient: any, timelineEvents: any[] = []): string => {
  if (!patient) return "No patient selected";
  
  // 1. Look for abnormal labs in the timeline
  const abnormalLabs = timelineEvents
    .filter(e => e.type === 'Lab Result')
    .flatMap(e => e.details?.results || [])
    .filter((r: any) => r.status === 'abnormal' || r.status === 'critical');
    
  if (abnormalLabs.length > 0) {
    const latest = abnormalLabs[0];
    return `${latest.test}: ${latest.value} ${latest.unit || ''} (${latest.status === 'critical' ? 'CRITICAL' : 'Elevated'})`;
  }
  
  // 2. Look for abnormal vitals in the timeline or directly on the patient
  const vitalsToParse = [
    ...(timelineEvents.filter(e => e.type === 'Vitals').map(e => e.details)),
    ...(patient.vitalsHistory || [])
  ];

  const abnormalVitals: string[] = [];
  vitalsToParse.forEach((v: any) => {
    if (v) {
      const sys = v.bp_systolic || (v.bloodPressure ? parseInt(v.bloodPressure.split('/')[0]) : 0);
      const dia = v.bp_diastolic || (v.bloodPressure ? parseInt(v.bloodPressure.split('/')[1]) : 0);
      
      if (sys > 140 || dia > 90) {
        abnormalVitals.push(`BP: ${sys}/${dia} mmHg (Elevated)`);
      } 
      
      const glucose = v.glucose;
      if (glucose && (glucose > 180 || glucose < 70)) {
        abnormalVitals.push(`Glucose: ${glucose} mg/dL (${glucose > 180 ? 'Hyperglycemia' : 'Hypoglycemia'})`);
      } 
      
      const spo2 = v.spo2;
      if (spo2 && spo2 < 95) {
        abnormalVitals.push(`SpO2: ${spo2}% (Low)`);
      }

      const hr = v.heartRate;
      if (hr && (hr > 100 || hr < 60)) {
         abnormalVitals.push(`HR: ${hr} bpm (Abnormal)`);
      }
    }
  });
    
  if (abnormalVitals.length > 0) {
    return abnormalVitals[0];
  }
  
  // 3. Check for specific severe conditions or allergies that are flagged
  if (patient.allergies && patient.allergies.length > 0) {
      const severeAllergy = patient.allergies.find((a: any) => a.severity === 'Severe' || (typeof a === 'string' && a.toLowerCase().includes('severe')));
      if (severeAllergy) {
          return `Severe Allergy: ${severeAllergy.name || severeAllergy}`;
      }
  }

  return "No critical findings reported.";
};
