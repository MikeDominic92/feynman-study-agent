import { Repeat2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SourceRefs } from "@/components/SourceRefs";
import { getDefaultCoursePacket } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const packet = await getDefaultCoursePacket();

  return (
    <AppShell>
      <section className="page-header">
        <p className="eyebrow">Review queue</p>
        <h1>Small prompts, spaced over time.</h1>
        <p>
          Cards are created from source-backed concepts and teach-back gaps, then
          scheduled by confidence.
        </p>
      </section>

      <section className="review-grid">
        {packet.reviewCards.map((card) => (
          <article className="review-card" key={card.id}>
            <div className="node-topline">
              <Repeat2 size={18} aria-hidden="true" />
              <span>Due {new Date(card.dueAt).toLocaleDateString("en-US")}</span>
            </div>
            <h2>{card.front}</h2>
            <p>{card.back}</p>
            <div className="review-actions">
              <button type="button">Again</button>
              <button type="button">Hard</button>
              <button type="button">Good</button>
              <button type="button">Easy</button>
            </div>
            <SourceRefs refs={card.sourceRefs} />
          </article>
        ))}
      </section>
    </AppShell>
  );
}
