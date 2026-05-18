import { describe, expect, it } from "vitest";
import { exportCourseHtml, exportCourseJson, exportCourseMarkdown } from "../src/lib/exports";
import { radiationPacket } from "../src/lib/sample-data";

describe("exports", () => {
  it("exports source-backed markdown for LLM reuse", () => {
    const markdown = exportCourseMarkdown(radiationPacket);

    expect(markdown).toContain("# MI 120 Radiation Protection");
    expect(markdown).toContain("## Concepts");
    expect(markdown).toContain("Sources: ALARA note");
  });

  it("exports standalone HTML and JSON", () => {
    const html = exportCourseHtml(radiationPacket);
    const json = exportCourseJson(radiationPacket);

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Study Guide");
    expect(JSON.parse(json).course.id).toBe("mi-120-radiation-protection");
  });
});
