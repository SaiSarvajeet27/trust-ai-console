# Trust-AI Backend — Data & Model Pipeline

Backend data pipeline for the Dell hackathon project **"Designing Transparent &
Trustworthy AI Agent Interfaces."**

There is **no live server** here. The Figma prototype is the product; this repo
produces the *authentic content* that fills it and the *evidence* that the
confidence indicators come from a real model. It outputs:

- a self-consistent synthetic device fleet,
- **real** confidence scores from a pretrained Hugging Face model, mapped to
  plain-language bands,
- plain-language "Ask Why" factors derived from LIME explainability,
- fully assembled recommendation objects covering all five transparency
  elements, plus an activity log,
- a **content pack** the designers copy-paste straight into Figma frames.

---

## The five transparency elements → where each comes from

| Element | Produced by |
|---|---|
| 1. Reasoning steps (plain language) | authored in `src/scenarios.py`, real counts filled at assembly |
| 2. Confidence band (contextual, never a %) | `src/confidence.py` — real model score → band |
| 3. Data source attribution | `src/scenarios.py` + real fleet counts |
| 4. Known limitations | authored per scenario, shown where the agent is at the edge of competence |
| 5. Human-in-the-loop controls | `src/schema.py` (Approve / Override / Ask Why / See Alternatives / Escalate) |

The raw model score is recorded for your slides/README **only** — it never
appears in any user-facing string. `src/plain_language.py` scans the output and
warns if a number or jargon term leaks into a UI field.

---

## Project layout

```
trust-ai-backend/
├── run_all.py                  # run the whole pipeline in order
├── requirements.txt
├── README.md
├── src/
│   ├── config.py               # paths, fleet size, thresholds, model name
│   ├── schema.py               # the recommendation schema (the designer contract)
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
├── data/                       # generated inputs (gitignored)
└── outputs/                    # final artifacts for the designers (gitignored)
```

---

## Setup

Requires Python 3.10+.

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt
```

> **Note on size/speed:** `torch` + the `facebook/bart-large-mnli` model are a
> large first-time download and run slowly on CPU. If you're on hackathon wifi
> or short on time, use the **`--offline`** flag (below) — it produces the same
> shaped output using predefined scores and authored factors, so the designers
> are never blocked. Run the real model at least once to capture genuine scores
> for your deck.

---

## How to run (two ways)

### Option A — one command

```bash
python run_all.py              # real Hugging Face model
# or
python run_all.py --offline    # fast: predefined scores + authored factors
```

### Option B — step by step (recommended the first time)

Run from the repo root. Steps 02 and 03 accept `--offline`.

```bash
python scripts/01_generate_fleet.py
python scripts/02_classify_alerts.py            # add --offline to skip the model
python scripts/03_explain_alerts.py             # add --offline to skip LIME
python scripts/04_assemble_recommendations.py
python scripts/05_build_activity_log.py
python scripts/06_export_content_pack.py
```

What each step does and produces:

| Step | Script | Produces | Notes |
|---|---|---|---|
| 1 | `01_generate_fleet.py` | `data/fleet.json`, `data/events.csv` | 500 devices; exact cohorts so narrative counts are true |
| 2 | `02_classify_alerts.py` | `data/confidence.json` | real score per scenario → band + driver |
| 3 | `03_explain_alerts.py` | `data/explanations.json` | plain-language factors for "Ask Why" |
| 4 | `04_assemble_recommendations.py` | `outputs/recommendations.json` | full objects; runs the jargon guardrail |
| 5 | `05_build_activity_log.py` | `outputs/activity_log.json` | audit trail + a filtered (security) state |
| 6 | `06_export_content_pack.py` | `outputs/content_pack.md`, `outputs/content_pack.json` | the designer handoff |

---

## The deliverable for the designers

After a full run, hand over **`outputs/content_pack.md`**. It contains every
string for the frames — per recommendation: reasoning steps, confidence band +
driver, "Ask Why" factors, data sources, limitations, alternatives, and the
control bar — followed by the activity-log table and its filtered state.

`outputs/recommendations.json` is the structured version if anyone wants to
import it programmatically.

---

## Customizing

- **Change thresholds / fleet size / model:** `src/config.py`.
- **Add or edit a scenario:** add an entry to `SCENARIOS` in `src/scenarios.py`
  (and an `OFFLINE_SCORES` value). Use `{similar_count}`, `{patch_count}`,
  `{finance_count}` in any string and it will be filled with the real number.
- **Swap LIME for SHAP:** uncomment `shap` in `requirements.txt` and add a SHAP
  branch in `src/explain.py` mirroring `explain_with_lime`.

---

## For your slides (Transparency 25% / Innovation 15%)

Pitch the pipeline as: **Faker fleet → real Hugging Face zero-shot classifier →
LIME explainability → human translation into plain language.** The honest line
that earns points: *"our confidence labels are produced by a real model, then
deliberately translated into plain language — we never show a raw number or a
SHAP plot to the admin."*
