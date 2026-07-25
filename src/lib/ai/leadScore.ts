import type { Intent } from "./intents";

export type LeadScore = "HOT" | "WARM" | "COLD";

const HOT_PATTERNS = [
  /จองเลย|จองทันที|คืนนี้|วันนี้มีห้อง|ขอชำระ|โอนเงิน|จ่ายเงิน/i,
  /book now|tonight|today|pay now|checkout now/i,
];

const HOT_INTENTS: Intent[] = ["booking_request", "direct_booking"];
const WARM_INTENTS: Intent[] = ["booking_intent", "room_price", "promotion", "availability"];

export function scoreLead(text: string, intent: Intent): LeadScore {
  if (HOT_INTENTS.includes(intent)) return "HOT";
  if (HOT_PATTERNS.some((p) => p.test(text))) return "HOT";
  if (WARM_INTENTS.includes(intent)) return "WARM";
  return "COLD";
}
