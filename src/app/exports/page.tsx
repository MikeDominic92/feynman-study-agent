import { Code2, FileJson, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  exportCourseHtml,
  exportCourseJson,
  exportCourseMarkdown,
} from "@/lib/exports";
import { getDefaultCoursePacket } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function ExportsPage() {
  const packet = await getDefaultCoursePacket();
  const markdown = exportCourseMarkdown(packet);
  const html = exportCourseHtml(packet);
  const json = exportCourseJson(packet);

  return (
    <AppShell>
      <section className="page-header">
        <p className="eyebrow">Exports</p>
        <h1>Study material that leaves cleanly.</h1>
        <p>
          Markdown for LLM reuse, standalone HTML for human review, and JSON for
          future migration.
        </p>
      </section>

      <section className="export-grid">
        <article className="export-panel">
          <FileText size={20} aria-hidden="true" />
          <h2>Markdown</h2>
          <pre>{markdown.slice(0, 760)}</pre>
        </article>
        <article className="export-panel">
          <Code2 size={20} aria-hidden="true" />
          <h2>HTML</h2>
          <pre>{html.slice(0, 760)}</pre>
        </article>
        <article className="export-panel">
          <FileJson size={20} aria-hidden="true" />
          <h2>JSON</h2>
          <pre>{json.slice(0, 760)}</pre>
        </article>
      </section>
    </AppShell>
  );
}
