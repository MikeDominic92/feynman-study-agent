import Link from "next/link";
import { ArrowRight, Brain, FileUp, ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MasteryBar } from "@/components/MasteryBar";
import { SourceRefs } from "@/components/SourceRefs";
import { getDefaultCoursePacket } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const packet = await getDefaultCoursePacket();
  const dueCards = packet.reviewCards.filter((card) => card.intervalDays <= 1);

  const focus = packet.concepts[0]?.title ?? "source import";

  return (
    <AppShell>
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Source-grounded exam prep</p>
          <h1>Teach it simply, then prove you can use it.</h1>
          <p className="hero-copy">
            A Feynman-first study cockpit for turning course sources into
            teach-back loops, exam practice, review cards, and clean Markdown.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/tutor">
              <Brain size={18} aria-hidden="true" />
              Start tutor loop
            </Link>
            <Link className="button secondary" href="/sources">
              <FileUp size={18} aria-hidden="true" />
              Import sources
            </Link>
          </div>
        </div>
        <div className="study-card">
          <div className="study-card-header">
            <Sparkles size={18} aria-hidden="true" />
            <span>Today</span>
          </div>
          <strong>{dueCards.length} review cards due</strong>
          <p>Focus: {focus} teach-back and the newest source-backed gaps.</p>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Course</p>
            <h2>{packet.course.title}</h2>
          </div>
          <p>{packet.course.description}</p>
          <div className="focus-list">
            {packet.course.examFocus.map((focus) => (
              <span key={focus}>{focus}</span>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Privacy</p>
            <h2>Import-only by default</h2>
          </div>
          <p>
            Public fixtures are sanitized. Real slides, spreadsheets, books, and
            screenshots are ignored by Git and treated as local-only sources.
          </p>
          <div className="status-line">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>Privacy scan included</span>
          </div>
        </article>
      </section>

      <section className="panel wide">
        <div className="panel-heading row-heading">
          <div>
            <p className="eyebrow">Concept mastery</p>
            <h2>Radiation protection map</h2>
          </div>
          <Link className="inline-link" href="/courses/mi-120-radiation-protection">
            Open map
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="concept-table">
          {packet.concepts.map((concept) => (
            <article className="concept-row" key={concept.id}>
              <div>
                <h3>{concept.title}</h3>
                <p>{concept.plainLanguage}</p>
                <SourceRefs refs={concept.sourceRefs} />
              </div>
              <div className="mastery-cell">
                <strong>{Math.round(concept.mastery * 100)}%</strong>
                <MasteryBar value={concept.mastery} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
