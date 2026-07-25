import { describe, expect, it, beforeAll } from "vitest";
import crypto from "crypto";
import { verifyLineSignature } from "@/lib/line/verify";
import { bookingUrlWithUtm, HOTEL } from "@/lib/config";
import { isRateLimited } from "@/lib/rateLimit";

beforeAll(() => {
  process.env.LINE_CHANNEL_SECRET = "test-secret";
});

describe("LINE signature verification", () => {
  // Test case 14: Invalid LINE signature
  it("rejects invalid signature", () => {
    expect(verifyLineSignature('{"events":[]}', "bad-signature")).toBe(false);
    expect(verifyLineSignature('{"events":[]}', null)).toBe(false);
  });

  it("accepts valid signature", () => {
    const body = '{"events":[]}';
    const sig = crypto.createHmac("sha256", "test-secret").update(body).digest("base64");
    expect(verifyLineSignature(body, sig)).toBe(true);
  });
});

describe("direct booking URL integrity", () => {
  it("uses the official URL, never a generated one", () => {
    expect(HOTEL.directBookingUrl).toBe(
      "https://book-directonline.com/properties/royalprincepattaya",
    );
  });

  it("UTM parameters preserve the base URL", () => {
    const url = new URL(bookingUrlWithUtm());
    expect(`${url.origin}${url.pathname}`).toBe(
      "https://book-directonline.com/properties/royalprincepattaya",
    );
    expect(url.searchParams.get("utm_source")).toBe("line");
    expect(url.searchParams.get("utm_medium")).toBe("chatbot");
    expect(url.searchParams.get("utm_campaign")).toBe("direct_booking");
  });
});

describe("rate limiting", () => {
  it("limits after threshold", () => {
    const key = `user-${Date.now()}`;
    for (let i = 0; i < 10; i++) expect(isRateLimited(key, 10, 60_000)).toBe(false);
    expect(isRateLimited(key, 10, 60_000)).toBe(true);
  });
});
