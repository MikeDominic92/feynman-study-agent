import type {
  Concept,
  QuizItem,
  ReviewCard,
  SourceChunk,
  SourceDocument,
  SourceReference,
} from "./types";

interface ConceptTemplate {
  id: string;
  title: string;
  patterns: RegExp[];
  plainLanguage: string;
  whyItMatters: string;
  quizPrompt: string;
  quizAnswer: string;
}

export interface GeneratedStudyArtifacts {
  concepts: Concept[];
  quizItems: QuizItem[];
  reviewCards: ReviewCard[];
}

const conceptTemplates: ConceptTemplate[] = [
  {
    id: "alara",
    title: "ALARA",
    patterns: [/\balara\b/i, /reasonably achievable/i],
    plainLanguage:
      "Use only the amount of radiation needed to answer the clinical question.",
    whyItMatters:
      "It connects image quality, patient care, repeats, and safety into one daily decision rule.",
    quizPrompt: "Explain ALARA without using the words in the acronym.",
    quizAnswer:
      "Use the lowest reasonable exposure that still gives the information needed for care.",
  },
  {
    id: "time-distance-shielding",
    title: "Time, distance, shielding",
    patterns: [/\btime\b/i, /\bdistance\b/i, /\bshielding\b/i],
    plainLanguage:
      "Shorter exposure time, more distance, and useful barriers can reduce exposure.",
    whyItMatters:
      "These are the fastest practical levers for lowering exposure during imaging work.",
    quizPrompt: "Which of the three cardinal rules can a technologist change by stepping back?",
    quizAnswer: "Distance.",
  },
  {
    id: "air-kerma",
    title: "Air kerma",
    patterns: [/air\s+kerma/i, /\bkerma\b/i],
    plainLanguage:
      "Air kerma describes energy transferred from the radiation beam to air.",
    whyItMatters:
      "It appears in equipment output and dose monitoring, especially around fluoroscopy.",
    quizPrompt: "Teach air kerma in one sentence using the word energy.",
    quizAnswer: "Air kerma is the energy the beam transfers to air.",
  },
  {
    id: "absorbed-dose",
    title: "Absorbed dose",
    patterns: [/absorbed\s+dose/i, /\bgray\b/i, /\bmgy\b/i],
    plainLanguage:
      "Absorbed dose is the radiation energy that stays in tissue or material.",
    whyItMatters:
      "It is the dose quantity most directly tied to energy deposited in patient tissue.",
    quizPrompt: "What does absorbed dose focus on?",
    quizAnswer: "Energy absorbed by tissue or material.",
  },
  {
    id: "equivalent-dose",
    title: "Equivalent dose",
    patterns: [/equivalent\s+dose/i, /\beqd\b/i, /\brem\b/i],
    plainLanguage:
      "Equivalent dose adjusts absorbed dose for the type of radiation.",
    whyItMatters:
      "It helps separate occupational monitoring language from broader patient risk estimates.",
    quizPrompt: "What extra factor does equivalent dose add to absorbed dose?",
    quizAnswer: "Radiation weighting or radiation type.",
  },
  {
    id: "effective-dose",
    title: "Effective dose",
    patterns: [/effective\s+dose/i, /\befd\b/i, /tissue\s+weight/i],
    plainLanguage:
      "Effective dose also accounts for which tissues were exposed to estimate overall risk.",
    whyItMatters:
      "It keeps patient risk discussions from being confused with a single tissue dose.",
    quizPrompt: "What does effective dose add beyond equivalent dose?",
    quizAnswer: "Tissue sensitivity or tissue weighting.",
  },
  {
    id: "dose-area-product",
    title: "Dose area product",
    patterns: [/dose\s+area\s+product/i, /\bdap\b/i, /mgy[\s-]*cm/i],
    plainLanguage:
      "Dose area product grows when either beam dose or exposed area grows.",
    whyItMatters:
      "It helps compare total patient exposure across different field sizes.",
    quizPrompt: "What happens to DAP if the exposed field gets larger?",
    quizAnswer: "It increases if air kerma stays the same.",
  },
  {
    id: "background-radiation",
    title: "Background radiation",
    patterns: [/background\s+radiation/i, /\bradon\b/i, /\bcosmic\b/i, /terrestrial/i],
    plainLanguage:
      "Background radiation is everyday exposure from natural and human-made sources.",
    whyItMatters:
      "It gives students a reference point for explaining medical exposure in human terms.",
    quizPrompt: "Name one natural source of background radiation.",
    quizAnswer: "Radon, cosmic radiation, terrestrial radiation, or internal radiation.",
  },
];

export function buildStudyArtifacts(input: {
  courseId: string;
  source: SourceDocument;
  chunks: SourceChunk[];
  now?: string;
}): GeneratedStudyArtifacts {
  const now = input.now ?? new Date().toISOString();
  const concepts: Concept[] = [];
  const quizItems: QuizItem[] = [];
  const reviewCards: ReviewCard[] = [];

  for (const template of conceptTemplates) {
    const matchedChunks = input.chunks.filter((chunk) =>
      template.patterns.some((pattern) => pattern.test(`${chunk.heading}\n${chunk.text}`)),
    );

    if (matchedChunks.length === 0) {
      continue;
    }

    const sourceRefs = matchedChunks.slice(0, 3).map((chunk) =>
      chunkToRef(input.source, chunk, template.title),
    );
    const conceptId = `concept-${input.source.id}-${template.id}`;

    concepts.push({
      id: conceptId,
      courseId: input.courseId,
      title: template.title,
      plainLanguage: template.plainLanguage,
      whyItMatters: template.whyItMatters,
      prerequisites: [],
      sourceRefs,
      mastery: 0.25,
    });

    quizItems.push({
      id: `quiz-${input.source.id}-${template.id}`,
      courseId: input.courseId,
      conceptId,
      prompt: template.quizPrompt,
      answer: template.quizAnswer,
      explanation: `This question is generated from ${sourceRefs
        .map((ref) => ref.locator)
        .join(", ")}.`,
      difficulty: "warmup",
      sourceRefs,
    });

    reviewCards.push({
      id: `review-${input.source.id}-${template.id}`,
      courseId: input.courseId,
      conceptId,
      front: `Teach ${template.title} in plain language.`,
      back: template.plainLanguage,
      dueAt: now,
      intervalDays: 1,
      ease: 2.3,
      sourceRefs,
    });
  }

  if (concepts.length === 0 && input.chunks.length > 0) {
    const firstChunk = input.chunks[0];
    const sourceRefs = [chunkToRef(input.source, firstChunk, "Source overview")];
    const conceptId = `concept-${input.source.id}-overview`;

    concepts.push({
      id: conceptId,
      courseId: input.courseId,
      title: input.source.title,
      plainLanguage: firstChunk.text.slice(0, 180),
      whyItMatters: "This source needs manual concept review after import.",
      prerequisites: [],
      sourceRefs,
      mastery: 0.1,
    });
    quizItems.push({
      id: `quiz-${input.source.id}-overview`,
      courseId: input.courseId,
      conceptId,
      prompt: `What is the main idea of ${input.source.title}?`,
      answer: firstChunk.text.slice(0, 240),
      explanation: "Generated as an overview because no known concept pattern matched.",
      difficulty: "warmup",
      sourceRefs,
    });
    reviewCards.push({
      id: `review-${input.source.id}-overview`,
      courseId: input.courseId,
      conceptId,
      front: `Summarize ${input.source.title}.`,
      back: firstChunk.text.slice(0, 240),
      dueAt: now,
      intervalDays: 1,
      ease: 2.0,
      sourceRefs,
    });
  }

  return { concepts, quizItems, reviewCards };
}

function chunkToRef(
  source: SourceDocument,
  chunk: SourceChunk,
  conceptTitle: string,
): SourceReference {
  return {
    sourceId: source.id,
    chunkId: chunk.id,
    locator: chunk.locator,
    label: `${conceptTitle} source`,
  };
}
