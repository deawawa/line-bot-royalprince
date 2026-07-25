import { describe, expect, it } from "vitest";
import { detectIntent, detectLanguage } from "@/lib/ai/intents";
import { scoreLead } from "@/lib/ai/leadScore";

describe("intent detection", () => {
  // Test case 1: User asks room type
  it("detects room_info", () => {
    expect(detectIntent("มีห้องอะไรบ้าง")).toBe("room_info");
    expect(detectIntent("What room types do you have?")).toBe("room_info");
  });

  // Test case 2: User asks price
  it("detects room_price", () => {
    expect(detectIntent("ห้องดีลักซ์ราคาเท่าไหร่")).toBe("room_price");
    expect(detectIntent("How much is the suite?")).toBe("room_price");
  });

  // Test case 3: User asks promotion
  it("detects promotion", () => {
    expect(detectIntent("ตอนนี้มีโปรโมชั่นอะไรบ้าง")).toBe("promotion");
    expect(detectIntent("Any deals or discounts?")).toBe("promotion");
  });

  // Test case 4: User asks availability / Test case 5: wants to book
  it("detects booking_intent", () => {
    expect(detectIntent("คืนนี้มีห้องว่างไหม")).toBe("booking_intent");
    expect(detectIntent("อยากจองห้อง")).toBe("booking_intent");
    expect(detectIntent("Can I book a room?")).toBe("booking_intent");
  });

  // Test case 7: breakfast
  it("detects breakfast", () => {
    expect(detectIntent("อาหารเช้ากี่โมง")).toBe("breakfast");
    expect(detectIntent("What time is breakfast?")).toBe("breakfast");
  });

  // Test case 8: Full 24-Hour Stay
  it("detects full_24_hour_stay", () => {
    expect(detectIntent("พัก 24 ชั่วโมงคืออะไร")).toBe("full_24_hour_stay");
  });

  // Test case 9: phone number
  it("detects phone_contact", () => {
    expect(detectIntent("ขอเบอร์โทรโรงแรมหน่อย")).toBe("phone_contact");
  });

  // Test case 10: requests staff
  it("detects human_handoff", () => {
    expect(detectIntent("ขอคุยกับพนักงานหน่อยครับ")).toBe("human_handoff");
    expect(detectIntent("I want to talk to staff")).toBe("human_handoff");
  });

  it("detects complaint / refund → handoff path", () => {
    expect(detectIntent("ขอคืนเงินการจอง")).toBe("complaint");
    expect(detectIntent("I want to cancel my booking")).toBe("complaint");
  });

  // Test case 12: unknown question
  it("returns other for unknown", () => {
    expect(detectIntent("ขอเพลงหน่อย")).toBe("other");
  });
});

describe("language detection", () => {
  it("detects Thai", () => {
    expect(detectLanguage("สวัสดีครับ")).toBe("th");
  });
  it("detects English", () => {
    expect(detectLanguage("Hello, any rooms tonight?")).toBe("en");
  });
});

describe("lead scoring", () => {
  it("HOT for immediate booking", () => {
    expect(scoreLead("จองเลยคืนนี้", detectIntent("จองเลยคืนนี้"))).toBe("HOT");
  });
  it("WARM for price interest", () => {
    expect(scoreLead("ราคาห้องเท่าไหร่", "room_price")).toBe("WARM");
  });
  it("COLD for general info", () => {
    expect(scoreLead("สระว่ายน้ำเปิดกี่โมง", "facilities")).toBe("COLD");
  });
});
