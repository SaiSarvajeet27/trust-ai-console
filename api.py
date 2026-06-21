"""FastAPI layer that serves the pipeline outputs to the React frontend.

This is the bridge between the Python pipeline and the React app:
    React (fetch)  ->  FastAPI (this file)  ->  outputs/*.json (model output)

Generate the data first, then start the API:
    python run_all.py --offline          # creates outputs/*.json
    uvicorn api:app --reload --port 8000

Enhanced with:
  - Fleet analytics endpoints (department stats, health distribution, charts data)
  - Multi-agent pipeline data
  - Autonomy mode settings
  - Incident report generation
  - Activity log search/filter
  - Richer decision workflow with notes
"""
import json
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src import config
from src.fleet import fleet_analytics

app = FastAPI(title="Trust-AI Console API", version="2.0.0")

# Open CORS for the hackathon (React dev server). Tighten for production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session state, loaded from the generated JSON at import time.
STATE = {
    "recommendations": [],
    "activity": {"all": [], "filtered_security": []},
    "fleet": [],
    "autonomy_mode": config.DEFAULT_AUTONOMY_MODE,
    "incidents": {},
}


def _load() -> bool:
    if not (config.RECOMMENDATIONS_JSON.exists() and config.ACTIVITY_LOG_JSON.exists()):
        return False
    with open(config.RECOMMENDATIONS_JSON, encoding="utf-8") as f:
        STATE["recommendations"] = json.load(f)
    with open(config.ACTIVITY_LOG_JSON, encoding="utf-8") as f:
        STATE["activity"] = json.load(f)
    if config.FLEET_JSON.exists():
        with open(config.FLEET_JSON, encoding="utf-8") as f:
            STATE["fleet"] = json.load(f)
    return True


_LOADED = _load()
if not _LOADED:
    print("WARNING: outputs not found. Run `python run_all.py --offline` first.")


# ── Pydantic models ──────────────────────────────────────────────────────────

class Decision(BaseModel):
    decision: str                         # approved | overridden | escalated | dismissed
    note: Optional[str] = None
    decided_by: Optional[str] = "Demo Admin"


class AutonomyUpdate(BaseModel):
    mode: str  # always_ask | recommend_only | act_and_notify | full_auto


# ── Health ───────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"ok": True, "recommendations_loaded": len(STATE["recommendations"])}


# ── Recommendations ──────────────────────────────────────────────────────────

@app.get("/api/recommendations")
def list_recommendations():
    if not STATE["recommendations"]:
        raise HTTPException(503, "No data. Run `python run_all.py --offline` first.")
    pending = [r for r in STATE["recommendations"] if r.get("status") == "pending"]
    # Sort by priority
    priority_order = config.PRIORITY_ORDER
    pending.sort(key=lambda r: priority_order.get(r.get("priority", "medium"), 2))
    return pending[:config.WINDOW_SIZE]


@app.get("/api/recommendations/all")
def list_all_recommendations():
    """Full backlog including decided items."""
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
                "confidence_band": r.get("confidence_band", ""),
                "category": r.get("category", ""),
                "priority": r.get("priority", ""),
                "note": body.note or "",
            }
            STATE["activity"]["all"].insert(0, entry)
            return {"ok": True, "recommendation": r, "logged": entry}
    raise HTTPException(404, "Recommendation not found")


# ── Activity Log ─────────────────────────────────────────────────────────────

@app.get("/api/activity-log")
def activity_log(
    search: Optional[str] = Query(None, description="Search in action/note text"),
    category: Optional[str] = Query(None, description="Filter by category"),
    decision: Optional[str] = Query(None, description="Filter by human decision"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
):
    entries = STATE["activity"].get("all", [])

    if search:
        q = search.lower()
        entries = [e for e in entries if q in e.get("action", "").lower()
                   or q in e.get("note", "").lower()
                   or q in e.get("ai_recommendation", "").lower()]
    if category:
        entries = [e for e in entries if e.get("category") == category]
    if decision:
        entries = [e for e in entries if e.get("human_decision", "").lower() == decision.lower()]
    if priority:
        entries = [e for e in entries if e.get("priority") == priority]

    return {"all": entries, "total": len(entries)}


@app.get("/api/activity-log/stats")
def activity_log_stats():
    """Statistics for the activity log dashboard strip."""
    entries = STATE["activity"].get("all", [])
    total = len(entries)
    if total == 0:
        return {"total": 0, "approved": 0, "overridden": 0, "escalated": 0,
                "dismissed": 0, "pending": 0, "approval_rate": 0}

    counts = {}
    for e in entries:
        d = e.get("human_decision", "Unknown")
        counts[d] = counts.get(d, 0) + 1

    approved = counts.get("Approved", 0)
    decided = total - counts.get("Pending", 0)

    return {
        "total": total,
        "approved": approved,
        "overridden": counts.get("Overridden", 0),
        "escalated": counts.get("Escalated", 0),
        "dismissed": counts.get("Dismissed", 0),
        "pending": counts.get("Pending", 0),
        "approval_rate": round(approved / decided * 100, 1) if decided > 0 else 0,
        "by_category": _count_by(entries, "category"),
        "by_priority": _count_by(entries, "priority"),
    }


def _count_by(entries, key):
    counts = {}
    for e in entries:
        v = e.get(key, "unknown")
        counts[v] = counts.get(v, 0) + 1
    return counts


# ── Fleet ────────────────────────────────────────────────────────────────────

@app.get("/api/fleet/summary")
def fleet_summary():
    devices = STATE.get("fleet", [])
    if not devices:
        return {"fleet_size": 0, "needs_patch": 0, "pending_recommendations": 0,
                "health": {"healthy": 0, "at_risk": 0, "critical": 0}}

    health = {"healthy": 0, "at_risk": 0, "critical": 0}
    for d in devices:
        h = d.get("health_status", "healthy")
        health[h] = health.get(h, 0) + 1

    return {
        "fleet_size": len(devices),
        "needs_patch": sum(1 for d in devices if d.get("needs_patch")),
        "pending_recommendations": sum(1 for r in STATE["recommendations"]
                                       if r.get("status") == "pending"),
        "health": health,
        "encrypted": sum(1 for d in devices if d.get("encrypted")),
        "unencrypted": sum(1 for d in devices if not d.get("encrypted", True)),
    }


@app.get("/api/fleet/analytics")
def get_fleet_analytics():
    """Rich analytics data for dashboard charts."""
    devices = STATE.get("fleet", [])
    if not devices:
        return {"fleet_size": 0}
    return fleet_analytics(devices)


@app.get("/api/fleet/devices")
def list_devices(
    department: Optional[str] = None,
    health: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    """Paginated device list with filters."""
    devices = STATE.get("fleet", [])

    if department:
        devices = [d for d in devices if d.get("department") == department]
    if health:
        devices = [d for d in devices if d.get("health_status") == health]
    if search:
        q = search.lower()
        devices = [d for d in devices if q in d.get("id", "").lower()
                   or q in d.get("owner", "").lower()
                   or q in d.get("model", "").lower()]

    return {
        "total": len(devices),
        "devices": devices[offset:offset + limit],
    }


# ── Autonomy ─────────────────────────────────────────────────────────────────

@app.get("/api/settings/autonomy")
def get_autonomy():
    mode = STATE["autonomy_mode"]
    return {
        "mode": mode,
        **config.AUTONOMY_MODES.get(mode, config.AUTONOMY_MODES["always_ask"]),
    }


@app.post("/api/settings/autonomy")
def set_autonomy(body: AutonomyUpdate):
    if body.mode not in config.AUTONOMY_MODES:
        raise HTTPException(400, f"mode must be one of {list(config.AUTONOMY_MODES.keys())}")
    STATE["autonomy_mode"] = body.mode
    return get_autonomy()


# ── Agents ───────────────────────────────────────────────────────────────────

@app.get("/api/agents/pipeline/{rec_id}")
def get_agent_pipeline(rec_id: str):
    """Multi-agent transparency data for a recommendation."""
    for r in STATE["recommendations"]:
        if r["id"] == rec_id:
            return {
                "recommendation_id": rec_id,
                "pipeline": r.get("agent_pipeline", []),
                "agents": ["Detection Agent", "Analysis Agent", "Remediation Agent"],
            }
    raise HTTPException(404, "Recommendation not found")


# ── Incidents ────────────────────────────────────────────────────────────────

@app.post("/api/incidents/generate/{rec_id}")
def generate_incident(rec_id: str):
    """Generate an AI incident report from a completed recommendation."""
    for r in STATE["recommendations"]:
        if r["id"] == rec_id:
            template = r.get("incident_template", {})
            if not template:
                raise HTTPException(400, "No incident template available for this recommendation")

            report = {
                "id": f"INC-{rec_id.replace('REC-', '')}",
                "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "recommendation_id": rec_id,
                "title": template.get("title", r["action"]),
                "severity": r.get("priority", "medium"),
                "status": r.get("status", "pending"),
                "what_happened": {
                    "action": r["action"],
                    "target": r["target_summary"],
                    "reasoning": r.get("reasoning_steps", []),
                    "agent_pipeline": r.get("agent_pipeline", []),
                },
                "why_it_happened": {
                    "root_cause": template.get("root_cause", "Under investigation"),
                    "confidence": r.get("confidence_band", ""),
                    "confidence_driver": r.get("confidence_driver", ""),
                    "factors": r.get("factors", []),
                },
                "what_was_done": {
                    "decision": r.get("status", "pending"),
                    "data_sources": r.get("data_sources", []),
                },
                "impact_assessment": {
                    "devices_affected": r["target_summary"],
                    "category": r.get("category", "security"),
                    "risk_reduction": "Significant" if r.get("priority") in ("critical", "high") else "Moderate",
                },
                "recommended_safeguards": template.get("safeguards", []),
                "limitations": r.get("limitations", []),
            }
            STATE["incidents"][report["id"]] = report
            return report
    raise HTTPException(404, "Recommendation not found")


@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str):
    report = STATE["incidents"].get(incident_id)
    if not report:
        raise HTTPException(404, "Incident report not found")
    return report


@app.get("/api/incidents")
def list_incidents():
    return list(STATE["incidents"].values())


# ── Dashboard KPIs ───────────────────────────────────────────────────────────

@app.get("/api/dashboard/kpis")
def dashboard_kpis():
    """Aggregated KPIs for the main dashboard."""
    devices = STATE.get("fleet", [])
    recs = STATE.get("recommendations", [])
    entries = STATE["activity"].get("all", [])

    pending = sum(1 for r in recs if r.get("status") == "pending")
    critical = sum(1 for r in recs if r.get("status") == "pending" and r.get("priority") == "critical")

    # Trust score = weighted average based on decisions
    decided = [e for e in entries if e.get("human_decision") not in ("Pending", "—")]
    approved = sum(1 for e in decided if e.get("human_decision") == "Approved")
    trust_score = round(approved / len(decided) * 100) if decided else 85

    health = {"healthy": 0, "at_risk": 0, "critical": 0}
    for d in devices:
        h = d.get("health_status", "healthy")
        health[h] = health.get(h, 0) + 1

    # Active alerts = devices that are not healthy. This reconciles exactly with
    # the Fleet Health donut (healthy + active_alerts == fleet_size).
    active_alerts = health["at_risk"] + health["critical"]
    critical_alerts = health["critical"]

    return {
        "fleet_size": len(devices),
        "active_alerts": active_alerts,
        "critical_alerts": critical_alerts,
        "at_risk_alerts": health["at_risk"],
        "pending_recommendations": pending,
        "trust_score": trust_score,
        "health": health,
        "autonomy_mode": STATE["autonomy_mode"],
        "recent_decisions": len(decided),
    }
