# Architecture

Feynman Study Agent is a local-first Next.js app with source-grounded learning
objects.

## Core Contracts

- `Course` - one class or exam target.
- `SourceDocument` - one imported file or sanitized fixture.
- `SourceChunk` - citeable text extracted from a source.
- `Concept` - a learnable idea tied to source references.
- `FeynmanAttempt` - a student teach-back with gap analysis.
- `TutorTurn` - a coaching response with confidence and references.
- `QuizItem` - exam practice tied to a concept.
- `ReviewCard` - spaced review generated from concepts or gaps.
- `StudySession` - session history for progress tracking.

## Learning Loop

1. Import local sources.
2. Chunk and summarize source material.
3. Extract concepts and citeable references.
4. Ask the student to teach one concept simply.
5. Detect filler, vague language, jargon, and missing cause-effect links.
6. Ask one targeted question.
7. Create a review card or exam prompt from the gap.
8. Export the living study guide as Markdown, HTML, or JSON.

## Local Runtime

- Next.js App Router pages render from `src/lib/storage.ts`.
- SQLite is stored in `data/feynman-study-agent.sqlite` by default and can be
  moved with `FSA_DB_PATH`.
- `sql.js` keeps the app simple for local development because it has no external
  database server.
- The first production import adapters are PPTX slides and XLSX rows, with
  Markdown and text retained for sanitized fixtures.
- The tutor API retrieves relevant source chunks before model use and falls back
  to deterministic Feynman feedback when `OPENAI_API_KEY` is absent.

## API Boundaries

- `POST /api/sources` accepts local multipart imports, checks file size, parses
  source chunks, and persists generated concepts, quizzes, and review cards.
- `POST /api/tutor` accepts a concept and teach-back, retrieves source context,
  saves the attempt, and returns a cited tutor turn.
- No route writes to hosted storage, accounts, notifications, or external study
  systems in this tranche.

## Privacy Model

The public repo contains sanitized demo data only. Real course material belongs
in ignored local folders such as `imports/`, `local-sources/`, or
`course-files/`. The privacy scanner blocks known private source names, local
download paths, and commit-ready binary course files.
