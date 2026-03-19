import { supabase } from './supabase';
import { db, type Notification } from './db';

const SYNC_INTERVAL = 30000; // 30 seconds

async function addNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error', category: Notification['category']) {
  const now = Date.now();
  await db.notifications.add({
    title,
    message,
    type,
    category,
    isRead: 0,
    createdAt: now,
    lastModified: now,
    isDeleted: 0,
    isSynced: 0
  });
}

export async function pushLocalChanges() {
  const patientsToSync = await db.patients.where('isSynced').equals(0).toArray();
  const appointmentsToSync = await db.appointments.where('isSynced').equals(0).toArray();
  const prescriptionsToSync = await db.prescriptions.where('isSynced').equals(0).toArray();
  const diagnosesToSync = await db.diagnoses.where('isSynced').equals(0).toArray();
  const labResultsToSync = await db.lab_results.where('isSynced').equals(0).toArray();
  const vitalsToSync = await db.vitals.where('isSynced').equals(0).toArray();

  if (patientsToSync.length > 0) {
    for (const patient of patientsToSync) {
      const { data, error } = await supabase
        .from('patients')
        .upsert({
          id: patient.id,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          blood_type: patient.bloodType,
          last_visit: patient.lastVisit,
          status: patient.status,
          last_modified: patient.lastModified,
          is_deleted: patient.isDeleted === 1
        })
        .select();

      if (!error && data) {
        await db.patients.update(patient.localId!, { isSynced: 1, id: data[0].id });
      }
    }
  }

  if (appointmentsToSync.length > 0) {
    for (const appointment of appointmentsToSync) {
      const { data, error } = await supabase
        .from('appointments')
        .upsert({
          id: appointment.id,
          patient_id: appointment.patientId,
          patient_name: appointment.patientName,
          date: appointment.date,
          time: appointment.time,
          type: appointment.type,
          status: appointment.status,
          doctor: appointment.doctor,
          last_modified: appointment.lastModified,
          is_deleted: appointment.isDeleted === 1
        })
        .select();

      if (!error && data) {
        await db.appointments.update(appointment.localId!, { isSynced: 1, id: data[0].id });
      }
    }
  }

  if (prescriptionsToSync.length > 0) {
    for (const rx of prescriptionsToSync) {
      const { data, error } = await supabase
        .from('prescriptions')
        .upsert({
          id: rx.id,
          patient_id: rx.patientId,
          doctor_id: rx.doctorId,
          diagnosis: rx.diagnosis,
          notes: rx.notes,
          refills: rx.refills,
          status: rx.status,
          last_modified: rx.lastModified,
          is_deleted: rx.isDeleted === 1
        })
        .select();

      if (!error && data) {
        const remoteRxId = data[0].id;
        await db.prescriptions.update(rx.localId!, { isSynced: 1, id: remoteRxId });

        const items = await db.prescription_items.where('prescriptionId').equals(rx.id || rx.localId!.toString()).toArray();
        for (const item of items) {
          await supabase.from('prescription_items').upsert({
            id: item.id,
            prescription_id: remoteRxId,
            drug_id: item.drugId,
            medication_name: item.medicationName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions,
            form: item.form
          });
        }
      }
    }
  }

  if (diagnosesToSync.length > 0) {
    for (const diag of diagnosesToSync) {
      const { data, error } = await supabase
        .from('diagnoses')
        .upsert({
          id: diag.id,
          patient_id: diag.patientId,
          appointment_id: diag.appointmentId,
          condition: diag.condition,
          notes: diag.notes,
          date: diag.date,
          last_modified: diag.lastModified,
          is_deleted: diag.isDeleted === 1
        })
        .select();

      if (!error && data) {
        await db.diagnoses.update(diag.localId!, { isSynced: 1, id: data[0].id });
      }
    }
  }

  if (labResultsToSync.length > 0) {
    for (const lab of labResultsToSync) {
      const { data, error } = await supabase
        .from('lab_results')
        .upsert({
          id: lab.id,
          patient_id: lab.patientId,
          appointment_id: lab.appointmentId,
          test_name: lab.testName,
          value: lab.value,
          unit: lab.unit,
          reference_range: lab.referenceRange,
          status: lab.status,
          date: lab.date,
          last_modified: lab.lastModified,
          is_deleted: lab.isDeleted === 1
        })
        .select();

      if (!error && data) {
        await db.lab_results.update(lab.localId!, { isSynced: 1, id: data[0].id });
      }
    }
  }

  if (vitalsToSync.length > 0) {
    for (const v of vitalsToSync) {
      const { data, error } = await supabase
        .from('vitals')
        .upsert({
          id: v.id,
          patient_id: v.patientId,
          appointment_id: v.appointmentId,
          bp_systolic: v.bp_systolic,
          bp_diastolic: v.bp_diastolic,
          hr: v.hr,
          temp: v.temp,
          rr: v.rr,
          spo2: v.spo2,
          oxygen_type: v.oxygenType,
          oxygen_dose: v.oxygenDose,
          oxygen_invasive: v.oxygenInvasive,
          oxygen_device_type: v.oxygenDeviceType,
          fio2: v.fio2,
          peep: v.peep,
          pressure_support: v.pressureSupport,
          flow_rate: v.flowRate,
          notes: v.notes,
          date: v.date,
          last_modified: v.lastModified,
          is_deleted: v.isDeleted === 1
        })
        .select();

      if (!error && data) {
        await db.vitals.update(v.localId!, { isSynced: 1, id: data[0].id });
      }
    }
  }
}

export async function pullRemoteChanges() {
  const lastLocalPatient = await db.patients.orderBy('lastModified').last();
  const lastLocalAppointment = await db.appointments.orderBy('lastModified').last();
  const lastLocalPrescription = await db.prescriptions.orderBy('lastModified').last();
  const lastLocalDiagnosis = await db.diagnoses.orderBy('lastModified').last();
  const lastLocalLabResult = await db.lab_results.orderBy('lastModified').last();
  const lastLocalVitals = await db.vitals.orderBy('lastModified').last();

  const lastPatientPull = lastLocalPatient?.lastModified || 0;
  const lastAppointmentPull = lastLocalAppointment?.lastModified || 0;
  const lastPrescriptionPull = lastLocalPrescription?.lastModified || 0;
  const lastDiagnosisPull = lastLocalDiagnosis?.lastModified || 0;
  const lastLabResultPull = lastLocalLabResult?.lastModified || 0;
  const lastVitalsPull = lastLocalVitals?.lastModified || 0;

  const { data: remotePatients, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .gt('last_modified', lastPatientPull);

  if (!patientError && remotePatients) {
    for (const remote of remotePatients) {
      const local = await db.patients.where('id').equals(remote.id).first();
      if (!local || remote.last_modified > local.lastModified) {
        await db.patients.put({
          id: remote.id,
          name: remote.name,
          age: remote.age,
          gender: remote.gender,
          bloodType: remote.blood_type,
          lastVisit: remote.last_visit,
          status: remote.status,
          lastModified: remote.last_modified,
          isDeleted: remote.is_deleted ? 1 : 0,
          isSynced: 1
        });
      }
    }
  }

  const { data: remoteAppointments, error: appointmentError } = await supabase
    .from('appointments')
    .select('*')
    .gt('last_modified', lastAppointmentPull);

  if (!appointmentError && remoteAppointments) {
    for (const remote of remoteAppointments) {
      const local = await db.appointments.where('id').equals(remote.id).first();
      if (!local || remote.last_modified > local.lastModified) {
        await db.appointments.put({
          id: remote.id,
          patientId: remote.patient_id,
          patientName: remote.patient_name,
          date: remote.date,
          time: remote.time,
          type: remote.type,
          status: remote.status,
          doctor: remote.doctor,
          lastModified: remote.last_modified,
          isDeleted: remote.is_deleted ? 1 : 0,
          isSynced: 1
        });
      }
    }
  }

  const { data: remotePrescriptions, error: rxError } = await supabase
    .from('prescriptions')
    .select('*')
    .gt('last_modified', lastPrescriptionPull);

  if (!rxError && remotePrescriptions) {
    for (const remote of remotePrescriptions) {
      const local = await db.prescriptions.where('id').equals(remote.id).first();
      if (!local || remote.last_modified > local.lastModified) {
        await db.prescriptions.put({
          id: remote.id,
          patientId: remote.patient_id,
          doctorId: remote.doctor_id,
          diagnosis: remote.diagnosis,
          notes: remote.notes,
          refills: remote.refills,
          status: remote.status,
          createdAt: new Date(remote.created_at).getTime(),
          lastModified: remote.last_modified,
          isDeleted: remote.is_deleted ? 1 : 0,
          isSynced: 1
        });

        const { data: remoteItems } = await supabase
          .from('prescription_items')
          .select('*')
          .eq('prescription_id', remote.id);

        if (remoteItems) {
          for (const item of remoteItems) {
            await db.prescription_items.put({
              id: item.id,
              prescriptionId: remote.id,
              drugId: item.drug_id,
              medicationName: item.medication_name,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              instructions: item.instructions,
              form: item.form
            });
          }
        }
      }
    }
  }

  const { data: remoteDiagnoses, error: diagError } = await supabase
    .from('diagnoses')
    .select('*')
    .gt('last_modified', lastDiagnosisPull);

  if (!diagError && remoteDiagnoses) {
    for (const remote of remoteDiagnoses) {
      const local = await db.diagnoses.where('id').equals(remote.id).first();
      if (!local || remote.last_modified > local.lastModified) {
        await db.diagnoses.put({
          id: remote.id,
          patientId: remote.patient_id,
          appointmentId: remote.appointment_id,
          condition: remote.condition,
          notes: remote.notes,
          date: remote.date,
          lastModified: remote.last_modified,
          isDeleted: remote.is_deleted ? 1 : 0,
          isSynced: 1
        });
      }
    }
  }

  const { data: remoteLabResults, error: labError } = await supabase
    .from('lab_results')
    .select('*')
    .gt('last_modified', lastLabResultPull);

  if (!labError && remoteLabResults) {
    for (const remote of remoteLabResults) {
      const local = await db.lab_results.where('id').equals(remote.id).first();
      if (!local || remote.last_modified > local.lastModified) {
        await db.lab_results.put({
          id: remote.id,
          patientId: remote.patient_id,
          appointmentId: remote.appointment_id,
          testName: remote.test_name,
          value: remote.value,
          unit: remote.unit,
          referenceRange: remote.reference_range,
          status: remote.status as any,
          date: remote.date,
          lastModified: remote.last_modified,
          isDeleted: remote.is_deleted ? 1 : 0,
          isSynced: 1
        });
        
        if (remote.status === 'completed') {
          await addNotification('Lab Result Completed', `Lab result for ${remote.test_name} is ready.`, 'success', 'lab');
        }
      }
    }
  }

  const { data: remoteVitals, error: vitalsError } = await supabase
    .from('vitals')
    .select('*')
    .gt('last_modified', lastVitalsPull);

  if (!vitalsError && remoteVitals) {
    for (const remote of remoteVitals) {
      const local = await db.vitals.where('id').equals(remote.id).first();
      if (!local || remote.last_modified > local.lastModified) {
        await db.vitals.put({
          id: remote.id,
          patientId: remote.patient_id,
          appointmentId: remote.appointment_id,
          bp_systolic: remote.bp_systolic,
          bp_diastolic: remote.bp_diastolic,
          hr: remote.hr,
          temp: remote.temp,
          rr: remote.rr,
          spo2: remote.spo2,
          oxygenType: remote.oxygen_type,
          oxygenDose: remote.oxygen_dose,
          oxygenInvasive: remote.oxygen_invasive,
          oxygenDeviceType: remote.oxygen_device_type,
          fio2: remote.fio2,
          peep: remote.peep,
          pressureSupport: remote.pressure_support,
          flowRate: remote.flow_rate,
          notes: remote.notes,
          date: remote.date,
          lastModified: remote.last_modified,
          isDeleted: remote.is_deleted ? 1 : 0,
          isSynced: 1
        });
      }
    }
  }
}

export async function syncAll() {
  try {
    await pushLocalChanges();
    await pullRemoteChanges();
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

export function startRealtimeSync() {
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lab_results' },
      (payload) => {
        console.log('Lab result change:', payload);
        syncAll();
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
}

export function startSyncEngine() {
  const interval = setInterval(syncAll, SYNC_INTERVAL);
  syncAll(); // Initial sync
  const unsubscribeRealtime = startRealtimeSync();
  return () => {
    clearInterval(interval);
    unsubscribeRealtime();
  };
}
