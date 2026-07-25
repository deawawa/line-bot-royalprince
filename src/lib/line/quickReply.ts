import type { LineMessage } from "./client";

/** Standard Quick Reply menu (MASTER PROMPT §10 / §52) */
export function standardQuickReply(): Record<string, unknown> {
  const items = [
    { label: "🏨 ห้องพัก", text: "ดูห้องพัก" },
    { label: "💰 โปรโมชั่น", text: "โปรโมชั่น" },
    { label: "📅 เช็กห้องว่าง", text: "เช็กห้องว่าง" },
    { label: "🛎️ จองห้องพัก", text: "จองห้องพัก" },
    { label: "⏰ พัก 24 ชั่วโมง", text: "พัก 24 ชั่วโมง" },
    { label: "🍳 อาหารเช้า", text: "อาหารเช้า" },
    { label: "🏊 สิ่งอำนวยความสะดวก", text: "สิ่งอำนวยความสะดวก" },
    { label: "📍 สถานที่ใกล้เคียง", text: "สถานที่ใกล้เคียง" },
    { label: "☎️ ติดต่อโรงแรม", text: "ติดต่อโรงแรม" },
  ];
  return {
    items: items.map((i) => ({
      type: "action",
      action: { type: "message", label: i.label, text: i.text },
    })),
  };
}

export function textWithQuickReply(text: string): LineMessage {
  return { type: "text", text, quickReply: standardQuickReply() };
}
