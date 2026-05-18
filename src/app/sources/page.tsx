import { FileText, FileUp, LockKeyhole, Table2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { radiationPacket } from "@/lib/sample-data";
import { supportedImports } from "@/lib/ingestion";

export default function SourcesPage() {
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
          <p>PPTX, spreadsheets, PDFs, documents, Markdown, and text.</p>
          <input
            aria-label="Import course files"
            type="file"
            multiple
            accept=".pptx,.xlsx,.xls,.pdf,.docx,.md,.markdown,.txt"
          />
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
          {radiationPacket.sources.map((source) => (
            <article key={source.id} className="source-tile">
              <FileText size={19} aria-hidden="true" />
              <h3>{source.title}</h3>
              <p>{source.summary}</p>
              <span>{source.kind}</span>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
