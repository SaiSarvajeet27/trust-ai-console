"""Step 03 — Produce the plain-language "Ask Why" factors per scenario.

Runs LIME over the classifier to find which signals drove the score, then
translates them into human factors. Falls back to authored factors if LIME is
unavailable or --offline is passed.

Outputs:
  data/explanations.json

Run:
  python scripts/03_explain_alerts.py            # real LIME (slow on CPU)
  python scripts/03_explain_alerts.py --offline  # authored factors
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src import config
from src.scenarios import SCENARIOS
from src.explain import factors_for_scenario


def main(offline: bool) -> None:
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    results = {}

    for sc in SCENARIOS:
        print(f"{sc['id']}: building factors "
              f"({'authored' if offline else 'LIME'}) ...")
        factors = factors_for_scenario(sc, offline=offline)
        results[sc["id"]] = factors
        for fct in factors:
            print(f"  - {fct['factor']} ({fct['weight']})")

    with open(config.EXPLANATIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\nWrote explanations -> {config.EXPLANATIONS_JSON}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--offline", action="store_true",
                        help="Skip LIME and use authored factors.")
    args = parser.parse_args()
    main(args.offline)
