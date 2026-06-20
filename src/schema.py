"""The recommendation schema -- the CONTRACT between this pipeline and the
React frontend. Every field maps to one of the five mandatory transparency
elements, PLUS the new bonus features:

  1. reasoning_steps      -> "Reasoning steps (plain language)"
  2. confidence_band      -> "Confidence level (contextual, not a raw %)"
  3. data_sources         -> "Data source attribution"
  4. limitations          -> "Known limitations / scope"
  5. controls             -> "Human-in-the-loop controls"

  BONUS:
  6. devil_advocate       -> Counter-arguments ("why NOT")
  7. agent_pipeline       -> Multi-agent transparency
  8. historical_precedent -> Trust Time Machine
  9. incident_template    -> AI Incident Report
  10. priority / category -> Classification for dashboard
"""
from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict


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
class AgentStep:
    """One step in the multi-agent pipeline."""
    agent: str          # "Detection Agent" | "Analysis Agent" | "Remediation Agent"
    action: str         # what the agent did
    detail: str         # human-readable detail
    timestamp: str      # when it happened


@dataclass
class DevilAdvocate:
    """Counter-arguments against the recommendation."""
    counter_argument: str   # why you might NOT want to do this
    risk_if_ignored: str    # what happens if you don't act


@dataclass
class HistoricalPrecedent:
    """Past similar actions and their outcomes — the Trust Time Machine."""
    similar_alerts: int
    actions_taken: Dict[str, int]     # e.g. {"Quarantined": 18, "Monitored": 3}
    outcomes: Dict[str, int]          # e.g. {"Threat confirmed": 16, "False positive": 5}
    summary: str                      # one-line summary for the UI


@dataclass
class IncidentTemplate:
    """Template for generating a post-action incident report."""
    title: str
    root_cause: str
    safeguards: List[str]


@dataclass
class Recommendation:
    id: str
    action: str
    target_summary: str                       # e.g. "1 device (LAP-4821)"
    confidence_band: str                      # contextual label, never a %
    confidence_driver: str                    # one-line reason for the band
    priority: str = "medium"                  # critical | high | medium | low
    category: str = "security"               # security | compliance | maintenance | access
    reasoning_steps: List[str] = field(default_factory=list)
    factors: List[Factor] = field(default_factory=list)
    data_sources: List[DataSource] = field(default_factory=list)
    limitations: List[str] = field(default_factory=list)
    alternatives: List[Alternative] = field(default_factory=list)
    controls: List[str] = field(default_factory=lambda: [
        "Approve", "Override", "Ask Why", "See Alternatives", "Escalate to Human Review",
    ])
    # BONUS features
    devil_advocate: Optional[DevilAdvocate] = None
    agent_pipeline: List[AgentStep] = field(default_factory=list)
    historical_precedent: Optional[HistoricalPrecedent] = None
    incident_template: Optional[IncidentTemplate] = None
    # State
    status: str = "pending"                   # pending | approved | overridden | escalated | dismissed
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
    confidence_band: str = ""    # for visual indicators in the log
    category: str = ""           # security | compliance | maintenance | access
    priority: str = ""           # critical | high | medium | low
    note: str = ""

    def to_dict(self) -> dict:
        return asdict(self)
