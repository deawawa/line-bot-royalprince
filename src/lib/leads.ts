import { db, schema } from "@/db/client";
import { desc, eq } from "drizzle-orm";
import type { LeadScore } from "@/lib/ai/leadScore";

const SCORE_RANK: Record<LeadScore, number> = { COLD: 0, WARM: 1, HOT: 2 };

export interface LeadUpdate {
  displayName?: string;
  language?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  roomType?: string;
  rooms?: number;
  specialRequest?: string;
  intent?: string;
  leadScore?: LeadScore;
  promotion?: string;
  bookingLinkClicked?: boolean;
  humanHandoff?: boolean;
}

/** Upserts a lead per LINE user. Lead score only ever escalates (COLD→WARM→HOT). */
export async function upsertLead(lineUserId: string, update: LeadUpdate) {
  const existing = await db
    .select()
    .from(schema.leads)
    .where(eq(schema.leads.lineUserId, lineUserId))
    .orderBy(desc(schema.leads.createdAt))
    .limit(1);

  if (existing.length === 0) {
    const [row] = await db
      .insert(schema.leads)
      .values({ lineUserId, ...update, leadScore: update.leadScore ?? "COLD" })
      .returning();
    return row;
  }

  const current = existing[0];
  const newScore =
    update.leadScore &&
    SCORE_RANK[update.leadScore] > SCORE_RANK[current.leadScore as LeadScore]
      ? update.leadScore
      : (current.leadScore as LeadScore);

  const [row] = await db
    .update(schema.leads)
    .set({ ...update, leadScore: newScore, updatedAt: new Date() })
    .where(eq(schema.leads.id, current.id))
    .returning();
  return row;
}
