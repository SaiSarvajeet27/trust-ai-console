"""Step 04 — Assemble the full recommendation objects (the designer handoff).

Combines: scenario authored content + real cohort counts (fleet) + confidence
band (step 02) + plain-language factors (step 03). Fills every {placeholder}
with a real number, then runs the plain-language guardrail.

Enhanced: now includes devil_advocate, agent_pipeline, historical_precedent,
incident_template, priority, and category fields.

Outputs:
  outputs/recommendations.json

Run:
  python scripts/04_assemble_recommendations.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src import config
from src.scenarios import SCENARIOS
from src.fleet import cohort_counts
from src.schema import (
    Recommendation, DataSource, Factor, Alternative,
    AgentStep, DevilAdvocate, HistoricalPrecedent, IncidentTemplate,
)
from src.plain_language import scan_all


def _fmt(value, counts):
    """Recursively .format() any string with the cohort counts."""
    if isinstance(value, str):
        return value.format(**counts)
    if isinstance(value, list):
        return [_fmt(v, counts) for v in value]
    if isinstance(value, dict):
        return {k: _fmt(v, counts) for k, v in value.items()}
    return value


def _load(path, what):
    if not path.exists():
        sys.exit(f"Missing {what} ({path}). Run the earlier steps first.")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main() -> None:
    config.OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

    devices = _load(config.FLEET_JSON, "fleet")
    confidence = _load(config.CONFIDENCE_JSON, "confidence results")
    explanations = _load(config.EXPLANATIONS_JSON, "explanations")
    counts = cohort_counts(devices)

    recommendations = []
    for sc in SCENARIOS:
        conf = confidence[sc["id"]]
        factors = explanations[sc["id"]]

        # Build devil_advocate
        da_data = _fmt(sc.get("devil_advocate", {}), counts)
        devil_adv = DevilAdvocate(**da_data) if da_data else None

        # Build agent_pipeline
        ap_data = _fmt(sc.get("agent_pipeline", []), counts)
        agent_steps = [AgentStep(**s) for s in ap_data]

        # Build historical_precedent
        hp_data = _fmt(sc.get("historical_precedent", {}), counts)
        hist_prec = HistoricalPrecedent(
            similar_alerts=hp_data["similar_alerts"],
            actions_taken=hp_data["actions_taken"],
            outcomes=hp_data["outcomes"],
            summary=hp_data["summary"],
        ) if hp_data else None

        # Build incident_template — needs target_summary resolved first
        resolved_target = _fmt(sc["target_summary"], counts)
        extended_counts = {**counts, "target_summary": resolved_target}
        it_data = _fmt(sc.get("incident_template", {}), extended_counts)
        inc_tmpl = IncidentTemplate(**it_data) if it_data else None

        rec = Recommendation(
            id=sc["id"],
            action=sc["action"],
            target_summary=resolved_target,
            confidence_band=conf["band"],
            confidence_driver=conf["driver"],
            priority=sc.get("priority", "medium"),
            category=sc.get("category", "security"),
            reasoning_steps=_fmt(sc["reasoning_steps"], counts),
            factors=[Factor(**f) for f in _fmt(factors, counts)],
            data_sources=[DataSource(**d) for d in _fmt(sc["data_sources"], counts)],
            limitations=_fmt(sc["limitations"], counts),
            alternatives=[Alternative(**a) for a in _fmt(sc["alternatives"], counts)],
            devil_advocate=devil_adv,
            agent_pipeline=agent_steps,
            historical_precedent=hist_prec,
            incident_template=inc_tmpl,
            status="pending",
            _raw_model_score=conf["raw_score"],
            _positive_label=sc["positive_label"],
        )
        recommendations.append(rec.to_dict())

    # Guardrail: catch any jargon/number leak before it reaches a frame.
    warnings = scan_all(recommendations)
    if warnings:
        print("PLAIN-LANGUAGE WARNINGS (fix before handing to designers):")
        for w in warnings:
            print("  " + w)
    else:
        print("Plain-language check: clean (no jargon or numbers in UI strings).")

    with open(config.RECOMMENDATIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(recommendations, f, indent=2)
    print(f"\nWrote {len(recommendations)} recommendations -> {config.RECOMMENDATIONS_JSON}")
    print("Cohort counts used:", counts)


if __name__ == "__main__":
    main()
