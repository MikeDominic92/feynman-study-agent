import type { Concept, FeynmanAttempt, TutorTurn } from "./types";

const fillerWords = [
  "basically",
  "kind of",
  "sort of",
  "like",
  "you know",
  "stuff",
  "things",
  "whatever",
];

const jargonWords = [
  "optimization",
  "ionization",
  "stochastic",
  "deterministic",
  "equivalent",
  "effective",
  "kerma",
  "dosimetry",
];

export function analyzeTeachBack(input: {
  attemptId: string;
  concept: Concept;
  explanation: string;
  now?: string;
}): FeynmanAttempt {
  const lower = input.explanation.toLowerCase();
  const fillerFlags = fillerWords.filter((word) => lower.includes(word));
  const jargonFlags = jargonWords.filter((word) => lower.includes(word));
  const gapNotes = buildGapNotes(input.explanation, input.concept);
  const lengthScore = input.explanation.trim().split(/\s+/).length >= 12 ? 18 : 8;
  const simpleScore = Math.max(
    0,
    Math.min(100, 70 + lengthScore - fillerFlags.length * 8 - jargonFlags.length * 5 - gapNotes.length * 9),
  );

  return {
    id: input.attemptId,
    conceptId: input.concept.id,
    studentExplanation: input.explanation,
    simpleScore,
    fillerFlags,
    jargonFlags,
    gapNotes,
    nextQuestion: buildNextQuestion(input.concept, gapNotes),
    sourceRefs: input.concept.sourceRefs,
    createdAt: input.now ?? new Date().toISOString(),
  };
}

export function buildTutorTurn(attempt: FeynmanAttempt): TutorTurn {
  const coaching =
    attempt.simpleScore >= 85
      ? `Strong teach-back. Now add one real exam-style example: ${attempt.nextQuestion}`
      : `Good start. Strip this down to a sentence a patient could understand, then answer: ${attempt.nextQuestion}`;

  return {
    id: `turn-${attempt.id}`,
    conceptId: attempt.conceptId,
    role: "tutor",
    content: coaching,
    confidence: "source-backed",
    sourceRefs: attempt.sourceRefs,
  };
}

function buildGapNotes(explanation: string, concept: Concept) {
  const lower = explanation.toLowerCase();
  const notes: string[] = [];

  if (!lower.includes(concept.title.toLowerCase().split(" ")[0])) {
    notes.push(`Name the concept directly: ${concept.title}.`);
  }

  if (!/[.!?]$/.test(explanation.trim())) {
    notes.push("Finish the thought as a complete sentence.");
  }

  if (!lower.includes("because") && !lower.includes("so that")) {
    notes.push("Add a because or so that link to show cause and effect.");
  }

  if (concept.whyItMatters && !lower.includes("patient") && !lower.includes("risk")) {
    notes.push("Connect the idea to patient care, risk, or safety.");
  }

  return notes;
}

function buildNextQuestion(concept: Concept, gapNotes: string[]) {
  if (gapNotes.some((note) => note.includes("cause and effect"))) {
    return `Why does ${concept.title} change what a technologist does?`;
  }

  if (gapNotes.some((note) => note.includes("patient"))) {
    return `How would you explain ${concept.title} to a patient in one sentence?`;
  }

  return `What common mistake would confuse ${concept.title} with a nearby idea?`;
}
