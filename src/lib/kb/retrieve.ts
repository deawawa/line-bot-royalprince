import { db, schema } from "@/db/client";
import { and, desc, eq, or, ilike, sql } from "drizzle-orm";
import type { Intent } from "@/lib/ai/intents";

const INTENT_CATEGORIES: Partial<Record<Intent, string[]>> = {
  hotel_info: ["Hotel Information", "FAQ", "Contact"],
  room_info: ["Rooms"],
  room_price: ["Rooms", "Promotions"],
  breakfast: ["Breakfast"],
  facilities: ["Facilities"],
  location: ["Hotel Information", "Transportation", "Nearby Attractions"],
  transportation: ["Transportation"],
  nearby_attractions: ["Nearby Attractions"],
  check_in: ["Check-in", "Policies"],
  check_out: ["Check-out", "Policies"],
  full_24_hour_stay: ["Full 24-Hour Stay", "Policies"],
  long_stay: ["Long Stay"],
  group_booking: ["Group Booking", "Corporate"],
  corporate_booking: ["Corporate"],
  booking_intent: ["Booking", "Rooms", "Promotions"],
  promotion: ["Promotions"],
  phone_contact: ["Contact"],
  line_contact: ["Contact"],
};

export interface KbEntry {
  title: string;
  content: string;
  category: string;
}

/**
 * Retrieval layer for the AI engine.
 * Simple + deterministic: category routing by intent, plus keyword match.
 * Designed so a vector-search implementation can replace this function
 * without touching the AI business logic (same signature).
 */
export async function retrieveKnowledge(
  message: string,
  intent: Intent,
  limit = 6,
): Promise<KbEntry[]> {
  const categories = INTENT_CATEGORIES[intent];

  const keywords = message
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 5);

  const conditions = [eq(schema.knowledgeBase.status, "published")];

  const rows = await db
    .select({
      title: schema.knowledgeBase.title,
      content: schema.knowledgeBase.content,
      category: schema.knowledgeBase.category,
    })
    .from(schema.knowledgeBase)
    .where(
      and(
        ...conditions,
        categories || keywords.length
          ? or(
              ...(categories ?? []).map((c) => eq(schema.knowledgeBase.category, c)),
              ...keywords.map((k) => ilike(schema.knowledgeBase.content, `%${k}%`)),
              ...keywords.map((k) => ilike(schema.knowledgeBase.title, `%${k}%`)),
            )
          : sql`true`,
      ),
    )
    .orderBy(desc(schema.knowledgeBase.priority))
    .limit(limit);

  return rows;
}
