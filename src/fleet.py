"""Generate a self-consistent synthetic device fleet with Faker.

Key idea: exact-count cohorts (similar_profile, needs_patch) are assigned
deterministically so the narrative numbers in the recommendations ("342
similar devices", "212 affected devices") are guaranteed to be TRUE in the
data. The IT-admin demo only feels real if these tie together.
"""
from __future__ import annotations
import random
from datetime import datetime, timedelta

from faker import Faker

from . import config


def _device_id(index: int) -> str:
    prefix = random.choice(["LAP", "DSK", "WKS"])
    return f"{prefix}-{1000 + index}"


def generate_fleet(seed: int = config.SEED) -> list[dict]:
    """Return a list of device dicts of length config.FLEET_SIZE."""
    fake = Faker()
    Faker.seed(seed)
    random.seed(seed)

    today = datetime(2026, 6, 19)
    devices: list[dict] = []

    for i in range(config.FLEET_SIZE):
        last_patch_days = random.choice([2, 5, 9, 14, 21, 30, 47, 60])
        device = {
            "id": _device_id(i),
            "model": random.choice(config.DEVICE_MODELS),
            "os_version": random.choice(config.OS_VERSIONS),
            "department": random.choice(config.DEPARTMENTS),
            "location": random.choice(config.LOCATIONS),
            "owner": fake.name(),
            "last_patch_date": (today - timedelta(days=last_patch_days)).strftime("%Y-%m-%d"),
            "days_since_patch": last_patch_days,
            "risk_score": random.randint(1, 100),
            "status": "active",
            # cohort flags (set below)
            "similar_profile": False,
            "needs_patch": False,
            "is_finance": False,
        }
        device["is_finance"] = device["department"] == config.FINANCE_DEPT
        devices.append(device)

    # Guarantee the hero device exists with the right story.
    hero = devices[0]
    hero["id"] = "LAP-4821"
    hero["model"] = "Dell Latitude 7440"
    hero["days_since_patch"] = 47
    hero["last_patch_date"] = (today - timedelta(days=47)).strftime("%Y-%m-%d")
    hero["risk_score"] = 92

    # Assign exact-count cohorts (excluding the hero where appropriate).
    pool = list(range(1, config.FLEET_SIZE))
    random.shuffle(pool)

    for idx in pool[: config.SIMILAR_PROFILE_COUNT]:
        devices[idx]["similar_profile"] = True
    hero["similar_profile"] = True  # hero belongs to the similar cohort too

    for idx in pool[: config.NEEDS_PATCH_COUNT]:
        devices[idx]["needs_patch"] = True

    return devices


def generate_events(devices: list[dict], seed: int = config.SEED) -> list[dict]:
    """Lightweight event log (logins, patch events, alerts) for realism."""
    random.seed(seed + 1)
    events: list[dict] = []
    today = datetime(2026, 6, 19)

    for d in random.sample(devices, k=min(120, len(devices))):
        n = random.randint(1, 4)
        for _ in range(n):
            kind = random.choice(["login", "patch", "alert"])
            when = today - timedelta(days=random.randint(0, 14),
                                     hours=random.randint(0, 23))
            events.append({
                "device_id": d["id"],
                "type": kind,
                "timestamp": when.strftime("%Y-%m-%d %H:%M"),
                "detail": {
                    "login": "sign-in attempt",
                    "patch": "update applied",
                    "alert": "security alert raised",
                }[kind],
            })

    # A few pointed anomalous logins on the hero device.
    for h in range(14):
        events.append({
            "device_id": "LAP-4821",
            "type": "login",
            "timestamp": (today - timedelta(minutes=h)).strftime("%Y-%m-%d %H:%M"),
            "detail": "failed sign-in from unrecognized location",
        })

    return events


def cohort_counts(devices: list[dict]) -> dict:
    """Counts used to fill the {placeholders} in scenario content."""
    return {
        "similar_count": sum(1 for d in devices if d["similar_profile"]),
        "patch_count": sum(1 for d in devices if d["needs_patch"]),
        "finance_count": sum(1 for d in devices if d["is_finance"]),
        "fleet_size": len(devices),
    }
