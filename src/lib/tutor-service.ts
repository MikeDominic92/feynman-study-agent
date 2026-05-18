import OpenAI from "openai";
import { analyzeTeachBack, buildTutorTurn } from "./feynman";
import { feynmanTutorSystemPrompt } from "./prompts";
import { formatRetrievedContext, retrieveSourceContext } from "./retrieval";
import type { CoursePacket, FeynmanAttempt, TutorTurn } from "./types";

export interface TutorResult {
  attempt: FeynmanAttempt;
  turn: TutorTurn;
  usedOpenAI: boolean;
  contextCount: number;
}

export async function createTutorResponse(input: {
  packet: CoursePacket;
  conceptId: string;
  explanation: string;
  now?: string;
}): Promise<TutorResult> {
  const concept = input.packet.concepts.find((item) => item.id === input.conceptId);
  if (!concept) {
    throw new Error(`Concept not found: ${input.conceptId}`);
  }

  const now = input.now ?? new Date().toISOString();
  const attempt = analyzeTeachBack({
    attemptId: `attempt-${concept.id}-${Date.parse(now).toString(36)}`,
    concept,
    explanation: input.explanation,
    now,
  });
  const retrieved = retrieveSourceContext(
    input.packet,
    `${concept.title} ${input.explanation}`,
  );
  const fallbackTurn = buildTutorTurn(attempt);
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return {
      attempt,
      turn: {
        ...fallbackTurn,
        sourceRefs: retrieved.map((item) => item.ref).slice(0, 3),
      },
      usedOpenAI: false,
      contextCount: retrieved.length,
    };
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses
    .create({
      model: process.env.OPENAI_MODEL || "gpt-5.1-mini",
      instructions: feynmanTutorSystemPrompt,
      input: [
        `Concept: ${concept.title}`,
        `Student explanation: ${input.explanation}`,
        `Simple score: ${attempt.simpleScore}`,
        `Detected filler: ${attempt.fillerFlags.join(", ") || "none"}`,
        `Detected jargon: ${attempt.jargonFlags.join(", ") || "none"}`,
        `Gaps: ${attempt.gapNotes.join(" | ") || "none"}`,
        "Retrieved source context:",
        formatRetrievedContext(retrieved),
        "Return one short coaching response. Include one question. Do not dump a full answer.",
      ].join("\n\n"),
      max_output_tokens: 350,
    })
    .catch(() => null);

  if (!response) {
    return {
      attempt,
      turn: {
        ...fallbackTurn,
        sourceRefs: retrieved.map((item) => item.ref).slice(0, 3),
      },
      usedOpenAI: false,
      contextCount: retrieved.length,
    };
  }

  return {
    attempt,
    turn: {
      ...fallbackTurn,
      content: response.output_text?.trim() || fallbackTurn.content,
      confidence: "source-backed",
      sourceRefs: retrieved.map((item) => item.ref).slice(0, 3),
    },
    usedOpenAI: true,
    contextCount: retrieved.length,
  };
}
