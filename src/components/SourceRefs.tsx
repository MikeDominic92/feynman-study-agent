import type { SourceReference } from "@/lib/types";

export function SourceRefs({ refs }: { refs: SourceReference[] }) {
  return (
    <ul className="source-ref-list" aria-label="Source references">
      {refs.map((ref) => (
        <li key={`${ref.sourceId}-${ref.chunkId ?? ref.locator}`}>
          <span>{ref.label}</span>
          <small>{ref.locator}</small>
        </li>
      ))}
    </ul>
  );
}
