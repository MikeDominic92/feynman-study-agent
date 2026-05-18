import type { CoursePacket } from "./types";

export const radiationPacket: CoursePacket = {
  course: {
    id: "mi-120-radiation-protection",
    title: "MI 120 Radiation Protection",
    term: "Sanitized demo course",
    description:
      "A public-safe demo packet for radiography students practicing radiation protection foundations and dose quantities.",
    examFocus: [
      "Explain ALARA in plain language",
      "Compare exposure, air kerma, absorbed dose, equivalent dose, and effective dose",
      "Use time, distance, and shielding to reason about exposure reduction",
      "Translate dose-area product and population dose into human terms",
    ],
    sourceIds: ["src-sanitized-intro", "src-sanitized-quantities"],
    conceptIds: [
      "concept-alara",
      "concept-cardinal-rules",
      "concept-air-kerma",
      "concept-equivalent-effective",
      "concept-dap",
    ],
    quizItemIds: ["quiz-alara-1", "quiz-dose-1", "quiz-dap-1"],
    reviewCardIds: ["review-alara", "review-air-kerma", "review-effective-dose"],
  },
  sources: [
    {
      id: "src-sanitized-intro",
      title: "Sanitized intro notes",
      kind: "markdown",
      status: "ready",
      addedAt: "2026-05-18T09:00:00.000Z",
      summary:
        "Introduces radiation protection, unnecessary exposure, ALARA, and the time-distance-shielding frame.",
      chunkIds: ["chunk-alara", "chunk-cardinal"],
      privacy: "sanitized-demo",
    },
    {
      id: "src-sanitized-quantities",
      title: "Sanitized quantities grid",
      kind: "markdown",
      status: "ready",
      addedAt: "2026-05-18T09:05:00.000Z",
      summary:
        "Summarizes dose quantities, units, and the difference between patient dose and worker dose metrics.",
      chunkIds: ["chunk-air-kerma", "chunk-eqd-efd", "chunk-dap"],
      privacy: "sanitized-demo",
    },
  ],
  chunks: [
    {
      id: "chunk-alara",
      sourceId: "src-sanitized-intro",
      heading: "ALARA",
      text:
        "ALARA means keeping radiation exposure as low as reasonably achievable while still producing the image or information needed for care.",
      order: 1,
      locator: "Demo intro notes, section 1",
    },
    {
      id: "chunk-cardinal",
      sourceId: "src-sanitized-intro",
      heading: "Time, distance, shielding",
      text:
        "Reducing beam-on time, increasing distance from the source, and using appropriate shielding can reduce exposure for patients, staff, and the public.",
      order: 2,
      locator: "Demo intro notes, section 2",
    },
    {
      id: "chunk-air-kerma",
      sourceId: "src-sanitized-quantities",
      heading: "Air kerma",
      text:
        "Air kerma describes energy transferred from the radiation beam to air and is commonly reported in gray or milligray.",
      order: 1,
      locator: "Demo quantities grid, row 2",
    },
    {
      id: "chunk-eqd-efd",
      sourceId: "src-sanitized-quantities",
      heading: "Equivalent and effective dose",
      text:
        "Equivalent dose adjusts absorbed dose by radiation type. Effective dose also accounts for tissue sensitivity to estimate overall risk.",
      order: 2,
      locator: "Demo quantities grid, rows 4-5",
    },
    {
      id: "chunk-dap",
      sourceId: "src-sanitized-quantities",
      heading: "Dose area product",
      text:
        "Dose area product combines air kerma with the exposed area, giving a broad measure of total energy delivered across the field.",
      order: 3,
      locator: "Demo quantities grid, row 6",
    },
  ],
  concepts: [
    {
      id: "concept-alara",
      courseId: "mi-120-radiation-protection",
      title: "ALARA",
      plainLanguage:
        "Use only the amount of radiation needed to answer the clinical question.",
      whyItMatters:
        "It turns radiation safety from a slogan into everyday choices about technique, repeats, shielding, and patient care.",
      prerequisites: [],
      sourceRefs: [
        {
          sourceId: "src-sanitized-intro",
          chunkId: "chunk-alara",
          locator: "Demo intro notes, section 1",
          label: "ALARA note",
        },
      ],
      mastery: 0.72,
    },
    {
      id: "concept-cardinal-rules",
      courseId: "mi-120-radiation-protection",
      title: "Time, distance, shielding",
      plainLanguage:
        "Shorter exposure time, more distance, and useful barriers all lower exposure.",
      whyItMatters:
        "These three levers are easy to remember and show up in nearly every radiation safety scenario.",
      prerequisites: ["concept-alara"],
      sourceRefs: [
        {
          sourceId: "src-sanitized-intro",
          chunkId: "chunk-cardinal",
          locator: "Demo intro notes, section 2",
          label: "Cardinal rules note",
        },
      ],
      mastery: 0.66,
    },
    {
      id: "concept-air-kerma",
      courseId: "mi-120-radiation-protection",
      title: "Air kerma",
      plainLanguage:
        "A way to describe energy from the beam being handed off to air.",
      whyItMatters:
        "It appears in equipment output, dose reports, and fluoroscopy dose monitoring.",
      prerequisites: ["concept-alara"],
      sourceRefs: [
        {
          sourceId: "src-sanitized-quantities",
          chunkId: "chunk-air-kerma",
          locator: "Demo quantities grid, row 2",
          label: "Air kerma row",
        },
      ],
      mastery: 0.48,
    },
    {
      id: "concept-equivalent-effective",
      courseId: "mi-120-radiation-protection",
      title: "Equivalent vs effective dose",
      plainLanguage:
        "Equivalent dose cares about radiation type. Effective dose also cares which tissue was exposed.",
      whyItMatters:
        "This distinction keeps worker badge reports and patient risk estimates from getting mixed together.",
      prerequisites: ["concept-air-kerma"],
      sourceRefs: [
        {
          sourceId: "src-sanitized-quantities",
          chunkId: "chunk-eqd-efd",
          locator: "Demo quantities grid, rows 4-5",
          label: "EqD and EfD rows",
        },
      ],
      mastery: 0.41,
    },
    {
      id: "concept-dap",
      courseId: "mi-120-radiation-protection",
      title: "Dose area product",
      plainLanguage:
        "A dose metric that grows when either the beam dose or the exposed area grows.",
      whyItMatters:
        "It helps compare total patient exposure across procedures with different field sizes.",
      prerequisites: ["concept-air-kerma"],
      sourceRefs: [
        {
          sourceId: "src-sanitized-quantities",
          chunkId: "chunk-dap",
          locator: "Demo quantities grid, row 6",
          label: "DAP row",
        },
      ],
      mastery: 0.57,
    },
  ],
  attempts: [
    {
      id: "attempt-alara-demo",
      conceptId: "concept-alara",
      studentExplanation:
        "ALARA means do the exam with the least radiation that still gives a useful image.",
      simpleScore: 92,
      fillerFlags: [],
      jargonFlags: [],
      gapNotes: ["Add one concrete example, such as avoiding repeat images."],
      nextQuestion:
        "What is one choice a technologist can make before exposure that supports ALARA?",
      sourceRefs: [
        {
          sourceId: "src-sanitized-intro",
          chunkId: "chunk-alara",
          locator: "Demo intro notes, section 1",
          label: "ALARA note",
        },
      ],
      createdAt: "2026-05-18T09:15:00.000Z",
    },
  ],
  tutorTurns: [
    {
      id: "turn-demo-1",
      conceptId: "concept-alara",
      role: "tutor",
      content:
        "Good. Now make it even more concrete: name the patient-care benefit and the safety benefit in one sentence.",
      confidence: "source-backed",
      sourceRefs: [
        {
          sourceId: "src-sanitized-intro",
          chunkId: "chunk-alara",
          locator: "Demo intro notes, section 1",
          label: "ALARA note",
        },
      ],
    },
  ],
  quizItems: [
    {
      id: "quiz-alara-1",
      courseId: "mi-120-radiation-protection",
      conceptId: "concept-alara",
      prompt: "Which answer best captures ALARA?",
      choices: [
        "Avoid every exposure, even when imaging is needed",
        "Use the lowest reasonable exposure that still supports the clinical goal",
        "Use the same technique for every patient to stay consistent",
        "Only reduce exposure for staff, not patients",
      ],
      answer:
        "Use the lowest reasonable exposure that still supports the clinical goal",
      explanation:
        "ALARA is about optimizing exposure, not refusing needed imaging or using one fixed setting.",
      difficulty: "warmup",
      sourceRefs: [
        {
          sourceId: "src-sanitized-intro",
          chunkId: "chunk-alara",
          locator: "Demo intro notes, section 1",
          label: "ALARA note",
        },
      ],
    },
    {
      id: "quiz-dose-1",
      courseId: "mi-120-radiation-protection",
      conceptId: "concept-equivalent-effective",
      prompt:
        "A badge report is most closely tied to which patient-versus-worker distinction?",
      answer:
        "Equivalent dose is commonly used for occupational exposure reporting, while effective dose estimates overall risk using tissue sensitivity.",
      explanation:
        "The key move is separating worker monitoring from overall patient risk language.",
      difficulty: "exam",
      sourceRefs: [
        {
          sourceId: "src-sanitized-quantities",
          chunkId: "chunk-eqd-efd",
          locator: "Demo quantities grid, rows 4-5",
          label: "EqD and EfD rows",
        },
      ],
    },
    {
      id: "quiz-dap-1",
      courseId: "mi-120-radiation-protection",
      conceptId: "concept-dap",
      prompt:
        "If air kerma stays the same but the exposed field gets larger, what happens to dose area product?",
      answer: "It increases because DAP includes the exposed area.",
      explanation:
        "Dose area product combines dose and field size, so either factor can raise the total.",
      difficulty: "exam",
      sourceRefs: [
        {
          sourceId: "src-sanitized-quantities",
          chunkId: "chunk-dap",
          locator: "Demo quantities grid, row 6",
          label: "DAP row",
        },
      ],
    },
  ],
  reviewCards: [
    {
      id: "review-alara",
      courseId: "mi-120-radiation-protection",
      conceptId: "concept-alara",
      front: "Teach ALARA without using the phrase as low as reasonably achievable.",
      back: "Use only the radiation needed for a useful clinical answer.",
      dueAt: "2026-05-18T16:00:00.000Z",
      intervalDays: 1,
      ease: 2.5,
      sourceRefs: [
        {
          sourceId: "src-sanitized-intro",
          chunkId: "chunk-alara",
          locator: "Demo intro notes, section 1",
          label: "ALARA note",
        },
      ],
    },
    {
      id: "review-air-kerma",
      courseId: "mi-120-radiation-protection",
      conceptId: "concept-air-kerma",
      front: "What does air kerma measure in plain words?",
      back: "Energy transferred from the radiation beam to air.",
      dueAt: "2026-05-18T16:00:00.000Z",
      intervalDays: 1,
      ease: 2.3,
      sourceRefs: [
        {
          sourceId: "src-sanitized-quantities",
          chunkId: "chunk-air-kerma",
          locator: "Demo quantities grid, row 2",
          label: "Air kerma row",
        },
      ],
    },
    {
      id: "review-effective-dose",
      courseId: "mi-120-radiation-protection",
      conceptId: "concept-equivalent-effective",
      front: "How is effective dose different from equivalent dose?",
      back:
        "Effective dose adds tissue sensitivity to estimate overall risk; equivalent dose adjusts for radiation type.",
      dueAt: "2026-05-19T16:00:00.000Z",
      intervalDays: 2,
      ease: 2.1,
      sourceRefs: [
        {
          sourceId: "src-sanitized-quantities",
          chunkId: "chunk-eqd-efd",
          locator: "Demo quantities grid, rows 4-5",
          label: "EqD and EfD rows",
        },
      ],
    },
  ],
  sessions: [
    {
      id: "session-demo-today",
      courseId: "mi-120-radiation-protection",
      mode: "feynman",
      startedAt: "2026-05-18T09:00:00.000Z",
      minutes: 24,
      completedItemIds: ["attempt-alara-demo", "quiz-alara-1"],
      unresolvedGapIds: ["concept-air-kerma", "concept-equivalent-effective"],
    },
  ],
};

export function findConcept(conceptId: string) {
  return radiationPacket.concepts.find((concept) => concept.id === conceptId);
}

export function findSource(sourceId: string) {
  return radiationPacket.sources.find((source) => source.id === sourceId);
}
