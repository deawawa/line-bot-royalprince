export const INTENTS = [
  "hotel_info",
  "room_info",
  "room_price",
  "promotion",
  "availability",
  "booking_intent",
  "booking_request",
  "direct_booking",
  "breakfast",
  "facilities",
  "location",
  "transportation",
  "nearby_attractions",
  "check_in",
  "check_out",
  "full_24_hour_stay",
  "long_stay",
  "group_booking",
  "corporate_booking",
  "special_request",
  "honeymoon",
  "family_trip",
  "human_handoff",
  "complaint",
  "emergency",
  "phone_contact",
  "line_contact",
  "greeting",
  "other",
] as const;

export type Intent = (typeof INTENTS)[number];

const RULES: Array<{ intent: Intent; patterns: RegExp[] }> = [
  {
    intent: "human_handoff",
    patterns: [
      /ขอคุยกับพนักงาน|ขอเจ้าหน้าที่|มีคนตอบไหม|คุยกับคน|ต่อพนักงาน/i,
      /call hotel|talk to (a )?staff|human|real person|agent please/i,
    ],
  },
  {
    intent: "complaint",
    patterns: [/ร้องเรียน|คืนเงิน|ยกเลิกการจอง|เปลี่ยนการจอง|แก้ไขการจอง|ปัญหาการชำระ|ปัญหาการจอง/i, /complain|refund|cancel (my )?booking|change (my )?booking|payment (issue|problem)/i],
  },
  {
    intent: "group_booking",
    patterns: [/จองกรุ๊ป|หมู่คณะ|กรุ๊ปทัวร์|corporate|องค์กร|บริษัทจะจอง/i, /group booking|corporate rate/i],
  },
  {
    intent: "booking_intent",
    patterns: [
      /อยากจอง|ขอจอง|จองเลย|จองห้อง|มีห้องว่าง|คืนนี้มีห้อง|เช็ค?ห้องว่าง|เช็กห้องว่าง/i,
      /book (a )?room|can i book|reserve|availability|any rooms?/i,
    ],
  },
  {
    intent: "room_price",
    patterns: [/ราคา|กี่บาท|เท่าไหร่|เรทห้อง/i, /price|rate|how much|cost/i],
  },
  {
    intent: "promotion",
    patterns: [/โปรโมชั่น|โปรฯ|โปรอะไร|ส่วนลด|แพ็กเกจ|ดีล/i, /promotion|promo|deal|discount|package|offer/i],
  },
  {
    intent: "breakfast",
    patterns: [/อาหารเช้า|บุฟเฟ่?ต์เช้า|กินเช้า|breakfast/i],
  },
  {
    intent: "full_24_hour_stay",
    patterns: [/24 ?ชั่วโมง|พัก ?24|เช็คเอาท์เวลาเดิม/i, /24[- ]?hour/i],
  },
  {
    intent: "check_in",
    patterns: [/เช็คอินกี่โมง|เข้าพักกี่โมง|check[- ]?in time/i],
  },
  {
    intent: "check_out",
    patterns: [/เช็คเอาท์กี่โมง|ออกกี่โมง|check[- ]?out time|late check[- ]?out/i],
  },
  {
    intent: "facilities",
    patterns: [/สระว่ายน้ำ|ฟิตเนส|จากุซซี่|สิ่งอำนวยความสะดวก|ที่จอดรถ|facilit|pool|gym|fitness|jacuzzi|parking/i],
  },
  {
    intent: "nearby_attractions",
    patterns: [/ใกล้เคียง|ที่เที่ยว|หาด|ตลาด|walking street|beach|attraction|nearby|night market/i],
  },
  {
    intent: "transportation",
    patterns: [/เดินทาง|รถรับส่ง|รถกอล์ฟ|แท็กซี่|สนามบิน|transport|shuttle|golf cart|taxi|airport/i],
  },
  {
    intent: "room_info",
    patterns: [/ห้องพัก|ห้องอะไรบ้าง|ประเภทห้อง|ดูห้อง|สวีท|ดีลักซ์/i, /room type|rooms?|suite|deluxe/i],
  },
  {
    intent: "long_stay",
    patterns: [/พักยาว|รายเดือน|long ?stay|monthly/i],
  },
  {
    intent: "phone_contact",
    patterns: [/เบอร์โทร|โทรศัพท์|ติดต่อโรงแรม|contact|phone number/i],
  },
  {
    intent: "greeting",
    patterns: [/^สวัสดี|^หวัดดี|^ดีครับ|^ดีค่ะ|^hello|^hi\b|^hey\b/i],
  },
];

/** Fast rule-based intent detection. Returns "other" when nothing matches. */
export function detectIntent(text: string): Intent {
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(text))) return rule.intent;
  }
  return "other";
}

export function detectLanguage(text: string): "th" | "en" {
  const thai = (text.match(/[฀-๿]/g) ?? []).length;
  const latin = (text.match(/[a-zA-Z]/g) ?? []).length;
  return thai >= latin ? "th" : "en";
}
