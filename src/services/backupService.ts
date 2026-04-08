import { db } from '../lib/db';
import { exportDB } from 'dexie-export-import';
import { toast } from 'sonner';

const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_BACKUPS = 5;

export async function checkAndPerformAutoBackup(enabled: boolean = true) {
  if (!enabled) return;
  
  try {
    const lastBackup = await db.backups.orderBy('timestamp').last();
    const now = Date.now();

    if (!lastBackup || (now - lastBackup.timestamp) >= BACKUP_INTERVAL) {
      console.log('Performing auto-backup...');
      
      // Export database
      const blob = await exportDB(db, {
        prettyJson: false
      });
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        await db.backups.add({
          timestamp: now,
          data: base64data,
          size: blob.size
        });

        // Cleanup old backups
        const allBackups = await db.backups.orderBy('timestamp').toArray();
        if (allBackups.length > MAX_BACKUPS) {
          const toDelete = allBackups.slice(0, allBackups.length - MAX_BACKUPS);
          await db.backups.bulkDelete(toDelete.map(b => b.id!));
        }

        console.log('Auto-backup completed successfully.');
        toast.success('Database auto-backup completed.', {
          description: `Backup size: ${(blob.size / 1024).toFixed(2)} KB`,
          duration: 3000
        });
      };
    }
  } catch (error) {
    console.error('Auto-backup failed:', error);
    // Don't show toast for every fail to avoid annoying the user if it's a persistent issue
  }
}

export async function downloadLatestBackup() {
  const lastBackup = await db.backups.orderBy('timestamp').last();
  if (!lastBackup) {
    toast.error('No backups found.');
    return;
  }

  const response = await fetch(lastBackup.data);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `medical_backup_${new Date(lastBackup.timestamp).toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
