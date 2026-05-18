import type { CoursePacket, SourceReference } from "./types";

export function exportCourseMarkdown(packet: CoursePacket) {
  const lines = [
    `# ${packet.course.title}`,
    "",
    packet.course.description,
    "",
    "## Exam Focus",
    ...packet.course.examFocus.map((focus) => `- ${focus}`),
    "",
    "## Concepts",
    ...packet.concepts.flatMap((concept) => [
      "",
      `### ${concept.title}`,
      concept.plainLanguage,
      "",
      `Why it matters: ${concept.whyItMatters}`,
      "",
      `Sources: ${formatRefs(concept.sourceRefs)}`,
    ]),
    "",
    "## Review Queue",
    ...packet.reviewCards.map((card) => `- ${card.front} -> ${card.back}`),
  ];

  return `${lines.join("\n")}\n`;
}

export function exportCourseHtml(packet: CoursePacket) {
  const conceptItems = packet.concepts
    .map(
      (concept) => `<section class="concept">
  <h2>${escapeHtml(concept.title)}</h2>
  <p>${escapeHtml(concept.plainLanguage)}</p>
  <p class="why">${escapeHtml(concept.whyItMatters)}</p>
  <p class="sources">${escapeHtml(formatRefs(concept.sourceRefs))}</p>
</section>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(packet.course.title)} Study Guide</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; margin: 0; color: #17201b; background: #f7f9f5; }
    main { max-width: 920px; margin: 0 auto; padding: 48px 24px; }
    h1 { font-size: 44px; line-height: 1; margin: 0 0 16px; }
    .concept { border-top: 1px solid #cbd8cf; padding: 24px 0; }
    .why { color: #516157; }
    .sources { color: #2f6f5e; font-size: 14px; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(packet.course.title)}</h1>
    <p>${escapeHtml(packet.course.description)}</p>
    ${conceptItems}
  </main>
</body>
</html>`;
}

export function exportCourseJson(packet: CoursePacket) {
  return JSON.stringify(packet, null, 2);
}

function formatRefs(refs: SourceReference[]) {
  return refs.map((ref) => `${ref.label} (${ref.locator})`).join("; ");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
