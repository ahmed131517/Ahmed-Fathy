import { db } from "./db";
import { exportDB, importDB } from "dexie-export-import";
import { toast } from "sonner";

export interface BackupMetadata {
  timestamp: number;
  version: number;
  tables: Record<string, number>;
  checksum?: string;
  isEncrypted?: boolean;
}

export interface BackupPreview {
  file: File;
  timestamp: number;
  totalRecords: number;
  tableCounts: Record<string, number>;
  isValid: boolean;
  validationError?: string;
}

// Compute simple SHA-256 fingerprint for data integrity verification
async function computeSHA256(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function backupDatabase() {
  try {
    const timestamp = Date.now();
    const blob = await exportDB(db, {
      prettyJson: true
    });

    const jsonText = await blob.text();
    const checksum = await computeSHA256(jsonText);

    // Calculate table counts
    const tableCounts: Record<string, number> = {};
    const tables = ['patients', 'appointments', 'prescriptions', 'prescription_items', 'pharmacy_inventory', 'pharmacy_batches', 'lab_results', 'diagnoses'];
    
    for (const tableName of tables) {
      if ((db as any)[tableName]) {
        tableCounts[tableName] = await (db as any)[tableName].count();
      }
    }

    const payload = JSON.stringify({
      metadata: {
        timestamp,
        version: 19,
        tables: tableCounts,
        checksum,
        isEncrypted: false
      },
      dbExport: jsonText
    }, null, 2);

    const exportBlob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(exportBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_records_backup_${new Date(timestamp).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Write audit log entry
    await db.audit_logs.add({
      id: crypto.randomUUID(),
      userId: 'system-admin',
      action: 'SYSTEM_BACKUP_EXPORT',
      entity: 'SystemDatabase',
      entityId: `backup-${timestamp}`,
      timestamp
    });

    toast.success("Comprehensive database backup exported successfully!");
  } catch (err) {
    console.error("Backup failed", err);
    toast.error("Failed to export database backup.");
    throw err;
  }
}

export async function parseAndValidateBackup(file: File): Promise<BackupPreview> {
  const text = await file.text();
  
  try {
    const parsed = JSON.parse(text);
    
    // Check if wrapped format with metadata
    if (parsed.metadata && parsed.dbExport) {
      const calculatedHash = await computeSHA256(parsed.dbExport);
      const isChecksumValid = !parsed.metadata.checksum || parsed.metadata.checksum === calculatedHash;

      const totalRecords = Number(Object.values(parsed.metadata.tables || {}).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0));

      return {
        file,
        timestamp: Number(parsed.metadata.timestamp) || file.lastModified,
        totalRecords,
        tableCounts: (parsed.metadata.tables as Record<string, number>) || {},
        isValid: isChecksumValid,
        validationError: isChecksumValid ? undefined : "Integrity Checksum Mismatch! File may have been altered."
      };
    } else {
      // Standard Dexie export format
      return {
        file,
        timestamp: file.lastModified,
        totalRecords: 0,
        tableCounts: { raw_dexie_export: 1 },
        isValid: true
      };
    }
  } catch (e) {
    return {
      file,
      timestamp: file.lastModified,
      totalRecords: 0,
      tableCounts: {},
      isValid: false,
      validationError: "Invalid JSON format or corrupted backup file."
    };
  }
}

export async function restoreDatabase(file: File) {
  try {
    const text = await file.text();
    let importFile = file;

    try {
      const parsed = JSON.parse(text);
      if (parsed.metadata && parsed.dbExport) {
        const innerBlob = new Blob([parsed.dbExport], { type: 'application/json' });
        importFile = new File([innerBlob], file.name, { type: 'application/json' });
      }
    } catch {
      // Direct Dexie JSON file
    }

    await importDB(importFile);

    // Write audit log entry
    const timestamp = Date.now();
    await db.audit_logs.add({
      id: crypto.randomUUID(),
      userId: 'system-admin',
      action: 'SYSTEM_RESTORE_EXECUTED',
      entity: 'SystemDatabase',
      entityId: `restore-${timestamp}`,
      timestamp
    });

    toast.success("Database restored successfully! Reloading system...");
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  } catch (err) {
    console.error("Restore failed", err);
    toast.error("Failed to restore database from backup.");
    throw err;
  }
}

