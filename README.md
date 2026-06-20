# Trust-AI Console

Dell hackathon project — **"Designing Transparent & Trustworthy AI Agent Interfaces."**

An IT-admin console where an AI agent recommends actions on a device fleet, but every recommendation is **legible and accountable**: it shows its reasoning, how confident it is and why, what data it's based on, where it might be wrong, and gives the admin full control (approve / override / escalate).

The project has three parts:

1. **Pipeline** (`src/`, `scripts/`) — generates a synthetic device fleet and produces real model-backed content (confidence + explanations) in plain language.
2. **API** (`api.py`) — a FastAPI layer that serves that content to the UI and records the admin's decisions.
3. **Frontend** (`frontend/`) — a React app that renders the screens. (The judged UI is designed in **Figma**; this React app is the working implementation of that design.)

---

## Quick start 

```bash
git clone https://github.com/SaiSarvajeet27/trust-ai-console.git
cd trust-ai-console
```

You need **Python 3.10+** and **Node.js 18+**. Then run the two parts.

### 1. Backend (pipeline + API) — terminal A

```bash
python -m venv .venv
.venv\Scripts\activate            # Windows
# source .venv/bin/activate       # macOS / Linux

pip install -r requirements.txt

python run_all.py --offline       # generate the data (fast, no model download)
uvicorn api:app --reload --port 8000
```

Leave that running. Check it works: open http://localhost:8000/api/health (should report the recommendations loaded) or http://localhost:8000/docs.

### 2. Frontend — terminal B

```bash
cd frontend
npm install
npm run dev                       # opens http://localhost:5173
```

Open http://localhost:5173 and you'll see the console with live data.

> **Tip:** `--offline` uses predefined scores so nobody is blocked by a slow download. Run `python run_all.py` (without `--offline`) at least once to get genuine Hugging Face model scores for the demo/deck.

---

## Project layout

```
trust-ai-console/
├── run_all.py                  # run the whole pipeline in order
├── api.py                      # FastAPI layer (serves data, records decisions)
├── requirements.txt
├── README.md
├── src/
│   ├── config.py               # paths, fleet size, thresholds, model name
│   ├── schema.py               # the recommendation schema (the data contract)
│   ├── scenarios.py            # the 3 scenarios: authored content + model params
│   ├── fleet.py                # Faker fleet generation (exact-count cohorts)
│   ├── confidence.py           # zero-shot classifier + score→band mapping
│   ├── explain.py              # LIME → plain-language factors (with fallback)
│   └── plain_language.py       # jargon/number guardrail
├── scripts/
│   ├── 01_generate_fleet.py
│   ├── 02_classify_alerts.py
│   ├── 03_explain_alerts.py
│   ├── 04_assemble_recommendations.py
│   ├── 05_build_activity_log.py
│   └── 06_export_content_pack.py
├── frontend/                   # React + Vite + Tailwind app
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── api.js              # fetch layer -> talks to api.py
│       └── components/         # ConfidenceBadge, RecommendationCard, etc.
├── data/                       # generated inputs (gitignored)
└── outputs/                    # final artifacts for the designers (gitignored)
```

---

## How it fits together

```
Pipeline (scripts/)  ->  outputs/*.json  ->  FastAPI (api.py)  ->  React (frontend/)  ->  IT admin
                                                   ^                                          |
                                                   |________ decision (approve/override) _____|
```

The pipeline builds the content, the API serves it and records decisions, the React app renders it, and the admin's decision loops back into the API and the activity log.

---

## The five transparency elements → where each comes from

| Element | Produced by |
|---|---|
| 1. Reasoning steps (plain language) | authored in `src/scenarios.py`, real counts filled at assembly |
| 2. Confidence band (contextual, never a %) | `src/confidence.py` — real model score → band |
| 3. Data source attribution | `src/scenarios.py` + real fleet counts |
| 4. Known limitations | authored per scenario, shown where the agent is at the edge of competence |
| 5. Human-in-the-loop controls | `src/schema.py` (Approve / Override / Ask Why / See Alternatives / Escalate) |

The raw model score is recorded for the slides/README **only** — it never appears in any user-facing string. `src/plain_language.py` scans the output and warns if a number or jargon term leaks into a UI field.

---

## Running the pipeline step by step

`run_all.py` runs all of these in order. To run them individually (steps 02 and 03 accept `--offline`):

| Step | Script | Produces |
|---|---|---|
| 1 | `01_generate_fleet.py` | `data/fleet.json`, `data/events.csv` — 500 devices, exact cohorts so the narrative counts are true |
| 2 | `02_classify_alerts.py` | `data/confidence.json` — real score per scenario → band + driver |
| 3 | `03_explain_alerts.py` | `data/explanations.json` — plain-language factors for "Ask Why" |
| 4 | `04_assemble_recommendations.py` | `outputs/recommendations.json` — full objects; runs the jargon guardrail |
| 5 | `05_build_activity_log.py` | `outputs/activity_log.json` — audit trail + a filtered (security) state |
| 6 | `06_export_content_pack.py` | `outputs/content_pack.md` / `.json` — the designer handoff |

---

## API endpoints (`api.py`)

| Method | Path | Returns |
|---|---|---|
| GET | `/api/recommendations` | all recommendation objects |
| GET | `/api/recommendations/{id}` | one recommendation |
| POST | `/api/recommendations/{id}/decision` | record Approve/Override/Escalate, append to log |
| GET | `/api/activity-log` | audit trail (`all` + `filtered_security`) |
| GET | `/api/fleet/summary` | dashboard header stats |
| GET | `/api/health` | liveness check |

---

## The deliverable for the designers

After a full run, hand over **`outputs/content_pack.md`** — every string for the Figma frames: per recommendation the reasoning steps, confidence band + driver, "Ask Why" factors, data sources, limitations, alternatives, and the control bar, followed by the activity-log table and its filtered state. The React components in `frontend/src/components/` are a plain, data-wired implementation to restyle to match the Figma design.
