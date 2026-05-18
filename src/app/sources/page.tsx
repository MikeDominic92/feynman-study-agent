import { FileText, FileUp, LockKeyhole, Table2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SourceImporter } from "@/components/SourceImporter";
import { supportedImports } from "@/lib/ingestion";
import { getDefaultCoursePacket } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const packet = await getDefaultCoursePacket();

  return (
    <AppShell>
      <section className="page-header">
        <p className="eyebrow">Sources</p>
        <h1>Import course files without committing them.</h1>
        <p>
          The repo ships sanitized fixtures. Real class files stay in ignored
          local folders and become source chunks only inside your workspace.
        </p>
      </section>

      <section className="dashboard-grid">
        <article className="upload-panel">
          <FileUp size={24} aria-hidden="true" />
          <h2>Local import lane</h2>
          <p>PPTX, XLSX, Markdown, and text are parsed locally into chunks.</p>
          <SourceImporter />
        </article>
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Guardrail</p>
            <h2>Public-safe by default</h2>
          </div>
          <p>
            The privacy scanner blocks known local course names, Downloads
            paths, screenshots, and unsupported public source artifacts.
          </p>
          <div className="status-line">
            <LockKeyhole size={18} aria-hidden="true" />
            <span>Import-only policy active</span>
          </div>
        </article>
      </section>

      <section className="panel wide">
        <div className="panel-heading">
          <p className="eyebrow">Adapters</p>
          <h2>Accepted source shapes</h2>
        </div>
        <div className="adapter-grid">
          {supportedImports.map((item) => (
            <article key={item.kind}>
              {item.kind === "xlsx" ? (
                <Table2 size={18} aria-hidden="true" />
              ) : (
                <FileText size={18} aria-hidden="true" />
              )}
              <strong>{item.kind.toUpperCase()}</strong>
              <span>{item.extensions.join(", ")}</span>
              <small>{item.status}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <div className="panel-heading">
          <p className="eyebrow">Sanitized demo sources</p>
          <h2>Current packet</h2>
        </div>
        <div className="source-grid">
          {packet.sources.map((source) => (
            <article key={source.id} className="source-tile">
              <FileText size={19} aria-hidden="true" />
              <h3>{source.title}</h3>
              <p>{source.summary}</p>
              <span>{source.kind}</span>
              <small>{source.privacy}</small>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
