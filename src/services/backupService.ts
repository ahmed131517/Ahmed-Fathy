import { db } from '../lib/db';
import { exportDB } from 'dexie-export-import';
import { toast } from 'sonner';
import { encryptData, getOrGenerateMasterKey } from '../lib/crypto';

const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_BACKUPS = 2;

export async function checkAndPerformAutoBackup(enabled: boolean = true) {
  if (!enabled) return;
  
  try {
    if (!db.isOpen()) {
      await db.open();
    }
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
        try {
          const base64data = reader.result as string;
          
          // E2EE Encryption for the physical backup
          const masterKey = await getOrGenerateMasterKey();
          const encryptedPayload = await encryptData(base64data, masterKey);
          
          await db.backups.add({
            timestamp: now,
            data: encryptedPayload,
            size: blob.size,
            isEncrypted: 1
          } as any);

          // Cleanup old backups
          const allBackups = await db.backups.orderBy('timestamp').toArray();
          if (allBackups.length > MAX_BACKUPS) {
            const toDelete = allBackups.slice(0, allBackups.length - MAX_BACKUPS);
            await db.backups.bulkDelete(toDelete.map(b => b.id!));
          }

          console.log('Auto-backup completed successfully.');
          toast.success('Database auto-backup completed locally.', {
            description: `We recommend saving a copy to your computer. Backup size: ${(blob.size / 1024).toFixed(2)} KB`,
            duration: 10000,
            action: {
              label: 'Download Backup',
              onClick: () => downloadLatestBackup()
            }
          });
        } catch (error) {
          if (error instanceof Error && error.name === 'QuotaExceededError') {
            console.warn('Quota exceeded during auto-backup. Attempting to clear old backups...');
            // Delete all but the latest backup if we hit quota
            const allBackups = await db.backups.orderBy('timestamp').toArray();
            if (allBackups.length > 0) {
              await db.backups.clear();
              // Try one more time with just this backup
              try {
                const base64data = reader.result as string;
                
                const masterKey = await getOrGenerateMasterKey();
                const encryptedPayload = await encryptData(base64data, masterKey);
                
                await db.backups.add({
                  timestamp: now,
                  data: encryptedPayload,
                  size: blob.size,
                  isEncrypted: 1
                } as any);
                console.log('Auto-backup recovered after clearing space.');
              } catch (retryError) {
                console.error('Auto-backup failed even after clearing space:', retryError);
              }
            }
          } else {
            console.error('Auto-backup failed during save:', error);
          }
        }
      };
    }
  } catch (error) {
    console.error('Auto-backup failed:', error);
  }
}

export async function downloadLatestBackup() {
  const lastBackup = await db.backups.orderBy('timestamp').last();
  if (!lastBackup) {
    toast.error('No backups found.');
    return;
  }

  // Create a JSON object referencing the backup wrapped with metadata
  const exportPayload = JSON.stringify({
    timestamp: lastBackup.timestamp,
    isEncrypted: (lastBackup as any).isEncrypted === 1,
    data: lastBackup.data
  });

  const blob = new Blob([exportPayload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `encrypted_emr_backup_${new Date(lastBackup.timestamp).toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
