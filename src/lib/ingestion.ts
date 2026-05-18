import type { SourceChunk, SourceDocument, SourceKind } from "./types";

export const supportedImports: Array<{
  kind: SourceKind;
  extensions: string[];
  status: "ready" | "planned";
}> = [
  { kind: "markdown", extensions: [".md", ".markdown"], status: "ready" },
  { kind: "text", extensions: [".txt"], status: "ready" },
  { kind: "pptx", extensions: [".pptx"], status: "planned" },
  { kind: "xlsx", extensions: [".xlsx", ".xls"], status: "planned" },
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
