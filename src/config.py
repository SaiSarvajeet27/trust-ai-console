"""Central configuration for the pipeline.

Everything tunable lives here so the numbered scripts stay readable.
"""
from pathlib import Path

# ----------------------------------------------------------------------------
# Paths (resolved relative to the repo root, regardless of where you run from)
# ----------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OUTPUTS_DIR = ROOT / "outputs"

FLEET_JSON = DATA_DIR / "fleet.json"
EVENTS_CSV = DATA_DIR / "events.csv"
CONFIDENCE_JSON = DATA_DIR / "confidence.json"
EXPLANATIONS_JSON = DATA_DIR / "explanations.json"

RECOMMENDATIONS_JSON = OUTPUTS_DIR / "recommendations.json"
ACTIVITY_LOG_JSON = OUTPUTS_DIR / "activity_log.json"
CONTENT_PACK_MD = OUTPUTS_DIR / "content_pack.md"
CONTENT_PACK_JSON = OUTPUTS_DIR / "content_pack.json"

# ----------------------------------------------------------------------------
# Reproducibility
# ----------------------------------------------------------------------------
SEED = 42

# ----------------------------------------------------------------------------
# Fleet generation
# ----------------------------------------------------------------------------
FLEET_SIZE = 500

# How many pending recommendations the dashboard shows at once. When one is
# decided it drops off and the next pending one automatically takes its place.
WINDOW_SIZE = 8  # increased from 4 to show more on the dashboard

# Exact-count cohorts assigned during generation so the narrative numbers in
# the recommendations are guaranteed to be TRUE in the data.
SIMILAR_PROFILE_COUNT = 342   # scenario 1 ("342 similar devices")
NEEDS_PATCH_COUNT = 212       # scenario 2 ("212 affected devices")
FINANCE_DEPT = "Finance"      # scenario 3 (count derived from the data)

DEVICE_MODELS = [
    "Dell Latitude 7440",
    "Dell Latitude 5550",
    "Dell OptiPlex 7010",
    "Dell Precision 3591",
    "Dell XPS 13 9340",
]
OS_VERSIONS = ["Windows 11 23H2", "Windows 11 22H2", "Windows 10 22H2"]
DEPARTMENTS = ["Finance", "Engineering", "Sales", "Operations", "HR", "Support"]
LOCATIONS = ["HQ-NY", "HQ-LON", "Remote-IN", "Remote-US", "DC-Frankfurt"]

# ----------------------------------------------------------------------------
# Model (Hugging Face zero-shot classification)
# ----------------------------------------------------------------------------
ZERO_SHOT_MODEL = "facebook/bart-large-mnli"

# ----------------------------------------------------------------------------
# Confidence band thresholds (applied to the POSITIVE label's score)
# These are the ONLY place raw numbers live. They never reach the UI.
# ----------------------------------------------------------------------------
BAND_HIGH = 0.80      # >= this  -> "High Confidence"
BAND_REVIEW = 0.55    # >= this  -> "Review Recommended"
# below BAND_REVIEW    -> "Low — Verify Manually"

BAND_LABELS = {
    "high": "High Confidence",
    "review": "Review Recommended",
    "low": "Low — Verify Manually",
}

# ----------------------------------------------------------------------------
# LIME explainability
# ----------------------------------------------------------------------------
LIME_NUM_SAMPLES = 300   # keep low; each sample is a model call (slow on CPU)
LIME_NUM_FEATURES = 6

# ----------------------------------------------------------------------------
# Plain-language guardrail: terms that must NEVER appear in user-facing strings
# ----------------------------------------------------------------------------
BANNED_TERMS = [
    "probability", "softmax", "logit", "embedding", "neural", "model score",
    "confidence score", "shap", "lime", "classifier", "inference", "%",
    "p-value", "feature vector", "tensor",
]

# ----------------------------------------------------------------------------
# Autonomy modes (new)
# ----------------------------------------------------------------------------
AUTONOMY_MODES = {
    "always_ask": {
        "label": "Always Ask",
        "description": "AI recommends, human decides every action",
        "auto_approve": False,
        "notify": True,
    },
    "recommend_only": {
        "label": "Recommend Only",
        "description": "AI surfaces recommendations but takes no action",
        "auto_approve": False,
        "notify": True,
    },
    "act_and_notify": {
        "label": "Act & Notify",
        "description": "AI acts on high-confidence items and notifies you",
        "auto_approve": True,  # only for high confidence
        "notify": True,
    },
    "full_auto": {
        "label": "Full Autonomous",
        "description": "AI handles routine actions autonomously (requires admin approval to enable)",
        "auto_approve": True,
        "notify": False,
    },
}

DEFAULT_AUTONOMY_MODE = "always_ask"

# ----------------------------------------------------------------------------
# Priority configuration
# ----------------------------------------------------------------------------
PRIORITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3}

# ----------------------------------------------------------------------------
# Device health thresholds
# ----------------------------------------------------------------------------
HEALTH_CRITICAL_RISK = 80    # risk_score >= this -> critical
HEALTH_AT_RISK = 50          # risk_score >= this -> at_risk
# below AT_RISK              -> healthy
