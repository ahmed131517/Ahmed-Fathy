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

export async function pushLocalEvents() {
  if (!db.isOpen()) {
    await db.open();
  }
  
  try {
    const pendingEvents = await db.sync_events.toArray();
    if (pendingEvents.length === 0) return;

    // Map to Supabase column names
    const eventsToPush = pendingEvents.map(e => ({
      event_id: e.eventId,
      entity_type: e.entityType,
      entity_id: e.entityId,
      action: e.action,
      payload: e.payload,
      timestamp: new Date(e.timestamp).toISOString(),
      user_id: e.userId
    }));

    // Send to Supabase
    const { error } = await supabase.from('sync_events_log').insert(eventsToPush);

    if (!error) {
      // Clean up local queue after successful transmission
      const pushedIds = pendingEvents.map(e => e.id as number);
      await db.sync_events.bulkDelete(pushedIds);
    } else {
      console.warn("Could not push events to Supabase yet. Is the sync_events_log table created? Error:", error.message);
    }
  } catch (err) {
    console.error("Failed executing pushLocalEvents", err);
  }
}

export async function pushLocalChanges() {
  if (!db.isOpen()) {
    await db.open();
  }
  
  // Call the Delta-Sync event queue processor
  await pushLocalEvents();
}

export async function pullRemoteChanges() {
  if (!db.isOpen()) {
    await db.open();
  }
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
