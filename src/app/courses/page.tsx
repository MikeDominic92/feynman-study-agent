import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck, Layers3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MasteryBar } from "@/components/MasteryBar";
import { radiationPacket } from "@/lib/sample-data";

export default function CoursesPage() {
  const averageMastery =
    radiationPacket.concepts.reduce((sum, concept) => sum + concept.mastery, 0) /
    radiationPacket.concepts.length;

  return (
    <AppShell>
      <section className="page-header">
        <p className="eyebrow">Courses</p>
        <h1>{radiationPacket.course.title}</h1>
        <p>
          One course packet, two sanitized source groups, and five exam-facing
          concepts ready for teach-back practice.
        </p>
      </section>

      <section className="dashboard-grid three">
        <article className="metric-panel">
          <BookOpen size={20} aria-hidden="true" />
          <strong>{radiationPacket.sources.length}</strong>
          <span>source groups</span>
        </article>
        <article className="metric-panel">
          <Layers3 size={20} aria-hidden="true" />
          <strong>{radiationPacket.concepts.length}</strong>
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
          <Link className="inline-link" href="/courses/mi-120-radiation-protection">
            Open course
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="course-strip">
          {radiationPacket.concepts.map((concept) => (
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
