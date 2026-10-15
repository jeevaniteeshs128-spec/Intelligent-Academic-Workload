# StudySync AI

StudySync AI is an implementation-ready MVP for intelligent academic workload and assignment planning. It combines a responsive React dashboard with a modular Express API, deterministic scheduling engine, local persistence, explainable priorities, document-text import, replanning, and analytics.

## Features

- Dashboard with completion, planned/actual effort, deadline risks, priorities, and upcoming work.
- Task CRUD with course, due date, estimated/actual hours, importance, complexity, status, and dependency fields.
- Deterministic scheduling that respects availability, fixed commitments, dependencies, daily limits, remaining effort, and deadlines.
- Dynamic replanning that preserves completed, locked, and past sessions and flags work that cannot fit.
- Explainable session reasons and planning insight text.
- Paste-based assignment import with candidate review and confirmation. The parser is a credential-free fallback; PDF extraction can be added behind the same `/api/import/preview` contract.
- Analytics for completion, planned vs actual hours, overloaded days, and deadline risks.
- Local JSON persistence for zero-configuration development. The store can be replaced with MongoDB behind `server/store.js` without changing API or UI contracts.

## Setup

Requirements: Node.js 18+

```bash
npm install
npm run dev
```

Open http://localhost:5173. The API runs on http://localhost:4000. Data is stored in `data/studysync.json` and is created automatically on first run.

## Environment variables

- `PORT` changes the Express port (default `4000`).
- `NODE_ENV=test` prevents the API from listening during tests.
- A future MongoDB adapter can use `MONGODB_URI`; no credentials are needed for the current local fallback.

## Tests and build

```bash
npm test
npm run build
```

The tests cover dependency order, fixed-commitment overlap prevention, daily limits, and infeasible deadline flags.
