# Trust-AI Console — Frontend (dark enterprise UI)

Polished dark-mode console for the Dell hackathon project. Three screens
(Recommendations, Detail, Audit Activity Log) plus two overlays (Ask Why,
See Alternatives) — covering all five transparency elements.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

It is **self-contained** — it does NOT need the Python API running. The data is
baked in from the backend pipeline output, and the decision queue (approve /
override / escalate → item drops off, next one appears, logged to the audit
trail) runs client-side. This makes it safe to demo on its own.

## Refreshing the data after the backend changes

From the repo root, regenerate the pipeline output, then run the converter:

```bash
python run_all.py --offline            # rebuild outputs/*.json
cd frontend
python tools/generate_data_from_backend.py   # rewrites src/app/data.ts
```

(The converter reads ../outputs/recommendations.json and activity_log.json.)

## What was changed from the original template
- Hardcoded DevOps demo data replaced with the real backend recommendations.
- Detail, Ask Why, and See Alternatives now render each recommendation's own
  reasoning, confidence, data sources, limitations, factors, and alternatives.
- The "LIVE" indicator was removed (this is a prototype, not a live system).
- Added a light/dark mode toggle in the header (sun/moon icon); defaults to dark.
- The status bar reflects the real stack (bart-mnli + LIME, prototype mode).
