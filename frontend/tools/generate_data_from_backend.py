import json, re

BK = "../outputs"
recs_in = json.load(open(f"{BK}/recommendations.json"))
log_in = json.load(open(f"{BK}/activity_log.json"))["all"]

BAND_CONF = {"High Confidence":"High","Review Recommended":"Review","Low — Verify Manually":"Low"}
BAND_IMPACT = {"High":"Critical","Review":"High","Low":"Low"}
TAGMAP = {"telemetry":"METRICS","threat intel":"LOGS","policy":"CONFIG","model prediction":"SCHEDULE"}
WMAP = {"major":("Major","#3b82f6",92),"moderate":("Moderate","#8b5cf6",66),"minor":("Minor","#334155",34)}
AGES = ["4m ago","12m ago","28m ago","1h ago","2h ago","3h ago","5h ago","8h ago"]
RISKS = ["Low","Medium","High","Critical"]

def category(action):
    a = action.lower()
    if any(k in a for k in ["quarantine","isolate","malware","firewall"]): return "SECURITY"
    if any(k in a for k in ["patch","encrypt"]): return "COMPLIANCE"
    if any(k in a for k in ["password","account","access","admin","employee","credential","privileged","departed"]): return "IDENTITY"
    if "network" in a: return "NETWORK"
    return "OPERATIONS"

recs_out = []
for idx, r in enumerate(recs_in):
    conf = BAND_CONF.get(r["confidence_band"], "Review")
    cat = category(r["action"])
    factors = []
    for i, f in enumerate(r.get("factors", [])):
        lvl, col, base = WMAP.get(f["weight"], WMAP["moderate"])
        factors.append({"name": f["factor"], "value": max(12, base - i*4), "level": lvl, "color": col})
    alts = []
    for i, a in enumerate(r.get("alternatives", [])):
        alts.append({"id": "ALT-"+chr(65+i), "title": a["action"], "tradeoff": a["tradeoff"],
                     "confidence": max(20, 82 - i*18), "risk": RISKS[min(i,3)]})
    recs_out.append({
        "id": r["id"], "title": r["action"], "target": r["target_summary"],
        "confidence": conf, "status": "pending",
        "reasoning": (r["reasoning_steps"][0] if r["reasoning_steps"] else r["action"]),
        "category": cat, "impact": BAND_IMPACT[conf], "age": AGES[idx % len(AGES)],
        "confidenceDriver": r["confidence_driver"],
        "reasoningSteps": r["reasoning_steps"],
        "dataSources": [{"tag": TAGMAP.get(d["type"], "CONFIG"), "label": d["description"]} for d in r["data_sources"]],
        "limitations": r["limitations"],
        "factors": factors,
        "alternatives": alts,
    })

DEC = {"Approved":"Approved","Overridden":"Overridden","Escalated":"Escalated","Dismissed":"Overridden"}
audit_out = []
for e in log_in:
    d = DEC.get(e["human_decision"])
    if not d: continue
    audit_out.append({
        "timestamp": e["timestamp"], "actionSignature": f'{e["action"]} // {e["target_summary"]}',
        "inference": e["ai_recommendation"], "decision": d,
        "operator": e["decided_by"], "recId": e["id"],
    })

data_ts = ("// Generated from the backend pipeline output (recommendations.json + activity_log.json).\n"
           "// Re-generate by running the pipeline and the converter.\n\n"
           "export const RECOMMENDATIONS = " + json.dumps(recs_out, indent=2) + ";\n\n"
           "export const AUDIT_LOG = " + json.dumps(audit_out, indent=2) + ";\n")
open("src/app/data.ts", "w").write(data_ts)
print("data.ts written:", len(recs_out), "recommendations,", len(audit_out), "audit entries")
