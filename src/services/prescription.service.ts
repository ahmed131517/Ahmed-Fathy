import { db } from '@/lib/db';
import { PrescriptionItem, Prescription } from '@/lib/db';

export const PrescriptionService = {
  /**
   * Saves a new prescription with its items to Dexie.
   */
  async savePrescription(
    patientId: string, 
    diagnosis: string, 
    notes: string, 
    refills: number, 
    items: any[],
    priority: 'normal' | 'high' = 'normal'
  ) {
    const timestamp = Date.now();
    const prescriptionId = crypto.randomUUID();

    await db.prescriptions.add({
      id: prescriptionId,
      patientId,
      diagnosis,
      notes,
      refills,
      status: 'Pending',
      createdAt: timestamp,
      lastModified: timestamp,
      isDeleted: 0,
      isSynced: 0
    });

    for (const item of items) {
      await db.prescription_items.add({
        id: crypto.randomUUID(),
        prescriptionId,
        medicationName: item.medication,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
        form: item.form
      } as any);
    }

    if (priority === 'high') {
      const patient = await db.patients.get(patientId);
      const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
      
      await db.notifications.add({
        id: crypto.randomUUID(),
        title: 'Urgent Prescription Added',
        message: `High-priority prescription for ${patientName} created and pending pharmacy review.`,
        type: 'warning',
        category: 'prescription',
        isRead: 0,
        link: '/pharmacy/orders',
        createdAt: timestamp,
        lastModified: timestamp,
        isDeleted: 0,
        isSynced: 0
      });
    }

    return prescriptionId;
  }
};
