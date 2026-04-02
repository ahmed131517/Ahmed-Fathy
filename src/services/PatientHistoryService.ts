import { db } from "@/lib/db";
import { TimelineEvent } from "@/components/PatientTimeline";

export class PatientHistoryService {
  static async getPatientHistory(patientId: string): Promise<TimelineEvent[]> {
    const events: TimelineEvent[] = [];

    // 1. Fetch Appointments (Encounters)
    const appointments = await db.appointments.where('patientId').equals(patientId).toArray();
    appointments.forEach(a => {
      events.push({
        id: a.id || a.localId?.toString() || '',
        date: a.date,
        type: 'Encounter',
        title: `${a.type} Visit`,
        description: `Patient seen for ${a.type}. Status: ${a.status}`,
        provider: a.doctor,
        status: a.status === 'Completed' ? 'completed' : 'pending',
        details: {
          id: a.id || a.localId?.toString() || '',
          date: a.date,
          type: 'Encounter',
          title: `${a.type} Visit`,
          summary: `Patient seen for ${a.type}. Status: ${a.status}`,
          provider: a.doctor,
          department: "General Practice"
        }
      });
    });

    // 2. Fetch Prescriptions
    const prescriptions = await db.prescriptions.where('patientId').equals(patientId).toArray();
    for (const p of prescriptions) {
      const items = await db.prescription_items.where('prescriptionId').equals(p.id!).toArray();
      const date = new Date(p.createdAt).toISOString().split('T')[0];
      events.push({
        id: p.id || p.localId?.toString() || '',
        date: date,
        type: 'Prescription',
        title: `Prescription: ${items.map(i => i.medicationName).join(', ')}`,
        description: p.notes || "No notes provided.",
        provider: p.doctorId || "Dr. Ahmed Fathy",
        status: 'completed',
        details: {
          id: p.id || p.localId?.toString() || '',
          date: date,
          type: 'Prescription',
          title: `Prescription: ${items.map(i => i.medicationName).join(', ')}`,
          summary: p.notes || "No notes provided.",
          provider: p.doctorId || "Dr. Ahmed Fathy",
          department: "General Practice",
          items: items
        }
      });
    }

    // 3. Fetch Diagnoses
    const diagnoses = await db.diagnoses.where('patientId').equals(patientId).toArray();
    diagnoses.forEach(d => {
      events.push({
        id: d.id || d.localId?.toString() || '',
        date: d.date,
        type: 'Diagnosis',
        title: `Diagnosis: ${d.description || d.condition}`,
        description: d.reasoning || d.notes || "No additional notes.",
        provider: "Dr. Ahmed Fathy",
        status: 'completed',
        details: {
          id: d.id || d.localId?.toString() || '',
          date: d.date,
          type: 'Diagnosis',
          title: `Diagnosis: ${d.description || d.condition}`,
          summary: d.reasoning || d.notes || "No additional notes.",
          provider: "Dr. Ahmed Fathy",
          department: "General Practice",
          code: d.code,
          symptoms: d.symptoms,
          examFindings: d.examFindings,
          labResults: d.labResults
        }
      });
    });

    // 4. Fetch Lab Results
    const labResults = await db.lab_results.where('patientId').equals(patientId).toArray();
    // Group lab results by date and appointmentId
    const groupedLabs = labResults.reduce((acc: any, curr) => {
      const key = `${curr.date}_${curr.appointmentId || 'no_appt'}`;
      if (!acc[key]) {
        acc[key] = {
          id: curr.id || curr.localId?.toString() || '',
          date: curr.date,
          type: 'Lab Result',
          title: 'Laboratory Report',
          summary: 'Comprehensive lab analysis results.',
          description: 'Comprehensive lab analysis results.',
          provider: "Central Lab Services",
          department: "Pathology",
          status: 'normal',
          results: []
        };
      }
      acc[key].results.push({
        test: curr.testName,
        value: curr.value,
        unit: curr.unit,
        range: curr.referenceRange,
        status: curr.status
      });
      if (curr.status === 'abnormal' || curr.status === 'critical') {
        acc[key].status = curr.status;
      }
      return acc;
    }, {});
    
    Object.values(groupedLabs).forEach((labGroup: any) => {
      events.push({
        id: labGroup.id,
        date: labGroup.date,
        type: 'Lab Result',
        title: labGroup.title,
        description: labGroup.description,
        provider: labGroup.provider,
        status: labGroup.status,
        details: {
          id: labGroup.id,
          date: labGroup.date,
          type: 'Lab Result',
          title: labGroup.title,
          summary: labGroup.summary,
          provider: labGroup.provider,
          department: labGroup.department,
          results: labGroup.results
        }
      });
    });

    // 5. Fetch Vitals
    const vitals = await db.vitals.where('patientId').equals(patientId).toArray();
    vitals.forEach(v => {
      events.push({
        id: v.id || v.localId?.toString() || '',
        date: v.date,
        type: 'Vitals',
        title: 'Vitals Recorded',
        description: `BP: ${v.bp_systolic}/${v.bp_diastolic} mmHg, HR: ${v.hr} bpm, Temp: ${v.temp}°C`,
        provider: "Nursing Staff",
        status: 'completed',
        details: v
      });
    });

    // 6. Fetch Physical Exams
    const physicalExams = await db.physical_exams.where('patientId').equals(patientId).toArray();
    physicalExams.forEach(pe => {
      events.push({
        id: pe.id || pe.localId?.toString() || '',
        date: pe.date,
        type: 'Physical Exam',
        title: 'Physical Examination',
        description: `Status: ${pe.status}`,
        provider: "Dr. Ahmed Fathy",
        status: pe.status === 'finalized' ? 'completed' : 'pending',
        details: pe
      });
    });

    // Sort events by date descending
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
