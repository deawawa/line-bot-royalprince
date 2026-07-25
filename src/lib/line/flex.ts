import { HOTEL, bookingUrlWithUtm, DEFAULT_BOOKING_CTA_TH } from "@/lib/config";
import type { LineMessage } from "./client";
import { standardQuickReply } from "./quickReply";

type FlexBox = Record<string, unknown>;

function ctaButton(label = "🔗 ตรวจสอบห้องว่างและจองตรง", utmContent = "ai_chatbot"): FlexBox {
  return {
    type: "button",
    style: "primary",
    color: "#1F4E78",
    action: { type: "uri", label, uri: bookingUrlWithUtm(utmContent) },
  };
}

/** Booking CTA card (MASTER PROMPT §50) */
export function bookingCtaFlex(): LineMessage {
  return {
    type: "flex",
    altText: DEFAULT_BOOKING_CTA_TH,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "text",
            text: HOTEL.name,
            weight: "bold",
            size: "md",
            color: "#1F4E78",
          },
          { type: "text", text: DEFAULT_BOOKING_CTA_TH, wrap: true, size: "sm" },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [ctaButton()],
      },
    },
    quickReply: standardQuickReply(),
  };
}

export function promotionCardFlex(promo: {
  name: string;
  roomType?: string | null;
  rate?: string | null;
  stayStart?: string | null;
  stayEnd?: string | null;
  bookingEnd?: string | null;
  terms?: string | null;
}): LineMessage {
  const rows: FlexBox[] = [
    { type: "text", text: promo.name, weight: "bold", size: "md", wrap: true, color: "#1F4E78" },
  ];
  if (promo.roomType)
    rows.push({ type: "text", text: `ห้อง: ${promo.roomType}`, size: "sm", wrap: true });
  if (promo.rate)
    rows.push({
      type: "text",
      text: `ราคา: ${promo.rate}`,
      size: "sm",
      weight: "bold",
      color: "#C9A227",
      wrap: true,
    });
  if (promo.stayStart || promo.stayEnd)
    rows.push({
      type: "text",
      text: `เข้าพัก: ${promo.stayStart ?? ""} – ${promo.stayEnd ?? ""}`,
      size: "xs",
      wrap: true,
    });
  if (promo.bookingEnd)
    rows.push({ type: "text", text: `จองภายใน: ${promo.bookingEnd}`, size: "xs", wrap: true });
  if (promo.terms)
    rows.push({ type: "text", text: promo.terms, size: "xs", color: "#888888", wrap: true });

  return {
    type: "flex",
    altText: `โปรโมชั่น: ${promo.name}`,
    contents: {
      type: "bubble",
      body: { type: "box", layout: "vertical", spacing: "sm", contents: rows },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [ctaButton("ตรวจสอบห้องว่าง", "promotion_card")],
      },
    },
    quickReply: standardQuickReply(),
  };
}

export function contactCardFlex(): LineMessage {
  return {
    type: "flex",
    altText: `ติดต่อ ${HOTEL.name}`,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          { type: "text", text: HOTEL.name, weight: "bold", color: "#1F4E78" },
          { type: "text", text: `☎️ ${HOTEL.phonePrimary}`, size: "sm" },
          { type: "text", text: `☎️ ${HOTEL.phoneSecondary}`, size: "sm" },
          { type: "text", text: `💬 LINE OA: ${HOTEL.lineOa}`, size: "sm" },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "secondary",
            action: { type: "uri", label: "โทรหาโรงแรม", uri: "tel:+6638251051" },
          },
          ctaButton("🔗 จองตรงกับโรงแรม", "contact_card"),
        ],
      },
    },
    quickReply: standardQuickReply(),
  };
}
