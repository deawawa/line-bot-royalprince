/**
 * Single source of truth for hotel business constants.
 * The Direct Booking URL must NEVER be changed, shortened, or replaced
 * with a generated deep link. See MASTER PROMPT §2.
 */
export const HOTEL = {
  name: "Royal Prince Resort Pattaya",
  category: "4-Star Hotel",
  location: "Pattaya, Chonburi, Thailand",
  totalRooms: 122,
  phonePrimary: "038-251-051",
  phoneSecondary: "080-142-7865",
  lineOa: "@royalprince",
  directBookingUrl: "https://book-directonline.com/properties/royalprincepattaya",
} as const;

export const ROOM_TYPES = ["deluxe", "deluxe_triple", "prince_suite_seaview"] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const ROOM_LABELS: Record<RoomType, { th: string; en: string }> = {
  deluxe: { th: "ห้องดีลักซ์ (Deluxe Room)", en: "Deluxe Room" },
  deluxe_triple: { th: "ห้องดีลักซ์ ทริปเปิล (Deluxe Triple)", en: "Deluxe Triple Room" },
  prince_suite_seaview: {
    th: "ปริ๊นซ์ สวีท ซีวิว (Prince Suite Seaview)",
    en: "Prince Suite Seaview",
  },
};

/** Adds UTM parameters to the official booking URL without altering the base URL. */
export function bookingUrlWithUtm(content = "ai_chatbot"): string {
  const url = new URL(HOTEL.directBookingUrl);
  url.searchParams.set("utm_source", "line");
  url.searchParams.set("utm_medium", "chatbot");
  url.searchParams.set("utm_campaign", "direct_booking");
  url.searchParams.set("utm_content", content);
  return url.toString();
}

export const DEFAULT_BOOKING_CTA_TH =
  "หากต้องการตรวจสอบห้องว่างและราคาล่าสุด สามารถจองตรงกับ Royal Prince Resort Pattaya ได้ที่นี่ค่ะ 😊";

export const DEFAULT_CONTACT_CTA_TH = `หากต้องการให้เจ้าหน้าที่ช่วยตรวจสอบข้อมูลเพิ่มเติม สามารถติดต่อโรงแรมได้ที่
☎️ ${HOTEL.phonePrimary}
☎️ ${HOTEL.phoneSecondary}
💬 LINE OA: ${HOTEL.lineOa}`;

export const ERROR_MESSAGE_TH = `ขออภัยค่ะ ระบบกำลังมีปัญหาชั่วคราว หากต้องการสอบถามหรือจองห้องพัก สามารถติดต่อโรงแรมได้ที่
☎️ ${HOTEL.phonePrimary}
☎️ ${HOTEL.phoneSecondary}`;

export const FIRST_MESSAGE_TH = `สวัสดีค่ะ 😊 ยินดีต้อนรับสู่ Royal Prince Resort Pattaya
วันนี้ให้เราช่วยเรื่องไหนดีคะ?`;
