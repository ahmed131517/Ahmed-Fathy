import { db } from "./db";
import { exportDB, importDB } from "dexie-export-import";

export async function backupDatabase() {
  const blob = await exportDB(db);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `medical_records_backup_${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function restoreDatabase(file: File) {
  await importDB(file);
  window.location.reload();
}
