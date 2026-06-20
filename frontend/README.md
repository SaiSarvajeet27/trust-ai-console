# Trust-AI Console — Frontend

Interactive React dashboard for the Dell hackathon project "Designing Transparent & Trustworthy AI Agent Interfaces."

This interface covers all five transparency elements (Reasoning, Confidence, Limitations, Alternatives, and Data Sources) and provides an interactive "Trust Time Machine" (Activity Log).

## 🚀 Running the Console

**IMPORTANT:** The frontend is no longer a static prototype. It is fully wired to the live FastAPI backend to ensure the dashboard KPIs, fleet data, and activity logs are perfectly consistent.

### 1. Start the Backend API
In a terminal at the repository root (`trust-ai-backend/`), run the FastAPI server:
```bash
uvicorn api:app --port 8001
```

### 2. Start the Frontend Server
In a separate terminal, navigate to the `frontend/` directory and run Vite:
```bash
npm install
npm run dev
```

Navigate to `http://localhost:5173` to view the Trust-AI Console.

## 🛠️ What we changed from the Figma template
- **Live API Integration:** Stripped out the fake client-side data and hardcoded state. It now reads directly from the authentic python data pipeline output via FastAPI.
- **Dynamic KPI Dashboard:** The "Active Alerts" and "Fleet Health" stats are mathematically derived from the actual fleet state.
- **Transparency Modals:** Detail views now dynamically render each recommendation's own reasoning steps, LIME factors, confidence bands, limitations, and historical precedent.
- **Infinite Loop Fix:** Resolved React lifecycle bugs that caused the Activity Log to glitch during fetches.
- **UI Enhancements:** Added an Autonomy Trust Dial (Always Ask, Recommend, Act & Notify), a Light/Dark mode toggle, and removed placeholder DevOps badges to fit the enterprise security narrative.