import { MessageCircle, Mic2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SourceRefs } from "@/components/SourceRefs";
import { radiationPacket } from "@/lib/sample-data";

export default function TutorPage() {
  const attempt = radiationPacket.attempts[0];
  const concept = radiationPacket.concepts.find(
    (item) => item.id === attempt.conceptId,
  );

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
        <article className="chat-panel">
          <div className="chat-bubble student">
            <span>Student teach-back</span>
            <p>{attempt.studentExplanation}</p>
          </div>
          <div className="chat-bubble tutor">
            <span>Feynman coach</span>
            <p>{radiationPacket.tutorTurns[0].content}</p>
            <SourceRefs refs={radiationPacket.tutorTurns[0].sourceRefs} />
          </div>
          <form className="composer">
            <Mic2 size={18} aria-hidden="true" />
            <label htmlFor="teach-back">Teach it in one simple paragraph</label>
            <textarea
              id="teach-back"
              placeholder="Use your own words. Avoid filler. Add one because."
            />
            <button className="button primary" type="button">
              <MessageCircle size={18} aria-hidden="true" />
              Check teach-back
            </button>
          </form>
        </article>

        <aside className="panel coach-panel">
          <div className="score-ring">
            <Sparkles size={22} aria-hidden="true" />
            <strong>{attempt.simpleScore}</strong>
            <span>simple score</span>
          </div>
          <h2>{concept?.title}</h2>
          <p>{concept?.whyItMatters}</p>
          <div className="gap-list">
            {attempt.gapNotes.map((gap) => (
              <span key={gap}>{gap}</span>
            ))}
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
