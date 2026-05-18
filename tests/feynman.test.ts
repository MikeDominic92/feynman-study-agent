import { describe, expect, it } from "vitest";
import { analyzeTeachBack, buildTutorTurn } from "../src/lib/feynman";
import { radiationPacket } from "../src/lib/sample-data";

describe("feynman tutor loop", () => {
  it("scores jargon and filler while preserving source references", () => {
    const concept = radiationPacket.concepts[2];
    const attempt = analyzeTeachBack({
      attemptId: "attempt-test",
      concept,
      explanation:
        "Air kerma is basically dosimetry stuff about optimization and ionization",
      now: "2026-05-18T00:00:00.000Z",
    });

    expect(attempt.fillerFlags).toContain("basically");
    expect(attempt.fillerFlags).toContain("stuff");
    expect(attempt.jargonFlags).toContain("kerma");
    expect(attempt.jargonFlags).toContain("dosimetry");
    expect(attempt.gapNotes.length).toBeGreaterThan(0);
    expect(attempt.sourceRefs).toEqual(concept.sourceRefs);
  });

  it("builds a coaching turn instead of dumping an answer", () => {
    const attempt = radiationPacket.attempts[0];
    const turn = buildTutorTurn(attempt);

    expect(turn.role).toBe("tutor");
    expect(turn.confidence).toBe("source-backed");
    expect(turn.content).toContain(attempt.nextQuestion);
  });
});
