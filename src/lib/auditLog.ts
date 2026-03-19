import { db } from "./db";
import { supabase } from "./supabase";

export async function logAudit(action: string, entity: string, entityId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  await db.audit_logs.add({
    userId: user?.id || "anonymous",
    action,
    entity,
    entityId,
    timestamp: Date.now()
  });
}
