import fs from "node:fs/promises";
import path from "node:path";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import { radiationPacket } from "./sample-data";
import { buildStudyArtifacts, type GeneratedStudyArtifacts } from "./study-engine";
import type {
  Concept,
  Course,
  CoursePacket,
  FeynmanAttempt,
  QuizItem,
  ReviewCard,
  SourceChunk,
  SourceDocument,
  StudySession,
  TutorTurn,
} from "./types";

const defaultCourseId = "mi-120-radiation-protection";
let sqlPromise: Promise<SqlJsStatic> | null = null;
let dbPromise: Promise<Database> | null = null;

export function getDefaultCourseId() {
  return defaultCourseId;
}

export async function getDefaultCoursePacket() {
  return getCoursePacket(defaultCourseId);
}

export async function getCoursePacket(courseId: string): Promise<CoursePacket> {
  const db = await getDb();
  const courseRow = first<Row>(db, "SELECT * FROM courses WHERE id = $id", {
    $id: courseId,
  });

  if (!courseRow) {
    throw new Error(`Course not found: ${courseId}`);
  }

  const sources = all<Row>(db, "SELECT * FROM sources ORDER BY added_at ASC").map(
    rowToSource,
  );
  const chunks = all<Row>(db, "SELECT * FROM chunks ORDER BY order_index ASC").map(
    rowToChunk,
  );
  const concepts = all<Row>(
    db,
    "SELECT * FROM concepts WHERE course_id = $courseId ORDER BY title ASC",
    { $courseId: courseId },
  ).map(rowToConcept);
  const quizItems = all<Row>(
    db,
    "SELECT * FROM quiz_items WHERE course_id = $courseId ORDER BY id ASC",
    { $courseId: courseId },
  ).map(rowToQuizItem);
  const reviewCards = all<Row>(
    db,
    "SELECT * FROM review_cards WHERE course_id = $courseId ORDER BY due_at ASC",
    { $courseId: courseId },
  ).map(rowToReviewCard);
  const attempts = all<Row>(db, "SELECT * FROM attempts ORDER BY created_at DESC").map(
    rowToAttempt,
  );
  const tutorTurns = all<Row>(db, "SELECT * FROM tutor_turns ORDER BY id ASC").map(
    rowToTutorTurn,
  );
  const sessions = all<Row>(
    db,
    "SELECT * FROM sessions WHERE course_id = $courseId ORDER BY started_at DESC",
    { $courseId: courseId },
  ).map(rowToSession);

  return {
    course: {
      ...rowToCourse(courseRow),
      sourceIds: sources.map((source) => source.id),
      conceptIds: concepts.map((concept) => concept.id),
      quizItemIds: quizItems.map((item) => item.id),
      reviewCardIds: reviewCards.map((card) => card.id),
    },
    sources,
    chunks,
    concepts,
    attempts,
    tutorTurns,
    quizItems,
    reviewCards,
    sessions,
  };
}

export async function importSourceIntoCourse(input: {
  courseId?: string;
  source: SourceDocument;
  chunks: SourceChunk[];
  now?: string;
}) {
  const courseId = input.courseId ?? defaultCourseId;
  const db = await getDb();
  const artifacts = buildStudyArtifacts({
    courseId,
    source: input.source,
    chunks: input.chunks,
    now: input.now,
  });

  upsertSource(db, input.source);
  for (const chunk of input.chunks) {
    upsertChunk(db, chunk);
  }
  upsertArtifacts(db, artifacts);
  await persistDb(db);

  return artifacts;
}

export async function saveTutorExchange(input: {
  attempt: FeynmanAttempt;
  turn: TutorTurn;
}) {
  const db = await getDb();
  upsertAttempt(db, input.attempt);
  upsertTutorTurn(db, input.turn);
  await persistDb(db);
}

export async function resetDatabaseForTests(filePath: string) {
  process.env.FSA_DB_PATH = filePath;
  dbPromise = null;
  await fs.rm(filePath, { force: true }).catch(() => undefined);
}

async function getDb() {
  if (!dbPromise) {
    dbPromise = openDb();
  }
  return dbPromise;
}

async function openDb() {
  const SQL = await getSql();
  const dbPath = getDbPath();
  await fs.mkdir(path.dirname(dbPath), { recursive: true });

  const existing = await fs.readFile(dbPath).catch(() => null);
  const db = existing ? new SQL.Database(existing) : new SQL.Database();
  migrate(db);

  const courseCount = Number(
    first(db, "SELECT COUNT(*) as count FROM courses")?.count ?? 0,
  );
  if (!courseCount) {
    saveCoursePacket(db, radiationPacket);
    await persistDb(db);
  }

  return db;
}

async function getSql() {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: (file) =>
        path.join(
          /* turbopackIgnore: true */ process.cwd(),
          "node_modules",
          "sql.js",
          "dist",
          file,
        ),
    });
  }
  return sqlPromise;
}

function getDbPath() {
  const configured = process.env.FSA_DB_PATH ?? "./data/feynman-study-agent.sqlite";
  return path.isAbsolute(configured)
    ? configured
    : path.join(/* turbopackIgnore: true */ process.cwd(), configured);
}

function migrate(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      term TEXT NOT NULL,
      description TEXT NOT NULL,
      exam_focus TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      kind TEXT NOT NULL,
      status TEXT NOT NULL,
      added_at TEXT NOT NULL,
      summary TEXT NOT NULL,
      chunk_ids TEXT NOT NULL,
      privacy TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      heading TEXT NOT NULL,
      text TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      locator TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS concepts (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      plain_language TEXT NOT NULL,
      why_it_matters TEXT NOT NULL,
      prerequisites TEXT NOT NULL,
      source_refs TEXT NOT NULL,
      mastery REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      concept_id TEXT NOT NULL,
      student_explanation TEXT NOT NULL,
      simple_score INTEGER NOT NULL,
      filler_flags TEXT NOT NULL,
      jargon_flags TEXT NOT NULL,
      gap_notes TEXT NOT NULL,
      next_question TEXT NOT NULL,
      source_refs TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tutor_turns (
      id TEXT PRIMARY KEY,
      concept_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      confidence TEXT NOT NULL,
      source_refs TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS quiz_items (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      concept_id TEXT NOT NULL,
      prompt TEXT NOT NULL,
      choices TEXT NOT NULL,
      answer TEXT NOT NULL,
      explanation TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      source_refs TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS review_cards (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      concept_id TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      due_at TEXT NOT NULL,
      interval_days INTEGER NOT NULL,
      ease REAL NOT NULL,
      source_refs TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      mode TEXT NOT NULL,
      started_at TEXT NOT NULL,
      minutes INTEGER NOT NULL,
      completed_item_ids TEXT NOT NULL,
      unresolved_gap_ids TEXT NOT NULL
    );
  `);
}

function saveCoursePacket(db: Database, packet: CoursePacket) {
  upsertCourse(db, packet.course);
  for (const source of packet.sources) upsertSource(db, source);
  for (const chunk of packet.chunks) upsertChunk(db, chunk);
  for (const concept of packet.concepts) upsertConcept(db, concept);
  for (const attempt of packet.attempts) upsertAttempt(db, attempt);
  for (const turn of packet.tutorTurns) upsertTutorTurn(db, turn);
  for (const item of packet.quizItems) upsertQuizItem(db, item);
  for (const card of packet.reviewCards) upsertReviewCard(db, card);
  for (const session of packet.sessions) upsertSession(db, session);
}

function upsertArtifacts(db: Database, artifacts: GeneratedStudyArtifacts) {
  for (const concept of artifacts.concepts) upsertConcept(db, concept);
  for (const item of artifacts.quizItems) upsertQuizItem(db, item);
  for (const card of artifacts.reviewCards) upsertReviewCard(db, card);
}

function upsertCourse(db: Database, course: Course) {
  run(
    db,
    `INSERT OR REPLACE INTO courses (id, title, term, description, exam_focus)
     VALUES ($id, $title, $term, $description, $exam_focus)`,
    {
      $id: course.id,
      $title: course.title,
      $term: course.term,
      $description: course.description,
      $exam_focus: json(course.examFocus),
    },
  );
}

function upsertSource(db: Database, source: SourceDocument) {
  run(
    db,
    `INSERT OR REPLACE INTO sources (id, title, kind, status, added_at, summary, chunk_ids, privacy)
     VALUES ($id, $title, $kind, $status, $added_at, $summary, $chunk_ids, $privacy)`,
    {
      $id: source.id,
      $title: source.title,
      $kind: source.kind,
      $status: source.status,
      $added_at: source.addedAt,
      $summary: source.summary,
      $chunk_ids: json(source.chunkIds),
      $privacy: source.privacy,
    },
  );
}

function upsertChunk(db: Database, chunk: SourceChunk) {
  run(
    db,
    `INSERT OR REPLACE INTO chunks (id, source_id, heading, text, order_index, locator)
     VALUES ($id, $source_id, $heading, $text, $order_index, $locator)`,
    {
      $id: chunk.id,
      $source_id: chunk.sourceId,
      $heading: chunk.heading,
      $text: chunk.text,
      $order_index: chunk.order,
      $locator: chunk.locator,
    },
  );
}

function upsertConcept(db: Database, concept: Concept) {
  run(
    db,
    `INSERT OR REPLACE INTO concepts (id, course_id, title, plain_language, why_it_matters, prerequisites, source_refs, mastery)
     VALUES ($id, $course_id, $title, $plain_language, $why_it_matters, $prerequisites, $source_refs, $mastery)`,
    {
      $id: concept.id,
      $course_id: concept.courseId,
      $title: concept.title,
      $plain_language: concept.plainLanguage,
      $why_it_matters: concept.whyItMatters,
      $prerequisites: json(concept.prerequisites),
      $source_refs: json(concept.sourceRefs),
      $mastery: concept.mastery,
    },
  );
}

function upsertAttempt(db: Database, attempt: FeynmanAttempt) {
  run(
    db,
    `INSERT OR REPLACE INTO attempts (id, concept_id, student_explanation, simple_score, filler_flags, jargon_flags, gap_notes, next_question, source_refs, created_at)
     VALUES ($id, $concept_id, $student_explanation, $simple_score, $filler_flags, $jargon_flags, $gap_notes, $next_question, $source_refs, $created_at)`,
    {
      $id: attempt.id,
      $concept_id: attempt.conceptId,
      $student_explanation: attempt.studentExplanation,
      $simple_score: attempt.simpleScore,
      $filler_flags: json(attempt.fillerFlags),
      $jargon_flags: json(attempt.jargonFlags),
      $gap_notes: json(attempt.gapNotes),
      $next_question: attempt.nextQuestion,
      $source_refs: json(attempt.sourceRefs),
      $created_at: attempt.createdAt,
    },
  );
}

function upsertTutorTurn(db: Database, turn: TutorTurn) {
  run(
    db,
    `INSERT OR REPLACE INTO tutor_turns (id, concept_id, role, content, confidence, source_refs)
     VALUES ($id, $concept_id, $role, $content, $confidence, $source_refs)`,
    {
      $id: turn.id,
      $concept_id: turn.conceptId,
      $role: turn.role,
      $content: turn.content,
      $confidence: turn.confidence,
      $source_refs: json(turn.sourceRefs),
    },
  );
}

function upsertQuizItem(db: Database, item: QuizItem) {
  run(
    db,
    `INSERT OR REPLACE INTO quiz_items (id, course_id, concept_id, prompt, choices, answer, explanation, difficulty, source_refs)
     VALUES ($id, $course_id, $concept_id, $prompt, $choices, $answer, $explanation, $difficulty, $source_refs)`,
    {
      $id: item.id,
      $course_id: item.courseId,
      $concept_id: item.conceptId,
      $prompt: item.prompt,
      $choices: json(item.choices ?? []),
      $answer: item.answer,
      $explanation: item.explanation,
      $difficulty: item.difficulty,
      $source_refs: json(item.sourceRefs),
    },
  );
}

function upsertReviewCard(db: Database, card: ReviewCard) {
  run(
    db,
    `INSERT OR REPLACE INTO review_cards (id, course_id, concept_id, front, back, due_at, interval_days, ease, source_refs)
     VALUES ($id, $course_id, $concept_id, $front, $back, $due_at, $interval_days, $ease, $source_refs)`,
    {
      $id: card.id,
      $course_id: card.courseId,
      $concept_id: card.conceptId,
      $front: card.front,
      $back: card.back,
      $due_at: card.dueAt,
      $interval_days: card.intervalDays,
      $ease: card.ease,
      $source_refs: json(card.sourceRefs),
    },
  );
}

function upsertSession(db: Database, session: StudySession) {
  run(
    db,
    `INSERT OR REPLACE INTO sessions (id, course_id, mode, started_at, minutes, completed_item_ids, unresolved_gap_ids)
     VALUES ($id, $course_id, $mode, $started_at, $minutes, $completed_item_ids, $unresolved_gap_ids)`,
    {
      $id: session.id,
      $course_id: session.courseId,
      $mode: session.mode,
      $started_at: session.startedAt,
      $minutes: session.minutes,
      $completed_item_ids: json(session.completedItemIds),
      $unresolved_gap_ids: json(session.unresolvedGapIds),
    },
  );
}

async function persistDb(db: Database) {
  await fs.writeFile(getDbPath(), Buffer.from(db.export()));
}

type Row = Record<string, string | number | null>;
type SqlParam = string | number | Uint8Array | null;
type SqlParams = Record<string, SqlParam>;

function all<T = Row>(db: Database, sql: string, params: SqlParams = {}) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

function first<T = Row>(db: Database, sql: string, params: SqlParams = {}) {
  return all<T>(db, sql, params)[0];
}

function run(db: Database, sql: string, params: SqlParams) {
  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
}

function rowToCourse(row: Row): Course {
  return {
    id: String(row.id),
    title: String(row.title),
    term: String(row.term),
    description: String(row.description),
    examFocus: parseJson<string[]>(row.exam_focus, []),
    sourceIds: [],
    conceptIds: [],
    quizItemIds: [],
    reviewCardIds: [],
  };
}

function rowToSource(row: Row): SourceDocument {
  return {
    id: String(row.id),
    title: String(row.title),
    kind: row.kind as SourceDocument["kind"],
    status: row.status as SourceDocument["status"],
    addedAt: String(row.added_at),
    summary: String(row.summary),
    chunkIds: parseJson<string[]>(row.chunk_ids, []),
    privacy: row.privacy as SourceDocument["privacy"],
  };
}

function rowToChunk(row: Row): SourceChunk {
  return {
    id: String(row.id),
    sourceId: String(row.source_id),
    heading: String(row.heading),
    text: String(row.text),
    order: Number(row.order_index),
    locator: String(row.locator),
  };
}

function rowToConcept(row: Row): Concept {
  return {
    id: String(row.id),
    courseId: String(row.course_id),
    title: String(row.title),
    plainLanguage: String(row.plain_language),
    whyItMatters: String(row.why_it_matters),
    prerequisites: parseJson(row.prerequisites, []),
    sourceRefs: parseJson(row.source_refs, []),
    mastery: Number(row.mastery),
  };
}

function rowToAttempt(row: Row): FeynmanAttempt {
  return {
    id: String(row.id),
    conceptId: String(row.concept_id),
    studentExplanation: String(row.student_explanation),
    simpleScore: Number(row.simple_score),
    fillerFlags: parseJson(row.filler_flags, []),
    jargonFlags: parseJson(row.jargon_flags, []),
    gapNotes: parseJson(row.gap_notes, []),
    nextQuestion: String(row.next_question),
    sourceRefs: parseJson(row.source_refs, []),
    createdAt: String(row.created_at),
  };
}

function rowToTutorTurn(row: Row): TutorTurn {
  return {
    id: String(row.id),
    conceptId: String(row.concept_id),
    role: row.role as TutorTurn["role"],
    content: String(row.content),
    confidence: row.confidence as TutorTurn["confidence"],
    sourceRefs: parseJson(row.source_refs, []),
  };
}

function rowToQuizItem(row: Row): QuizItem {
  return {
    id: String(row.id),
    courseId: String(row.course_id),
    conceptId: String(row.concept_id),
    prompt: String(row.prompt),
    choices: parseJson(row.choices, []),
    answer: String(row.answer),
    explanation: String(row.explanation),
    difficulty: row.difficulty as QuizItem["difficulty"],
    sourceRefs: parseJson(row.source_refs, []),
  };
}

function rowToReviewCard(row: Row): ReviewCard {
  return {
    id: String(row.id),
    courseId: String(row.course_id),
    conceptId: String(row.concept_id),
    front: String(row.front),
    back: String(row.back),
    dueAt: String(row.due_at),
    intervalDays: Number(row.interval_days),
    ease: Number(row.ease),
    sourceRefs: parseJson(row.source_refs, []),
  };
}

function rowToSession(row: Row): StudySession {
  return {
    id: String(row.id),
    courseId: String(row.course_id),
    mode: row.mode as StudySession["mode"],
    startedAt: String(row.started_at),
    minutes: Number(row.minutes),
    completedItemIds: parseJson(row.completed_item_ids, []),
    unresolvedGapIds: parseJson(row.unresolved_gap_ids, []),
  };
}

function json(value: unknown) {
  return JSON.stringify(value);
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
