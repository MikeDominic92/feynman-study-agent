import { describe, expect, it } from "vitest";
import { radiationPacket } from "../src/lib/sample-data";
import { isDue, scheduleReview } from "../src/lib/review";

describe("review scheduling", () => {
  it("keeps again cards due immediately and advances easy cards", () => {
    const card = radiationPacket.reviewCards[0];
    const now = new Date("2026-05-18T12:00:00.000Z");

    expect(isDue(card, now)).toBe(false);

    const again = scheduleReview(card, "again", now);
    const easy = scheduleReview(card, "easy", now);

    expect(again.intervalDays).toBe(0);
    expect(easy.intervalDays).toBeGreaterThan(card.intervalDays);
  });
});
