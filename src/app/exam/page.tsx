import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SourceRefs } from "@/components/SourceRefs";
import { radiationPacket } from "@/lib/sample-data";

export default function ExamPage() {
  return (
    <AppShell>
      <section className="page-header">
        <p className="eyebrow">Exam mode</p>
        <h1>Practice questions tied back to source chunks.</h1>
        <p>
          Warmups check vocabulary. Exam prompts test distinction-making,
          calculation logic, and patient-safe explanations.
        </p>
      </section>

      <section className="exam-list">
        {radiationPacket.quizItems.map((item, index) => (
          <article className="exam-item" key={item.id}>
            <div className="exam-number">
              <ClipboardCheck size={18} aria-hidden="true" />
              <span>{index + 1}</span>
            </div>
            <div>
              <small>{item.difficulty}</small>
              <h2>{item.prompt}</h2>
              {item.choices ? (
                <ul className="choice-list">
                  {item.choices.map((choice) => (
                    <li key={choice}>{choice}</li>
                  ))}
                </ul>
              ) : null}
              <details>
                <summary>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Show answer logic
                </summary>
                <p>{item.answer}</p>
                <p>{item.explanation}</p>
                <SourceRefs refs={item.sourceRefs} />
              </details>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
