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

## Privacy Model

The public repo contains sanitized demo data only. Real course material belongs
in ignored local folders such as `imports/`, `local-sources/`, or
`course-files/`. The privacy scanner blocks known private source names, local
download paths, and commit-ready binary course files.
