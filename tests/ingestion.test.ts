import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import {
  detectSourceKind,
  extractConceptSeeds,
  ingestSourceFile,
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

  it("parses sanitized PPTX slide text into source chunks", async () => {
    const bytes = await createPptxBytes([
      "ALARA means keeping exposure as low as reasonable.",
      "Air kerma is energy transferred from the beam to air.",
    ]);

    const result = await ingestSourceFile({
      id: "src-pptx",
      filename: "sanitized-radiation-slides.pptx",
      bytes,
      addedAt: "2026-05-18T00:00:00.000Z",
    });

    expect(result.source.kind).toBe("pptx");
    expect(result.source.privacy).toBe("local-import-only");
    expect(result.chunks).toHaveLength(2);
    expect(result.chunks[0].locator).toBe("sanitized radiation slides, slide 1");
    expect(result.chunks[1].text).toContain("Air kerma");
  });

  it("parses sanitized XLSX rows into source chunks", async () => {
    const bytes = await createXlsxBytes([
      ["Quantity", "Plain meaning"],
      ["Dose area product", "Beam dose times exposed area"],
      ["Effective dose", "Risk estimate using tissue weighting"],
    ]);

    const result = await ingestSourceFile({
      id: "src-xlsx",
      filename: "sanitized-quantity-grid.xlsx",
      bytes,
      addedAt: "2026-05-18T00:00:00.000Z",
    });

    expect(result.source.kind).toBe("xlsx");
    expect(result.chunks).toHaveLength(3);
    expect(result.chunks[1].locator).toBe("sanitized quantity grid, Quantities row 2");
    expect(extractConceptSeeds(result.chunks)).toContain("dose area product");
  });
});

async function createPptxBytes(slides: string[]) {
  const zip = new JSZip();

  slides.forEach((text, index) => {
    zip.file(
      `ppt/slides/slide${index + 1}.xml`,
      `<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
        <p:cSld>
          <p:spTree>
            <p:sp>
              <p:txBody><a:p><a:r><a:t>${escapeXml(text)}</a:t></a:r></a:p></p:txBody>
            </p:sp>
          </p:spTree>
        </p:cSld>
      </p:sld>`,
    );
  });

  return zip.generateAsync({ type: "uint8array" });
}

async function createXlsxBytes(rows: string[][]) {
  const zip = new JSZip();
  const sharedStrings = rows.flat();
  const stringIndex = new Map(sharedStrings.map((value, index) => [value, index]));
  const sheetRows = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, cellIndex) => {
          const column = String.fromCharCode(65 + cellIndex);
          return `<c r="${column}${rowIndex + 1}" t="s"><v>${stringIndex.get(
            value,
          )}</v></c>`;
        })
        .join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");

  zip.file(
    "xl/workbook.xml",
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      <sheets><sheet name="Quantities" sheetId="1" r:id="rId1" /></sheets>
    </workbook>`,
  );
  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Target="worksheets/sheet1.xml" />
    </Relationships>`,
  );
  zip.file(
    "xl/sharedStrings.xml",
    `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
      ${sharedStrings.map((value) => `<si><t>${escapeXml(value)}</t></si>`).join("")}
    </sst>`,
  );
  zip.file(
    "xl/worksheets/sheet1.xml",
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
      <sheetData>${sheetRows}</sheetData>
    </worksheet>`,
  );

  return zip.generateAsync({ type: "uint8array" });
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
