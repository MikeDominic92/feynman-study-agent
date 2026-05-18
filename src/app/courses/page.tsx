import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck, Layers3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MasteryBar } from "@/components/MasteryBar";
import { getDefaultCoursePacket } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const packet = await getDefaultCoursePacket();
  const averageMastery =
    packet.concepts.reduce((sum, concept) => sum + concept.mastery, 0) /
    Math.max(1, packet.concepts.length);

  return (
    <AppShell>
      <section className="page-header">
        <p className="eyebrow">Courses</p>
        <h1>{packet.course.title}</h1>
        <p>
          One local-first course packet, source-backed chunks, and exam-facing
          concepts ready for teach-back practice.
        </p>
      </section>

      <section className="dashboard-grid three">
        <article className="metric-panel">
          <BookOpen size={20} aria-hidden="true" />
          <strong>{packet.sources.length}</strong>
          <span>source groups</span>
        </article>
        <article className="metric-panel">
          <Layers3 size={20} aria-hidden="true" />
          <strong>{packet.concepts.length}</strong>
          <span>concepts</span>
        </article>
        <article className="metric-panel">
          <CircleCheck size={20} aria-hidden="true" />
          <strong>{Math.round(averageMastery * 100)}%</strong>
          <span>average mastery</span>
        </article>
      </section>

      <section className="panel wide">
        <div className="panel-heading row-heading">
          <div>
            <p className="eyebrow">Active packet</p>
            <h2>Radiation protection foundation</h2>
          </div>
          <Link className="inline-link" href={`/courses/${packet.course.id}`}>
            Open course
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="course-strip">
          {packet.concepts.map((concept) => (
            <article key={concept.id}>
              <h3>{concept.title}</h3>
              <p>{concept.plainLanguage}</p>
              <MasteryBar value={concept.mastery} />
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
