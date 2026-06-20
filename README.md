# Trust-AI Console & Data Pipeline

This is the codebase for the Dell hackathon project **"Designing Transparent & Trustworthy AI Agent Interfaces."**

The repository contains a fully interactive **Trust-AI Console** (React/Vite) backed by a **FastAPI backend**, as well as the original data pipeline that generates authentic, model-backed data for the system.

---

## 🚀 Quick Start

The application has three components: generating the data, running the backend API, and running the frontend dashboard.

### 1. Setup & Generate Data
The backend relies on synthetic fleet data and real model explanations.

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Generate the data (Fast offline mode)
python run_all.py --offline
```

### 2. Run the Backend API (FastAPI)
The backend serves the generated data and KPIs to the dashboard.

```bash
# Run from the root directory
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
Navigate to `http://localhost:5173` in your browser.

---

## 🧠 The Trust-AI Pitch & Narrative

The core problem we solve is that **current AI interfaces are often black boxes**, which causes enterprise IT administrators to distrust and ignore AI recommendations. We solved this by designing a **transparent, explainable, and trustworthy AI interface**.

Our interactive dashboard highlights:
1. **Autonomy Modes (Trust Levels):** The Admin controls how much freedom the AI has ("Always Ask", "Recommend", or "Act & Notify").
2. **Data Distillation:** Our backend processes hundreds of raw, active fleet alerts and mathematically condenses them into a small, actionable queue of AI recommendations.
3. **Plain Language Explanations:** The AI explains *Why* it made a recommendation without using opaque math or ML jargon.
4. **Data Attribution & Limitations:** The AI cites the telemetry it used and admits when it has low confidence or limited data.
5. **Human-in-the-Loop:** Admins can confidently Approve, Override, Escalate, or Dismiss any recommendation, building an immutable Activity Log.

---

## 🛠️ Project Architecture

```
trust-ai-backend/
├── api.py                      # FastAPI backend serving the Dashboard
├── frontend/                   # React/Vite interactive frontend
│   ├── src/components/         # Dashboard, ReviewCenter, ActivityLog UI
│   └── src/index.css           # Premium Dark Glassmorphism Styling
├── run_all.py                  # Pipeline to generate data
├── src/                        # Data generation and ML pipeline logic
│   ├── config.py               
│   ├── scenarios.py            # The 3 AI scenarios authored for the demo
│   └── explain.py              # LIME model explanations
├── data/                       # Generated inputs
└── outputs/                    # Final JSON artifacts served by the API
```

---

## 📊 For Your Presentation

Pitch the technical pipeline as: **Synthetic Telemetry → Hugging Face Zero-Shot Classifier → LIME Explainability → Human Translation → Interactive React Dashboard.**

The honest line that earns points: *"Our confidence labels are produced by a real model, then deliberately translated into plain language — we never show a raw probability number or a SHAP plot to the admin. Instead of just delivering Figma screens, we built a fully interactive React console to prove that explainable AI can feel premium, dynamic, and trustworthy in a real browser."*
