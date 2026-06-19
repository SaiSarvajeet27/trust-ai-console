"""Plain-language guardrail.

The brief forbids ML jargon, raw scores, and percentages in anything the user
sees. This module scans the user-facing strings of a recommendation and flags
any banned term, so you catch a leak before it reaches a frame.
"""
from __future__ import annotations

from . import config


# Fields that end up on screen. (_raw_model_score / _positive_label are internal.)
USER_FACING_KEYS = [
    "action", "target_summary", "confidence_band", "confidence_driver",
    "reasoning_steps", "data_sources", "limitations", "alternatives", "factors",
]


def _strings(value) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, dict):
        out: list[str] = []
        for v in value.values():
            out.extend(_strings(v))
        return out
    if isinstance(value, list):
        out = []
        for v in value:
            out.extend(_strings(v))
        return out
    return []


def scan_recommendation(rec: dict) -> list[str]:
    """Return a list of human-readable warnings (empty == clean)."""
    warnings: list[str] = []
    for key in USER_FACING_KEYS:
        for text in _strings(rec.get(key)):
            low = text.lower()
            for term in config.BANNED_TERMS:
                if term in low:
                    warnings.append(
                        f"[{rec.get('id')}] '{term}' found in {key}: \"{text}\""
                    )
    return warnings


def scan_all(recs: list[dict]) -> list[str]:
    warnings: list[str] = []
    for rec in recs:
        warnings.extend(scan_recommendation(rec))
    return warnings
