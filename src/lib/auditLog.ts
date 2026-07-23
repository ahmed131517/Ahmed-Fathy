import { db } from "./db";
import { supabase } from "./supabase";

export async function logAudit(action: string, entity: string, entityId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await db.audit_logs.add({
      userId: user?.id || "anonymous",
      action,
      entity,
      entityId,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Audit log failed:", error);
    // Continue execution if audit logging fails to prevent app from crashing
  }
}
