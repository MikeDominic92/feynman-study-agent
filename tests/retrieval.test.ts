import { describe, expect, it } from "vitest";
import { retrieveSourceContext } from "../src/lib/retrieval";
import { radiationPacket } from "../src/lib/sample-data";
import { createTutorResponse } from "../src/lib/tutor-service";

describe("retrieval and tutor payloads", () => {
  it("retrieves ranked chunks with source references", () => {
    const results = retrieveSourceContext(radiationPacket, "explain air kerma dose");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].ref.locator.length).toBeGreaterThan(0);
    expect(results[0].ref.sourceId).toBeTruthy();
    expect(results[0].score).toBeGreaterThan(0);
  });

  it("builds a deterministic local tutor result when no API key is present", async () => {
    const previous = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const result = await createTutorResponse({
      packet: radiationPacket,
      conceptId: radiationPacket.concepts[0].id,
      explanation: "ALARA means we use less radiation because it lowers risk.",
      now: "2026-05-18T00:00:00.000Z",
    });

    if (previous === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = previous;
    }

    expect(result.usedOpenAI).toBe(false);
    expect(result.contextCount).toBeGreaterThan(0);
    expect(result.turn.content).toContain("Good start");
    expect(result.turn.sourceRefs.length).toBeGreaterThan(0);
  });
});
