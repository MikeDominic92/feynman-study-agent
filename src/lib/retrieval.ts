import type { CoursePacket, SourceChunk, SourceReference } from "./types";

export interface RetrievedChunk {
  chunk: SourceChunk;
  score: number;
  ref: SourceReference;
}

export function retrieveSourceContext(
  packet: CoursePacket,
  query: string,
  limit = 5,
): RetrievedChunk[] {
  const tokens = tokenize(query);
  const sourceById = new Map(packet.sources.map((source) => [source.id, source]));

  return packet.chunks
    .map((chunk) => {
      const haystack = tokenize(`${chunk.heading} ${chunk.text}`);
      const score = tokens.reduce(
        (sum, token) => sum + (haystack.includes(token) ? 1 : 0),
        0,
      );
      const source = sourceById.get(chunk.sourceId);
      return {
        chunk,
        score,
        ref: {
          sourceId: chunk.sourceId,
          chunkId: chunk.id,
          locator: chunk.locator,
          label: source?.title ?? "Source",
        },
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.chunk.order - b.chunk.order)
    .slice(0, limit);
}

export function formatRetrievedContext(items: RetrievedChunk[]) {
  return items
    .map(
      (item, index) =>
        `[${index + 1}] ${item.ref.label} (${item.ref.locator})\n${item.chunk.text}`,
    )
    .join("\n\n");
}

function tokenize(value: string) {
  return Array.from(
    new Set(
      value
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length > 2),
    ),
  );
}
