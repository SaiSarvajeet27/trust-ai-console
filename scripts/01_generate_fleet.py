"""Step 01 — Generate the synthetic device fleet and event log.

Outputs:
  data/fleet.json
  data/events.csv

Run:
  python scripts/01_generate_fleet.py
"""
import csv
import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src import config
from src.fleet import generate_fleet, generate_events, cohort_counts


def main() -> None:
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)

    devices = generate_fleet()
    events = generate_events(devices)
    counts = cohort_counts(devices)

    with open(config.FLEET_JSON, "w", encoding="utf-8") as f:
        json.dump(devices, f, indent=2)

    with open(config.EVENTS_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["device_id", "type", "timestamp", "detail"])
        writer.writeheader()
        writer.writerows(events)

    print(f"Wrote {len(devices)} devices  -> {config.FLEET_JSON}")
    print(f"Wrote {len(events)} events    -> {config.EVENTS_CSV}")
    print("Cohort counts (used to fill recommendation text):")
    for k, v in counts.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
