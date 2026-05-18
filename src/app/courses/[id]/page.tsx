import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Brain, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MasteryBar } from "@/components/MasteryBar";
import { SourceRefs } from "@/components/SourceRefs";
import { getCoursePacket, getDefaultCourseId } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id !== getDefaultCourseId()) {
    notFound();
  }
  const packet = await getCoursePacket(id);

  return (
    <AppShell>
      <section className="page-header">
        <p className="eyebrow">Concept map</p>
        <h1>{packet.course.title}</h1>
        <p>{packet.course.description}</p>
      </section>

      <section className="concept-map">
        {packet.concepts.map((concept) => (
          <article className="map-node" key={concept.id}>
            <div className="node-topline">
              <Brain size={18} aria-hidden="true" />
              <span>{Math.round(concept.mastery * 100)}%</span>
            </div>
            <h2>{concept.title}</h2>
            <p>{concept.plainLanguage}</p>
            <MasteryBar value={concept.mastery} />
            <SourceRefs refs={concept.sourceRefs} />
          </article>
        ))}
      </section>

      <section className="panel wide">
        <div className="panel-heading row-heading">
          <div>
            <p className="eyebrow">Source trail</p>
            <h2>What backs this packet</h2>
          </div>
          <Link className="inline-link" href="/exports">
            Export guide
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="source-grid">
          {packet.sources.map((source) => (
            <article key={source.id} className="source-tile">
              <FileText size={19} aria-hidden="true" />
              <h3>{source.title}</h3>
              <p>{source.summary}</p>
              <span>{source.privacy}</span>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
