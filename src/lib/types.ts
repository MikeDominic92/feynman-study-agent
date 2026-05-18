export type ConfidenceLevel = "source-backed" | "inferred" | "unknown";

export type ReviewRating = "again" | "hard" | "good" | "easy";

export type SourceKind =
  | "pptx"
  | "xlsx"
  | "pdf"
  | "docx"
  | "markdown"
  | "text"
  | "syllabus"
  | "assignment";

export interface SourceReference {
  sourceId: string;
  chunkId?: string;
  locator: string;
  label: string;
}

export interface SourceChunk {
  id: string;
  sourceId: string;
  heading: string;
  text: string;
  order: number;
  locator: string;
}

export interface SourceDocument {
  id: string;
  title: string;
  kind: SourceKind;
  status: "ready" | "needs-review" | "unsupported";
  addedAt: string;
  summary: string;
  chunkIds: string[];
  privacy: "sanitized-demo" | "local-import-only";
}

export interface Concept {
  id: string;
  courseId: string;
  title: string;
  plainLanguage: string;
  whyItMatters: string;
  prerequisites: string[];
  sourceRefs: SourceReference[];
  mastery: number;
}

export interface FeynmanAttempt {
  id: string;
  conceptId: string;
  studentExplanation: string;
  simpleScore: number;
  fillerFlags: string[];
  jargonFlags: string[];
  gapNotes: string[];
  nextQuestion: string;
  sourceRefs: SourceReference[];
  createdAt: string;
}

export interface TutorTurn {
  id: string;
  conceptId: string;
  role: "student" | "tutor";
  content: string;
  confidence: ConfidenceLevel;
  sourceRefs: SourceReference[];
}

export interface QuizItem {
  id: string;
  courseId: string;
  conceptId: string;
  prompt: string;
  choices?: string[];
  answer: string;
  explanation: string;
  difficulty: "warmup" | "exam" | "challenge";
  sourceRefs: SourceReference[];
}

export interface ReviewCard {
  id: string;
  courseId: string;
  conceptId: string;
  front: string;
  back: string;
  dueAt: string;
  intervalDays: number;
  ease: number;
  sourceRefs: SourceReference[];
}

export interface StudySession {
  id: string;
  courseId: string;
  mode: "feynman" | "exam" | "review" | "source-audit";
  startedAt: string;
  minutes: number;
  completedItemIds: string[];
  unresolvedGapIds: string[];
}

export interface Course {
  id: string;
  title: string;
  term: string;
  description: string;
  examFocus: string[];
  sourceIds: string[];
  conceptIds: string[];
  quizItemIds: string[];
  reviewCardIds: string[];
}

export interface CoursePacket {
  course: Course;
  sources: SourceDocument[];
  chunks: SourceChunk[];
  concepts: Concept[];
  attempts: FeynmanAttempt[];
  tutorTurns: TutorTurn[];
  quizItems: QuizItem[];
  reviewCards: ReviewCard[];
  sessions: StudySession[];
}
