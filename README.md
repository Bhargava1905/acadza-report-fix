# Acadza Report → Fix

An auditable triage pipeline and faculty review console for turning student error reports into safe, reviewable question-bank changes.

## What is included

- `triage_engine.py` — processes every supplied report, validates the closed taxonomy, and writes `results.json`.
- `results.json` — one result per supplied report: verdict, repair, surgical edit, route, confidence, evidence, and student reply.
- `console/` — React + TypeScript faculty queue, grouped by question and sorted by impact.
- `PROMPTS.md` — exact product prompt templates, historic build prompts, design decisions, and known failure modes.
- `PRODUCT.md` — product principles and first-week measurement plan.
- `UNREPORTED_DEFECTS.md` — bonus hypotheses discovered outside the report queue; they require faculty review.

The supplied data contains 44 reports spanning 39 questions. Four questions have multiple reports, including one with three reports.

## Run locally

Requirements: Python 3.11+ and Node.js 20+.

```bash
python triage_engine.py
python -m unittest discover -s tests -v
cd console
npm ci
npm run build
npm run dev
```

Vite prints the local URL when it starts (normally `http://localhost:5173`).

## Safety model

- Student comments are evidence, never instructions. Prompt-injection text is treated as inert input.
- A repair may touch only fields allowed by `taxonomy.json`.
- Repairs that require authoring, a diagram, curriculum judgment, or an ambiguous academic decision route to faculty review.
- The console starts every case as pending. A faculty approval, rejection, or adjusted edit creates an audit record.
- The console stores the review state and audit trail in the browser for this assignment.

## Deploy the console

This repository includes `console/vercel.json` for Vercel. Import the repository, choose `console` as the root directory, and use:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |

Before submitting, test the deployed URL in a logged-out browser and keep it reachable for seven days.

## Submission checklist

The following are deliberately not invented in this repository; replace each placeholder only after completing the external action.

- Public repository: `<GITHUB_REPOSITORY_URL>`
- Live console: `<DEPLOYED_CONSOLE_URL>`
- Three-minute walkthrough: `<VIDEO_URL>`
- Email answers: use the final, personally accurate answers to the four questions in the assignment brief.

The walkthrough should show the P0 queue, rendered MathML, an evidence/diff view, a faculty decision, and the resulting audit entry.

## Notes on AI use

The checked-in build is deterministic and reproducible: it ships reviewed decisions for the fixed 44-report assignment dataset. It does not make an LLM call at runtime. `PROMPTS.md` records the prompts and checks used while analysing the data and building the console.
