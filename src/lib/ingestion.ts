import type { SourceChunk, SourceDocument, SourceKind } from "./types";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

export const supportedImports: Array<{
  kind: SourceKind;
  extensions: string[];
  status: "ready" | "planned";
}> = [
  { kind: "markdown", extensions: [".md", ".markdown"], status: "ready" },
  { kind: "text", extensions: [".txt"], status: "ready" },
  { kind: "pptx", extensions: [".pptx"], status: "ready" },
  { kind: "xlsx", extensions: [".xlsx"], status: "ready" },
  { kind: "pdf", extensions: [".pdf"], status: "planned" },
  { kind: "docx", extensions: [".docx"], status: "planned" },
];

const forbiddenPublicNames = [
  "downloads",
  "student " + "copy",
  "student-copy",
  "book",
  "textbook",
  "screenshot",
  "zen" + "desk",
  "web" + "edi",
];

export function detectSourceKind(filename: string): SourceKind | "unsupported" {
  const lower = filename.toLowerCase();
  const match = supportedImports.find((entry) =>
    entry.extensions.some((extension) => lower.endsWith(extension)),
  );
  return match?.kind ?? "unsupported";
}

export function isSafePublicFixtureName(filename: string) {
  const lower = filename.toLowerCase();
  return !forbiddenPublicNames.some((token) => lower.includes(token));
}

export function normalizeTitle(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function ingestPlainTextSource(input: {
  id: string;
  filename: string;
  text: string;
  addedAt?: string;
}): { source: SourceDocument; chunks: SourceChunk[] } {
  const kind = detectSourceKind(input.filename);

  if (kind === "unsupported" || (kind !== "markdown" && kind !== "text")) {
    throw new Error(`Unsupported plain-text import: ${input.filename}`);
  }

  const paragraphs = input.text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks = paragraphs.map<SourceChunk>((paragraph, index) => {
    const headingMatch = paragraph.match(/^#{1,6}\s+(.+)$/m);
    const heading = headingMatch?.[1]?.trim() ?? `Chunk ${index + 1}`;

    return {
      id: `${input.id}-chunk-${index + 1}`,
      sourceId: input.id,
      heading,
      text: paragraph.replace(/^#{1,6}\s+/, "").trim(),
      order: index + 1,
      locator: `${normalizeTitle(input.filename)}, section ${index + 1}`,
    };
  });

  return {
    source: {
      id: input.id,
      title: normalizeTitle(input.filename),
      kind,
      status: "ready",
      addedAt: input.addedAt ?? new Date().toISOString(),
      summary: summarizeChunks(chunks),
      chunkIds: chunks.map((chunk) => chunk.id),
      privacy: "local-import-only",
    },
    chunks,
  };
}

export async function ingestSourceFile(input: {
  id: string;
  filename: string;
  bytes: Uint8Array | ArrayBuffer | Buffer;
  addedAt?: string;
}): Promise<{ source: SourceDocument; chunks: SourceChunk[] }> {
  const kind = detectSourceKind(input.filename);

  if (kind === "markdown" || kind === "text") {
    return ingestPlainTextSource({
      id: input.id,
      filename: input.filename,
      text: new TextDecoder().decode(toUint8Array(input.bytes)),
      addedAt: input.addedAt,
    });
  }

  if (kind === "pptx") {
    return ingestStructuredSource({
      id: input.id,
      filename: input.filename,
      kind,
      chunks: await parsePptx(input.id, input.filename, input.bytes),
      addedAt: input.addedAt,
    });
  }

  if (kind === "xlsx") {
    return ingestStructuredSource({
      id: input.id,
      filename: input.filename,
      kind,
      chunks: await parseXlsx(input.id, input.filename, input.bytes),
      addedAt: input.addedAt,
    });
  }

  throw new Error(`Unsupported source import: ${input.filename}`);
}

export function createSourceId(filename: string, now = new Date()) {
  return `src-${slugify(normalizeTitle(filename))}-${now.getTime().toString(36)}`;
}

export function summarizeChunks(chunks: SourceChunk[]) {
  if (chunks.length === 0) {
    return "No readable text was found.";
  }

  const headings = chunks
    .slice(0, 4)
    .map((chunk) => chunk.heading)
    .join(", ");

  return `Readable source with ${chunks.length} chunk${
    chunks.length === 1 ? "" : "s"
  }: ${headings}.`;
}

export function extractConceptSeeds(chunks: SourceChunk[]) {
  const terms = new Set<string>();
  const patterns = [
    /\bALARA\b/g,
    /\bair kerma\b/gi,
    /\babsorbed dose\b/gi,
    /\bequivalent dose\b/gi,
    /\beffective dose\b/gi,
    /\bdose area product\b/gi,
    /\btime\b|\bdistance\b|\bshielding\b/gi,
  ];

  for (const chunk of chunks) {
    for (const pattern of patterns) {
      const matches = chunk.text.match(pattern) ?? [];
      for (const match of matches) {
        terms.add(match.toLowerCase());
      }
    }
  }

  return Array.from(terms).sort();
}

async function parsePptx(
  sourceId: string,
  filename: string,
  bytes: Uint8Array | ArrayBuffer | Buffer,
) {
  const zip = await JSZip.loadAsync(bytes);
  const parser = createXmlParser();
  const slideNames = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => numericSuffix(a) - numericSuffix(b));
  const chunks: SourceChunk[] = [];

  for (const slideName of slideNames) {
    const xml = await zip.file(slideName)?.async("text");
    if (!xml) {
      continue;
    }
    const slideNumber = numericSuffix(slideName);
    const text = collectText(parser.parse(xml)).join(" ").replace(/\s+/g, " ").trim();
    if (!text) {
      continue;
    }
    chunks.push({
      id: `${sourceId}-slide-${slideNumber}`,
      sourceId,
      heading: text.split(/[.!?]/)[0].slice(0, 80) || `Slide ${slideNumber}`,
      text,
      order: slideNumber,
      locator: `${normalizeTitle(filename)}, slide ${slideNumber}`,
    });
  }

  return chunks;
}

async function parseXlsx(
  sourceId: string,
  filename: string,
  bytes: Uint8Array | ArrayBuffer | Buffer,
) {
  const zip = await JSZip.loadAsync(bytes);
  const parser = createXmlParser();
  const sharedStrings = await readSharedStrings(zip, parser);
  const sheets = await readWorkbookSheets(zip, parser);
  const chunks: SourceChunk[] = [];
  let order = 1;

  for (const sheet of sheets) {
    const xml = await zip.file(sheet.path)?.async("text");
    if (!xml) {
      continue;
    }
    const parsed = parser.parse(xml);
    const rows = toArray(parsed?.worksheet?.sheetData?.row);

    for (const row of rows) {
      const rowNumber = Number(row?.["@_r"] ?? order);
      const cells = toArray(row?.c)
        .map((cell) => readCellValue(cell, sharedStrings))
        .filter(Boolean);

      if (cells.length === 0) {
        continue;
      }

      const text = cells.join(" | ").replace(/\s+/g, " ").trim();
      chunks.push({
        id: `${sourceId}-${slugify(sheet.name)}-row-${rowNumber}`,
        sourceId,
        heading: cells[0].slice(0, 80) || `${sheet.name} row ${rowNumber}`,
        text,
        order: order++,
        locator: `${normalizeTitle(filename)}, ${sheet.name} row ${rowNumber}`,
      });
    }
  }

  return chunks;
}

function ingestStructuredSource(input: {
  id: string;
  filename: string;
  kind: SourceKind;
  chunks: SourceChunk[];
  addedAt?: string;
}) {
  return {
    source: {
      id: input.id,
      title: normalizeTitle(input.filename),
      kind: input.kind,
      status: input.chunks.length > 0 ? "ready" : "needs-review",
      addedAt: input.addedAt ?? new Date().toISOString(),
      summary: summarizeChunks(input.chunks),
      chunkIds: input.chunks.map((chunk) => chunk.id),
      privacy: "local-import-only",
    } satisfies SourceDocument,
    chunks: input.chunks,
  };
}

async function readSharedStrings(zip: JSZip, parser: XMLParser) {
  const xml = await zip.file("xl/sharedStrings.xml")?.async("text");
  if (!xml) {
    return [];
  }
  const parsed = parser.parse(xml);
  return toArray(parsed?.sst?.si).map((item) => collectText(item).join("").trim());
}

async function readWorkbookSheets(zip: JSZip, parser: XMLParser) {
  const workbookXml = await zip.file("xl/workbook.xml")?.async("text");
  const relsXml = await zip.file("xl/_rels/workbook.xml.rels")?.async("text");

  if (!workbookXml || !relsXml) {
    return [];
  }

  const workbook = parser.parse(workbookXml);
  const rels = parser.parse(relsXml);
  const relationships = new Map(
    toArray(rels?.Relationships?.Relationship).map((rel) => [
      rel["@_Id"],
      String(rel["@_Target"] ?? ""),
    ]),
  );

  return toArray(workbook?.workbook?.sheets?.sheet)
    .map((sheet) => {
      const target = relationships.get(sheet["@_r:id"]) ?? "";
      return {
        name: String(sheet["@_name"] ?? `Sheet ${sheet["@_sheetId"] ?? ""}`).trim(),
        path: target.startsWith("xl/")
          ? target
          : `xl/${target.replace(/^\/+/, "")}`,
      };
    })
    .filter((sheet) => sheet.path !== "xl/");
}

function readCellValue(cell: Record<string, unknown>, sharedStrings: string[]) {
  const raw = String(cell?.v ?? "");
  if (!raw) {
    return "";
  }
  if (cell?.["@_t"] === "s") {
    return sharedStrings[Number(raw)] ?? "";
  }
  return raw;
}

function collectText(value: unknown): string[] {
  if (typeof value === "string" || typeof value === "number") {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectText);
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) => {
    if (key === "#text" || key.endsWith(":t") || key === "t") {
      return collectText(nested);
    }
    if (key.startsWith("@_")) {
      return [];
    }
    return collectText(nested);
  });
}

function createXmlParser() {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
  });
}

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function numericSuffix(value: string) {
  return Number(value.match(/(\d+)(?=\.xml$)/)?.[1] ?? 0);
}

function toUint8Array(value: Uint8Array | ArrayBuffer | Buffer) {
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  return value;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 64) || "source"
  );
}
