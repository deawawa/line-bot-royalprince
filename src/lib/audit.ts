import { db, schema } from "@/db/client";

export async function logAudit(params: {
  adminUser: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
}): Promise<void> {
  try {
    await db.insert(schema.auditLogs).values({
      adminUser: params.adminUser,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      before: params.before as object | undefined,
      after: params.after as object | undefined,
    });
  } catch (err) {
    console.error("audit log failed", err);
  }
}
