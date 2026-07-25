import { describe, expect, it } from "vitest";

/**
 * Pure filter logic mirrored from src/lib/promotions.ts getActivePromotions.
 * (DB-backed integration tests run against a test database in CI when
 * DATABASE_URL_TEST is provided — see docs/TODO.md.)
 */
interface PromoLike {
  status: string;
  endDate: string | null;
  bookingEnd: string | null;
  roomType: string | null;
  priority: number;
}

function filterActive(promos: PromoLike[], today: string, roomType?: string): PromoLike[] {
  return promos
    .filter((p) => p.status === "active")
    .filter((p) => !(p.endDate && p.endDate < today))
    .filter((p) => !(p.bookingEnd && p.bookingEnd < today))
    .filter(
      (p) => !roomType || !p.roomType || p.roomType === roomType || p.roomType === "all",
    )
    .sort((a, b) => b.priority - a.priority);
}

const promos: PromoLike[] = [
  { status: "active", endDate: "2026-08-08", bookingEnd: "2026-08-08", roomType: "deluxe", priority: 10 },
  { status: "active", endDate: "2026-07-31", bookingEnd: "2026-07-31", roomType: "all", priority: 9 },
  { status: "expired", endDate: "2026-01-01", bookingEnd: null, roomType: "deluxe", priority: 99 },
  { status: "draft", endDate: null, bookingEnd: null, roomType: "deluxe", priority: 5 },
  { status: "active", endDate: "2026-06-01", bookingEnd: null, roomType: "deluxe", priority: 8 },
];

describe("promotion filtering", () => {
  // Test case 11: Expired promotion must never be shown
  it("never returns expired or draft promotions", () => {
    const active = filterActive(promos, "2026-07-25");
    expect(active).toHaveLength(2);
    expect(active.every((p) => p.status === "active")).toBe(true);
  });

  it("filters out past end dates even when status is still active", () => {
    const active = filterActive(promos, "2026-09-01");
    expect(active).toHaveLength(0);
  });

  it("matches room type with 'all' wildcard", () => {
    const active = filterActive(promos, "2026-07-25", "prince_suite_seaview");
    expect(active).toHaveLength(1);
    expect(active[0].roomType).toBe("all");
  });

  it("sorts by priority descending", () => {
    const active = filterActive(promos, "2026-07-25");
    expect(active[0].priority).toBe(10);
  });
});
