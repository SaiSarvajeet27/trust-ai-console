"""Step 04 — Assemble the full recommendation objects (the designer handoff).

Combines: scenario authored content + real cohort counts (fleet) + confidence
band (step 02) + plain-language factors (step 03). Fills every {placeholder}
with a real number, then runs the plain-language guardrail.

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
from src.schema import Recommendation, DataSource, Factor, Alternative
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

        rec = Recommendation(
            id=sc["id"],
            action=sc["action"],
            target_summary=_fmt(sc["target_summary"], counts),
            confidence_band=conf["band"],
            confidence_driver=conf["driver"],
            reasoning_steps=_fmt(sc["reasoning_steps"], counts),
            factors=[Factor(**f) for f in _fmt(factors, counts)],
            data_sources=[DataSource(**d) for d in _fmt(sc["data_sources"], counts)],
            limitations=_fmt(sc["limitations"], counts),
            alternatives=[Alternative(**a) for a in _fmt(sc["alternatives"], counts)],
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
