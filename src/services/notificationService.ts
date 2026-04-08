import { db } from '../lib/db';
import { toast } from 'sonner';

export async function checkAndSendAppointmentReminders(enabled: boolean = true) {
  if (!enabled) return;

  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Find appointments for tomorrow that haven't had a reminder sent
    const appointments = await db.appointments
      .where('date')
      .equals(tomorrowStr)
      .and(app => !app.reminderSent && !app.isDeleted)
      .toArray();

    if (appointments.length === 0) return;

    console.log(`Sending ${appointments.length} appointment reminders...`);

    for (const app of appointments) {
      // In a real app, this is where you'd call an SMS/Email API
      // For this demo, we'll create a system notification and show a toast
      
      const message = `Reminder: Appointment for ${app.patientName} tomorrow at ${app.time}.`;
      
      await db.notifications.add({
        title: 'Appointment Reminder',
        message,
        type: 'info',
        category: 'appointment',
        isRead: 0,
        createdAt: Date.now(),
        lastModified: Date.now(),
        isDeleted: 0,
        isSynced: 0
      });

      // Mark as sent
      await db.appointments.update(app.localId!, { 
        reminderSent: 1,
        lastModified: Date.now()
      });

      toast.info(`Reminder sent for ${app.patientName}`, {
        description: `Scheduled for tomorrow at ${app.time}`
      });
    }
  } catch (error) {
    console.error('Failed to send appointment reminders:', error);
  }
}

export async function sendPushNotification(title: string, body: string) {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification(title, { body });
    }
  }
}
