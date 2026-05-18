# Feynman Study Agent

An open-source study and exam-prep web app for students who want a tutor that
checks whether they can explain a concept in simple language.

The first demo packet is a sanitized radiography/radiation-protection course
covering ALARA, time-distance-shielding, air kerma, absorbed dose, equivalent
dose, effective dose, dose area product, and population dose.

## What It Does

- Imports class sources locally and keeps real course files out of Git.
- Turns source chunks into concepts, review cards, quizzes, and Markdown.
- Coaches a Feynman teach-back loop: explain simply, find gaps, ask one
  question, and generate targeted practice.
- Shows source references for source-backed claims.
- Exports clean Markdown, standalone HTML, and JSON.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

`OPENAI_API_KEY` is optional for local development. Without it, the tutor uses a
deterministic Feynman feedback loop so the app remains usable and testable.

## Safety Defaults

Real course files are import-only. Do not commit slides, spreadsheets, books,
screenshots, private notes, or local evidence. The repo includes:

```bash
npm run privacy:scan
npm run guard:no-external
npm run validate:repo
npm run precommit:check
npm run verify:prod
```

Imported chunks and generated study state live in ignored SQLite files under
`data/` by default. Set `FSA_DB_PATH` in `.env.local` to use another local path.

## Development

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Project Shape

- `src/app` - Next.js App Router pages.
- `src/lib/types.ts` - core data contracts.
- `src/lib/sample-data.ts` - sanitized demo course packet.
- `src/lib/feynman.ts` - teach-back scoring and tutor turn logic.
- `src/lib/ingestion.ts` - local import helpers.
- `src/lib/storage.ts` - local SQLite persistence.
- `src/lib/retrieval.ts` - source chunk retrieval for tutor context.
- `src/lib/tutor-service.ts` - OpenAI-backed tutor with deterministic fallback.
- `src/lib/exports.ts` - Markdown, HTML, and JSON export helpers.
- `docs/research-prompt.md` - Deep Research prompt for product and competitor
  research.
- `docs/local-first-runbook.md` - local setup, import proof, and release gate.

## License

Apache-2.0
