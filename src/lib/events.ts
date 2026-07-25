import { db, schema } from "@/db/client";

export type EventName =
  | "conversation_started"
  | "message_received"
  | "room_inquiry"
  | "promotion_view"
  | "promotion_clicked"
  | "availability_request"
  | "booking_intent"
  | "booking_link_clicked"
  | "booking_request"
  | "human_handoff"
  | "phone_clicked"
  | "line_clicked"
  | "ai_error";

export async function trackEvent(
  name: EventName,
  lineUserId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await db.insert(schema.events).values({ name, lineUserId, metadata });
  } catch (err) {
    // Analytics must never break the conversation flow.
    console.error("trackEvent failed", err);
  }
}
