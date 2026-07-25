import { db, schema } from "@/db/client";
import { and, desc, eq, lt } from "drizzle-orm";

export type Promotion = typeof schema.promotions.$inferSelect;

/**
 * Only ACTIVE, non-expired promotions are ever shown to customers
 * (MASTER PROMPT §14–15, §25).
 */
export async function getActivePromotions(roomType?: string): Promise<Promotion[]> {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db
    .select()
    .from(schema.promotions)
    .where(eq(schema.promotions.status, "active"))
    .orderBy(desc(schema.promotions.priority));

  return rows.filter((p) => {
    if (p.endDate && p.endDate < today) return false;
    if (p.bookingEnd && p.bookingEnd < today) return false;
    if (roomType && p.roomType && p.roomType !== roomType && p.roomType !== "all") return false;
    return true;
  });
}

/** Daily auto-expiration (MASTER PROMPT §25). Returns number of expired rows. */
export async function expirePromotions(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const expired = await db
    .update(schema.promotions)
    .set({ status: "expired", updatedAt: new Date() })
    .where(and(eq(schema.promotions.status, "active"), lt(schema.promotions.endDate, today)))
    .returning({ id: schema.promotions.id });
  return expired.length;
}
