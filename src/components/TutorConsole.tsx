"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Mic2 } from "lucide-react";
import { SourceRefs } from "@/components/SourceRefs";
import type { Concept, FeynmanAttempt, TutorTurn } from "@/lib/types";

interface TutorResponse {
  attempt: FeynmanAttempt;
  turn: TutorTurn;
  usedOpenAI: boolean;
  contextCount: number;
}

export function TutorConsole({
  concepts,
  initialAttempt,
  initialTurn,
}: {
  concepts: Concept[];
  initialAttempt?: FeynmanAttempt;
  initialTurn?: TutorTurn;
}) {
  const [conceptId, setConceptId] = useState(concepts[0]?.id ?? "");
  const [explanation, setExplanation] = useState(
    initialAttempt?.studentExplanation ?? "",
  );
  const [result, setResult] = useState<TutorResponse | null>(
    initialAttempt && initialTurn
      ? {
          attempt: initialAttempt,
          turn: initialTurn,
          usedOpenAI: false,
          contextCount: initialTurn.sourceRefs.length,
        }
      : null,
  );
  const [message, setMessage] = useState("Teach the idea in your own words.");
  const [isPending, startTransition] = useTransition();

  async function submitTeachBack() {
    if (!conceptId || explanation.trim().length < 8) {
      setMessage("Choose a concept and write a fuller teach-back first.");
      return;
    }

    setMessage("Checking teach-back against source chunks...");
    const response = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conceptId, explanation }),
    });
    const payload = (await response.json()) as TutorResponse | { error: string };

    if (!response.ok || "error" in payload) {
      setMessage("error" in payload ? payload.error : "Tutor check failed.");
      return;
    }

    setResult(payload);
    setMessage(
      payload.usedOpenAI
        ? "OpenAI tutor response saved locally."
        : "Deterministic local tutor response saved. Add OPENAI_API_KEY for live model coaching.",
    );
  }

  return (
    <article className="chat-panel">
      {result ? (
        <>
          <div className="chat-bubble student">
            <span>Student teach-back</span>
            <p>{result.attempt.studentExplanation}</p>
          </div>
          <div className="chat-bubble tutor">
            <span>Feynman coach</span>
            <p>{result.turn.content}</p>
            <SourceRefs refs={result.turn.sourceRefs} />
          </div>
        </>
      ) : null}
      <form className="composer">
        <Mic2 size={18} aria-hidden="true" />
        <label htmlFor="concept">Concept</label>
        <select
          id="concept"
          value={conceptId}
          onChange={(event) => setConceptId(event.target.value)}
        >
          {concepts.map((concept) => (
            <option key={concept.id} value={concept.id}>
              {concept.title}
            </option>
          ))}
        </select>
        <label htmlFor="teach-back">Teach it in one simple paragraph</label>
        <textarea
          id="teach-back"
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          placeholder="Use your own words. Avoid filler. Add one because."
        />
        <button
          className="button primary"
          type="button"
          onClick={() => {
            startTransition(() => {
              void submitTeachBack();
            });
          }}
          disabled={isPending}
        >
          <MessageCircle size={18} aria-hidden="true" />
          Check teach-back
        </button>
        <p className="form-note">{message}</p>
      </form>
    </article>
  );
}
