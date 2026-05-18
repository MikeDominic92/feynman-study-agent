# Local-First Runbook

This app is production-ready for a local MVP: a student runs it on their own
machine, imports course files locally, and keeps the generated database out of
Git.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add `OPENAI_API_KEY` only if live model coaching is needed.
4. Start the app with `npm run dev`.
5. Open `http://localhost:3000`.

Without an API key, the tutor uses deterministic local Feynman feedback so tests
and demos still work.

## Import Proof

Use `/sources` to import sanitized or private local files. The first production
adapters are:

- PPTX: one source chunk per readable slide.
- XLSX: one source chunk per readable sheet row.
- Markdown and text: one source chunk per paragraph section.

The imported source file itself is never copied into Git. Parsed chunks, study
artifacts, tutor attempts, and exports are stored in the ignored SQLite database
under `data/` unless `FSA_DB_PATH` points somewhere else.

## Study Proof

After importing:

1. Open `/courses` to confirm source and concept counts changed.
2. Open `/tutor` and submit one plain-language teach-back.
3. Open `/exam` to review generated quiz items.
4. Open `/review` to see generated review cards.
5. Open `/exports` to preview Markdown, standalone HTML, and JSON exports.

## Release Gate

Run the full local gate before pushing:

```bash
npm run verify:prod
```

That command includes the privacy scan, no-write guard, repo validator, lint,
typecheck, tests, production build, and dependency audit.

## Privacy Boundary

Never commit source binaries, private notes, generated local databases, local
exports, or copied course material. The public repo should contain source code,
sanitized fixtures, docs, and deterministic tests only.
