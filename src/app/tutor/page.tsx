import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TutorConsole } from "@/components/TutorConsole";
import { getDefaultCoursePacket } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function TutorPage() {
  const packet = await getDefaultCoursePacket();
  const attempt = packet.attempts[0];
  const turn = packet.tutorTurns[0];
  const concept = packet.concepts.find(
    (item) => item.id === attempt?.conceptId,
  ) ?? packet.concepts[0];

  return (
    <AppShell>
      <section className="page-header">
        <p className="eyebrow">Feynman tutor</p>
        <h1>Explain first. Then the tutor sharpens the gap.</h1>
        <p>
          The app scores simplicity, flags filler and hidden jargon, asks one
          question, and turns the weak spot into review.
        </p>
      </section>

      <section className="tutor-layout">
        <TutorConsole
          concepts={packet.concepts}
          initialAttempt={attempt}
          initialTurn={turn}
        />

        <aside className="panel coach-panel">
          <div className="score-ring">
            <Sparkles size={22} aria-hidden="true" />
            <strong>{attempt?.simpleScore ?? 0}</strong>
            <span>simple score</span>
          </div>
          <h2>{concept?.title}</h2>
          <p>{concept?.whyItMatters}</p>
          <div className="gap-list">
            {(attempt?.gapNotes ?? ["Import a source or run a teach-back to log gaps."]).map((gap) => (
              <span key={gap}>{gap}</span>
            ))}
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
