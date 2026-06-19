"""Step 02 — Produce a real confidence score per scenario.

Uses a Hugging Face zero-shot classifier by default. Pass --offline to use
predefined scores (no model download) so a slow connection never blocks the
designers.

Outputs:
  data/confidence.json

Run:
  python scripts/02_classify_alerts.py            # real model
  python scripts/02_classify_alerts.py --offline  # predefined scores
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src import config
from src.scenarios import SCENARIOS, OFFLINE_SCORES
from src.confidence import classify, score_to_band, driver_sentence


def main(offline: bool) -> None:
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    results = {}

    for sc in SCENARIOS:
        if offline:
            score = OFFLINE_SCORES[sc["id"]]
            all_scores = {sc["positive_label"]: score}
            print(f"{sc['id']}: offline score {score:.2f}")
        else:
            print(f"{sc['id']}: classifying with {config.ZERO_SHOT_MODEL} ...")
            out = classify(sc["alert_description"], sc["candidate_labels"],
                           sc["positive_label"])
            score = out["score"]
            all_scores = out["all_scores"]
            print(f"  positive label '{sc['positive_label']}' -> {score:.2f}")

        band = score_to_band(score)
        top_factor = sc["authored_factors"][0]["factor"]
        results[sc["id"]] = {
            "raw_score": round(float(score), 4),   
            "band": band,
            "driver": driver_sentence(band, top_factor),
            "all_scores": all_scores,
        }
        print(f"  band -> {band}")

    with open(config.CONFIDENCE_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\nWrote confidence results -> {config.CONFIDENCE_JSON}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--offline", action="store_true",
                        help="Use predefined scores instead of downloading the model.")
    args = parser.parse_args()
    main(args.offline)
