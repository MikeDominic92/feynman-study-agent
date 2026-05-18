import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { rm } from "node:fs/promises";
import { ingestPlainTextSource } from "../src/lib/ingestion";
import {
  getDefaultCoursePacket,
  importSourceIntoCourse,
  resetDatabaseForTests,
} from "../src/lib/storage";

const dbPath = path.join(
  os.tmpdir(),
  `feynman-study-agent-${Date.now()}-${Math.random().toString(36).slice(2)}.sqlite`,
);

describe("SQLite storage", () => {
  afterAll(async () => {
    await rm(dbPath, { force: true }).catch(() => undefined);
  });

  it("seeds the demo packet and persists imported local study artifacts", async () => {
    await resetDatabaseForTests(dbPath);

    const seeded = await getDefaultCoursePacket();
    expect(seeded.course.id).toBe("mi-120-radiation-protection");
    expect(seeded.sources.length).toBeGreaterThan(0);

    const { source, chunks } = ingestPlainTextSource({
      id: "src-storage-test",
      filename: "sanitized-local-note.md",
      text: [
        "# ALARA",
        "ALARA means using only enough radiation to answer the clinical question.",
        "",
        "# Time Distance Shielding",
        "Time, distance, and shielding are practical exposure controls.",
      ].join("\n"),
      addedAt: "2026-05-18T00:00:00.000Z",
    });

    const artifacts = await importSourceIntoCourse({
      source,
      chunks,
      now: "2026-05-18T00:00:00.000Z",
    });
    const updated = await getDefaultCoursePacket();

    expect(artifacts.concepts.map((concept) => concept.title)).toContain("ALARA");
    expect(updated.sources.some((item) => item.id === source.id)).toBe(true);
    expect(updated.chunks.some((item) => item.sourceId === source.id)).toBe(true);
    const alaraConcepts = updated.concepts.filter((item) => item.title === "ALARA");
    expect(alaraConcepts).toHaveLength(1);
    expect(
      alaraConcepts[0].sourceRefs.some((ref) => ref.sourceId === source.id),
    ).toBe(true);
    expect(updated.quizItems.some((item) => item.id.startsWith("quiz-src-storage-test"))).toBe(
      true,
    );
    expect(updated.reviewCards.some((item) => item.id.startsWith("review-src-storage-test"))).toBe(
      true,
    );
  });
});
