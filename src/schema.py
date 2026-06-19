"""The recommendation schema -- the CONTRACT between this pipeline and the
Figma designers. Every field maps to one of the five mandatory transparency
elements:

  1. reasoning_steps      -> "Reasoning steps (plain language)"
  2. confidence_band      -> "Confidence level (contextual, not a raw %)"
  3. data_sources         -> "Data source attribution"
  4. limitations          -> "Known limitations / scope"
  5. controls             -> "Human-in-the-loop controls"
"""
from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import List, Optional


@dataclass
class DataSource:
    type: str          # "telemetry" | "policy" | "model prediction" | "threat intel"
    description: str    # human-readable, with real counts filled in


@dataclass
class Factor:
    factor: str         # plain-language factor, e.g. "unusual login location"
    weight: str         # "major" | "moderate" | "minor"


@dataclass
class Alternative:
    action: str
    tradeoff: str


@dataclass
class Recommendation:
    id: str
    action: str
    target_summary: str                       # e.g. "1 device (LAP-4821)"
    confidence_band: str                      # contextual label, never a %
    confidence_driver: str                    # one-line reason for the band
    reasoning_steps: List[str] = field(default_factory=list)
    factors: List[Factor] = field(default_factory=list)   # the "Ask Why" content
    data_sources: List[DataSource] = field(default_factory=list)
    limitations: List[str] = field(default_factory=list)
    alternatives: List[Alternative] = field(default_factory=list)
    controls: List[str] = field(default_factory=lambda: [
        "Approve", "Override", "Ask Why", "See Alternatives", "Escalate to Human Review",
    ])
    status: str = "pending"                   # pending | approved | overridden | escalated
    # kept for the deck/README ONLY -- never surfaced in the UI
    _raw_model_score: Optional[float] = None
    _positive_label: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class ActivityEntry:
    id: str
    timestamp: str
    action: str
    target_summary: str
    ai_recommendation: str       # plain-language one-liner
    human_decision: str          # Approved | Overridden | Escalated | Dismissed
    decided_by: str
    note: str = ""

    def to_dict(self) -> dict:
        return asdict(self)
