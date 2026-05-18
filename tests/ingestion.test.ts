import { describe, expect, it } from "vitest";
import {
  detectSourceKind,
  extractConceptSeeds,
  ingestPlainTextSource,
  isSafePublicFixtureName,
} from "../src/lib/ingestion";

describe("ingestion", () => {
  it("chunks sanitized markdown and extracts radiation concepts", () => {
    const result = ingestPlainTextSource({
      id: "src-demo",
      filename: "radiation-demo.md",
      text: [
        "# ALARA",
        "ALARA means using the lowest reasonable exposure.",
        "",
        "# Air Kerma",
        "Air kerma describes energy transferred to air.",
      ].join("\n"),
      addedAt: "2026-05-18T00:00:00.000Z",
    });

    expect(result.source.kind).toBe("markdown");
    expect(result.chunks).toHaveLength(2);
    expect(result.source.chunkIds).toEqual(["src-demo-chunk-1", "src-demo-chunk-2"]);
    expect(extractConceptSeeds(result.chunks)).toEqual(["air kerma", "alara"]);
  });

  it("detects import kinds and rejects unsafe public fixture names", () => {
    expect(detectSourceKind("lecture.pptx")).toBe("pptx");
    expect(detectSourceKind("notes.txt")).toBe("text");
    expect(detectSourceKind("audio.mp3")).toBe("unsupported");
    expect(isSafePublicFixtureName("sanitized-radiation-packet.md")).toBe(true);
    expect(isSafePublicFixtureName("student-copy-downloads.md")).toBe(false);
  });
});
