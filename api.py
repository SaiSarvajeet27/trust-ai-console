"""FastAPI layer that serves the pipeline outputs to the React frontend.

This is the bridge between the Python pipeline and the React app:
    React (fetch)  ->  FastAPI (this file)  ->  outputs/*.json (model output)

Generate the data first, then start the API:
    python run_all.py --offline          # creates outputs/*.json
    uvicorn api:app --reload --port 8000

Decisions (Approve / Override / Escalate) update an in-memory copy so the
human-in-the-loop loop works during a demo. State resets on restart; re-run the
pipeline to regenerate the source files.
"""
import json
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src import config

app = FastAPI(title="Trust-AI Console API", version="0.1.0")

# Open CORS for the hackathon (React dev server). Tighten for production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session state, loaded from the generated JSON at import time.
STATE = {"recommendations": [], "activity": {"all": [], "filtered_security": []}}


def _load() -> bool:
    if not (config.RECOMMENDATIONS_JSON.exists() and config.ACTIVITY_LOG_JSON.exists()):
        return False
    with open(config.RECOMMENDATIONS_JSON, encoding="utf-8") as f:
        STATE["recommendations"] = json.load(f)
    with open(config.ACTIVITY_LOG_JSON, encoding="utf-8") as f:
        STATE["activity"] = json.load(f)
    return True


_LOADED = _load()
if not _LOADED:
    print("WARNING: outputs not found. Run `python run_all.py --offline` first.")


class Decision(BaseModel):
    decision: str                         # approved | overridden | escalated | dismissed
    note: Optional[str] = None
    decided_by: Optional[str] = "Demo Admin"


@app.get("/api/health")
def health():
    return {"ok": True, "recommendations_loaded": len(STATE["recommendations"])}


@app.get("/api/recommendations")
def list_recommendations():
    if not STATE["recommendations"]:
        raise HTTPException(503, "No data. Run `python run_all.py --offline` first.")
    return STATE["recommendations"]


@app.get("/api/recommendations/{rec_id}")
def get_recommendation(rec_id: str):
    for r in STATE["recommendations"]:
        if r["id"] == rec_id:
            return r
    raise HTTPException(404, "Recommendation not found")


@app.post("/api/recommendations/{rec_id}/decision")
def decide(rec_id: str, body: Decision):
    valid = {"approved", "overridden", "escalated", "dismissed"}
    if body.decision not in valid:
        raise HTTPException(400, f"decision must be one of {sorted(valid)}")
    for r in STATE["recommendations"]:
        if r["id"] == rec_id:
            r["status"] = body.decision
            entry = {
                "id": f"LOG-{len(STATE['activity']['all']) + 15:03d}",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "action": r["action"],
                "target_summary": r["target_summary"],
                "ai_recommendation": (r["reasoning_steps"][0]
                                      if r.get("reasoning_steps") else r["action"]),
                "human_decision": body.decision.capitalize(),
                "decided_by": body.decided_by or "Demo Admin",
                "note": body.note or "",
            }
            STATE["activity"]["all"].insert(0, entry)
            return {"ok": True, "recommendation": r, "logged": entry}
    raise HTTPException(404, "Recommendation not found")


@app.get("/api/activity-log")
def activity_log():
    return STATE["activity"]


@app.get("/api/fleet/summary")
def fleet_summary():
    if not config.FLEET_JSON.exists():
        return {"fleet_size": 0, "needs_patch": 0, "pending_recommendations": 0}
    with open(config.FLEET_JSON, encoding="utf-8") as f:
        devices = json.load(f)
    return {
        "fleet_size": len(devices),
        "needs_patch": sum(1 for d in devices if d.get("needs_patch")),
        "pending_recommendations": sum(1 for r in STATE["recommendations"]
                                       if r.get("status") == "pending"),
    }
