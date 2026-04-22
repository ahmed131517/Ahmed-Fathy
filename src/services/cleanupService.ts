import { db } from '../lib/db';

const MAX_AUDIT_LOGS = 1000;
const MAX_NOTIFICATIONS = 500;
const LOG_RETENTION_DAYS = 30;

export async function performDatabaseCleanup() {
  try {
    if (!db.isOpen()) {
      console.log('Database not open, attempting to open before cleanup...');
      await db.open();
    }
    
    console.log('Starting database cleanup...');
    
    // 1. Cleanup Audit Logs
    const auditCount = await db.audit_logs.count();
    if (auditCount > MAX_AUDIT_LOGS) {
      const toDeleteCount = auditCount - MAX_AUDIT_LOGS;
      const oldestLogs = await db.audit_logs.orderBy('timestamp').limit(toDeleteCount).toArray();
      await db.audit_logs.bulkDelete(oldestLogs.map(l => l.id!));
      console.log(`Deleted ${toDeleteCount} old audit logs.`);
    }

    // 2. Cleanup old notifications (keep only last 500 or those from last 30 days)
    const notificationCount = await db.notifications.count();
    if (notificationCount > MAX_NOTIFICATIONS) {
      const toDeleteCount = notificationCount - MAX_NOTIFICATIONS;
      const oldestNotifications = await db.notifications.orderBy('createdAt').limit(toDeleteCount).toArray();
      await db.notifications.bulkDelete(oldestNotifications.map(n => n.localId!));
      console.log(`Deleted ${toDeleteCount} old notifications.`);
    }

    // 3. Cleanup very old logs by date
    const retentionThreshold = Date.now() - (LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const oldLogs = await db.audit_logs.where('timestamp').below(retentionThreshold).toArray();
    if (oldLogs.length > 0) {
      await db.audit_logs.bulkDelete(oldLogs.map(l => l.id!));
      console.log(`Deleted ${oldLogs.length} audit logs older than ${LOG_RETENTION_DAYS} days.`);
    }

    console.log('Database cleanup completed.');
  } catch (error) {
    console.error('Database cleanup failed:', error);
  }
}

export function startCleanupEngine() {
  // Run cleanup every 12 hours
  const CLEANUP_INTERVAL = 12 * 60 * 60 * 1000;
  const interval = setInterval(performDatabaseCleanup, CLEANUP_INTERVAL);
  
  // Initial cleanup after a short delay to not block startup
  setTimeout(performDatabaseCleanup, 5000);
  
  return () => clearInterval(interval);
}
