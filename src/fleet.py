"""Generate a self-consistent synthetic device fleet with Faker.

Key idea: exact-count cohorts (similar_profile, needs_patch) are assigned
deterministically so the narrative numbers in the recommendations ("342
similar devices", "212 affected devices") are guaranteed to be TRUE in the
data. The IT-admin demo only feels real if these tie together.

Enhanced: now includes health_status per device and richer analytics fields.
"""
from __future__ import annotations
import random
from datetime import datetime, timedelta

from faker import Faker

from . import config


def _device_id(index: int) -> str:
    prefix = random.choice(["LAP", "DSK", "WKS"])
    return f"{prefix}-{1000 + index}"


def _health_status(risk_score: int) -> str:
    if risk_score >= config.HEALTH_CRITICAL_RISK:
        return "critical"
    if risk_score >= config.HEALTH_AT_RISK:
        return "at_risk"
    return "healthy"


def generate_fleet(seed: int = config.SEED) -> list[dict]:
    """Return a list of device dicts of length config.FLEET_SIZE."""
    fake = Faker()
    Faker.seed(seed)
    random.seed(seed)

    today = datetime(2026, 6, 19)
    devices: list[dict] = []

    for i in range(config.FLEET_SIZE):
        last_patch_days = random.choice([2, 5, 9, 14, 21, 30, 47, 60])
        risk = random.randint(1, 100)
        device = {
            "id": _device_id(i),
            "model": random.choice(config.DEVICE_MODELS),
            "os_version": random.choice(config.OS_VERSIONS),
            "department": random.choice(config.DEPARTMENTS),
            "location": random.choice(config.LOCATIONS),
            "owner": fake.name(),
            "last_patch_date": (today - timedelta(days=last_patch_days)).strftime("%Y-%m-%d"),
            "days_since_patch": last_patch_days,
            "risk_score": risk,
            "health_status": _health_status(risk),
            "status": "active",
            "encrypted": random.random() < 0.72,
            # cohort flags (set below)
            "similar_profile": False,
            "needs_patch": False,
            "is_finance": False,
            "is_sales": False,
        }
        device["is_finance"] = device["department"] == config.FINANCE_DEPT
        device["is_sales"] = device["department"] == "Sales"
        devices.append(device)

    # Guarantee the hero device exists with the right story.
    hero = devices[0]
    hero["id"] = "LAP-4821"
    hero["model"] = "Dell Latitude 7440"
    hero["days_since_patch"] = 47
    hero["last_patch_date"] = (today - timedelta(days=47)).strftime("%Y-%m-%d")
    hero["risk_score"] = 92
    hero["health_status"] = "critical"

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
        "sales_count": sum(1 for d in devices if d.get("is_sales")),
        "unencrypted_count": sum(1 for d in devices if not d.get("encrypted", True)),
        "fleet_size": len(devices),
    }


def fleet_analytics(devices: list[dict]) -> dict:
    """Rich analytics data for the dashboard charts."""
    # Health distribution
    health = {"healthy": 0, "at_risk": 0, "critical": 0}
    for d in devices:
        health[d["health_status"]] = health.get(d["health_status"], 0) + 1

    # By department
    dept_counts = {}
    dept_risk = {}
    for d in devices:
        dept = d["department"]
        dept_counts[dept] = dept_counts.get(dept, 0) + 1
        dept_risk.setdefault(dept, []).append(d["risk_score"])

    dept_stats = []
    for dept in sorted(dept_counts.keys()):
        scores = dept_risk[dept]
        dept_stats.append({
            "department": dept,
            "device_count": dept_counts[dept],
            "avg_risk": round(sum(scores) / len(scores), 1),
            "critical_count": sum(1 for s in scores if s >= config.HEALTH_CRITICAL_RISK),
        })

    # By model
    model_counts = {}
    for d in devices:
        model_counts[d["model"]] = model_counts.get(d["model"], 0) + 1

    # By OS
    os_counts = {}
    for d in devices:
        os_counts[d["os_version"]] = os_counts.get(d["os_version"], 0) + 1

    # By location
    loc_counts = {}
    for d in devices:
        loc_counts[d["location"]] = loc_counts.get(d["location"], 0) + 1

    # Patch status
    patch_current = sum(1 for d in devices if d["days_since_patch"] <= 14)
    patch_overdue = sum(1 for d in devices if d["days_since_patch"] > 30)
    patch_aging = len(devices) - patch_current - patch_overdue

    # Encryption
    encrypted = sum(1 for d in devices if d.get("encrypted", False))

    return {
        "fleet_size": len(devices),
        "health_distribution": health,
        "department_stats": dept_stats,
        "model_distribution": [{"model": m, "count": c} for m, c in model_counts.items()],
        "os_distribution": [{"os": o, "count": c} for o, c in os_counts.items()],
        "location_distribution": [{"location": l, "count": c} for l, c in loc_counts.items()],
        "patch_status": {
            "current": patch_current,
            "aging": patch_aging,
            "overdue": patch_overdue,
        },
        "encryption_status": {
            "encrypted": encrypted,
            "unencrypted": len(devices) - encrypted,
        },
    }
