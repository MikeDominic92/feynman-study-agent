# Production-Ready Local-First MVP

## Objective

Make `feynman-study-agent` production-ready as a local-first MVP that can import local PPTX and XLSX course files, persist them in a local SQLite database, produce source-grounded study artifacts, and prove the end-to-end learning loop without committing private course material.

## Original Request

Implement the production-ready local-first MVP plan: create a GoalBuddy board, add SQLite persistence, PPTX/XLSX ingestion, retrieval, OpenAI tutor API with local key, real data UI wiring, CI/docs/privacy hardening, and final proof.

## Intake Summary

- Input shape: `existing_plan`
- Audience: local students and open-source contributors running the app on their own machine
- Authority: `approved`
- Proof type: `demo`
- Completion proof: A local PPTX and XLSX import produces persisted source chunks, concepts, tutor context, review cards, quizzes, and Markdown/HTML/JSON exports; `npm run precommit:check`, `npm run build`, and audit pass; private course files remain out of Git.
- Likely misfire: shipping a prettier scaffold or static demo while calling it production-ready.
- Blind spots considered: local-only privacy, file parser determinism, no cloud/accounts in tranche, OpenAI key optionality for tests, and avoiding committed course binaries.
- Existing plan facts: local-first MVP, PPTX + XLSX first, SQLite local DB, OpenAI API via `.env.local`, no hosted accounts/cloud/payments/collaboration/mobile native apps.

## Goal Kind

`existing_plan`

## Current Tranche

Continuous execution until the local-first MVP is complete: create the board, validate current architecture, implement persistence and ingestion, connect the app to real local data, harden safety/docs/CI, and finish with a final production-readiness audit.

## Non-Negotiable Constraints

- Do not commit real course files, screenshots, books, private notes, or local imports.
- Keep imported course files local-only and ignored by Git.
- Keep hosted auth, accounts, cloud storage, payments, collaboration, public uploads, and mobile native apps out of scope.
- Use source references for source-backed claims.
- Keep OpenAI API usage behind a local environment key and deterministic fallback behavior for tests.
- Run privacy, no-write, repo validation, lint, typecheck, test, build, and audit before completion.

## Stop Rule

Stop only when a final audit proves the full original outcome is complete.

Do not stop after planning, discovery, or Judge selection if a safe Worker task can be activated.

Do not stop after a single verified Worker slice when the broader owner outcome still has safe local follow-up slices.

Do not stop because OpenAI credentials are absent; keep deterministic local fallback and document `.env.local` setup.

## Canonical Board

Machine truth lives at:

`docs/goals/production-ready-local-first-mvp/state.yaml`

If this charter and `state.yaml` disagree, `state.yaml` wins for task status, active task, receipts, verification freshness, and completion truth.

## Run Command

```text
/goal Follow docs/goals/production-ready-local-first-mvp/goal.md.
```

## PM Loop

On every continuation:

1. Read this charter.
2. Read `state.yaml`.
3. Work only on the active board task.
4. Write a compact task receipt.
5. Update the board.
6. Advance to the next safe task until final audit proves completion.
