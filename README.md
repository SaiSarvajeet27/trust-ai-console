# Trust-AI: Full-Stack Console & Data Pipeline

This is the codebase for the Dell hackathon project **"Designing Transparent & Trustworthy AI Agent Interfaces."**

This repository contains:
1. A **data and ML pipeline** that generates synthetic telemetry and authentic Hugging Face/LIME model explanations.
2. A **FastAPI backend** that serves this data and handles JWT Authentication (Email/Password & Google Sign-In).
3. An **interactive React dashboard** that visualizes the AI's recommendations, reasoning, and transparency features, gated by a modern glassmorphism Auth UI.

---

## 🚀 Quick Start: How to Run the Project

You need three terminal tabs to run the full stack: the Data Pipeline, the Backend API, and the Frontend Console.

### 1. Setup & Generate Data
The backend relies on synthetic fleet data and real model explanations.

```bash
# Create and activate a virtual environment
python -m venv .venv
# Mac/Linux: source .venv/bin/activate
# Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Generate the data (Fast offline mode)
python run_all.py --offline
```
> **Note on size/speed:** `torch` + the `facebook/bart-large-mnli` model are a large first-time download and run slowly on CPU. If you're on hackathon wifi, use the `--offline` flag. Run without `--offline` at least once to capture genuine scores.

### 2. Run the Backend API (FastAPI)
The backend serves the generated data and KPIs to the frontend.

```bash
# Ensure your virtual environment is activated
uvicorn api:app --port 8001
```

### 3. Run the Frontend Console (React/Vite)
The interactive interface for the IT Administrator.

```bash
# In a new terminal tab:
cd frontend
npm install
npm run dev
```

**Environment Setup:** To enable Google Sign-In locally, create a `frontend/.env` file with your Google Client ID:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Navigate to `http://localhost:5173` in your browser.

---

## 🧠 The five transparency elements → where each comes from

| Element | Produced by |
|---|---|
| 1. Reasoning steps (plain language) | authored in `src/scenarios.py`, real counts filled at assembly |
| 2. Confidence band (contextual, never a %) | `src/confidence.py` — real model score → band |
| 3. Data source attribution | `src/scenarios.py` + real fleet counts |
| 4. Known limitations | authored per scenario, shown where the agent is at the edge of competence |
| 5. Human-in-the-loop controls | `src/schema.py` / React UI (Approve / Override / Ask Why / See Alternatives / Escalate) |

The raw model score is recorded for your slides/README **only** — it never appears in any user-facing string. `src/plain_language.py` scans the output and warns if a number or jargon term leaks into a UI field.

---

## 📂 Project layout

```
trust-ai-backend/
├── api.py                      # FastAPI backend serving the Dashboard
├── frontend/                   # React/Vite interactive frontend
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
└── outputs/                    # final artifacts served by the API (gitignored)
```

---

## ⚙️ How to run the Data Pipeline step-by-step

Run from the repo root. Steps 02 and 03 accept `--offline` if you don't want to run the heavy ML models.

```bash
python scripts/01_generate_fleet.py
python scripts/02_classify_alerts.py            # add --offline to skip the Hugging Face model
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
| 6 | `06_export_content_pack.py` | `outputs/content_pack.md`, `outputs/content_pack.json` | for static mockups |

---

## 🔧 Customizing

- **Change thresholds / fleet size / model:** `src/config.py`.
- **Add or edit a scenario:** add an entry to `SCENARIOS` in `src/scenarios.py` (and an `OFFLINE_SCORES` value). Use `{similar_count}`, `{patch_count}`, `{finance_count}` in any string and it will be filled with the real number.
- **Swap LIME for SHAP:** uncomment `shap` in `requirements.txt` and add a SHAP branch in `src/explain.py` mirroring `explain_with_lime`.

---

## 📊 For your slides (Transparency 25% / Innovation 15%)

Pitch the technical pipeline as: **Synthetic Telemetry → Hugging Face Zero-Shot Classifier → LIME Explainability → Human Translation → Interactive React Dashboard.**

The honest line that earns points: *"Our confidence labels are produced by a real model, then deliberately translated into plain language — we never show a raw probability number or a SHAP plot to the admin. Instead of just delivering Figma screens, we built a fully interactive React console with a complete FastAPI Authentication layer to prove that explainable AI can feel premium, dynamic, and trustworthy in a real browser."*

---

## 🚀 Deployment (Vercel)

This project is configured to deploy as a unified Full-Stack application on Vercel. 
The included `vercel.json` automatically routes `/api/*` to the FastAPI backend using Vercel's Python Serverless Functions, while serving the React frontend statically.

**To Deploy:**
1. Push your repository to GitHub and link it to Vercel.
2. In the Vercel Dashboard -> Settings -> Environments, add:
   - `VITE_GOOGLE_CLIENT_ID` (Your Google OAuth ID for the Sign-In button)
3. Leave `VITE_API_BASE` blank (Vercel automatically handles the relative routing).
4. Deploy! The frontend and backend will automatically wire themselves up.
