# Trust-AI Frontend (React + Vite + Tailwind)

A **plain, data-wired** React scaffold that renders the backend's model output:
a recommendations dashboard, a detail view with all five transparency elements,
working Approve / Override / Ask Why / See Alternatives / Escalate controls, and
an activity log. It is intentionally unstyled-to-brand — **restyle it to match
your Figma design.** The data plumbing is done; the visual layer is yours.

## Prerequisites
The backend API must be running and the pipeline data generated. From the repo
root:

```bash
python run_all.py --offline          # generates outputs/*.json
uvicorn api:app --reload --port 8000 # serves the data on :8000
```

## Run the frontend

```bash
cd frontend
npm install
npm run dev          # opens http://localhost:5173
```

The app reads the API base URL from `VITE_API_BASE` (defaults to
`http://localhost:8000`). Copy `.env.example` to `.env` to change it.

## Where to restyle
- `src/components/ConfidenceBadge.jsx` — the contextual confidence band (label + colour, never a %).
- `src/components/RecommendationCard.jsx` — dashboard list card.
- `src/components/RecommendationDetail.jsx` — the five transparency elements + control bar.
- `src/components/ActivityLog.jsx` — audit trail table.
- `src/App.jsx` — layout, nav, view switching.

## Data flow
```
App.jsx  --fetch-->  src/api.js  --HTTP-->  FastAPI (../api.py)  -->  outputs/*.json
```
Approving/overriding/escalating POSTs back to the API, which updates status and
appends an activity-log entry, so the human-in-the-loop loop is live in the demo.
