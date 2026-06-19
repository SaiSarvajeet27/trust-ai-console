"""Real confidence scores from a Hugging Face zero-shot classifier, mapped to
contextual bands. The raw number is recorded for the deck/README but NEVER
shown in the UI -- the UI only ever sees the band label + a plain-language
driver sentence.
"""
from __future__ import annotations
from functools import lru_cache

from . import config


@lru_cache(maxsize=1)
def _load_pipeline():
    """Load the zero-shot pipeline once. Imported lazily so --offline runs
    without transformers/torch installed."""
    from transformers import pipeline
    return pipeline("zero-shot-classification", model=config.ZERO_SHOT_MODEL)


def classify(alert_description: str, candidate_labels: list[str],
             positive_label: str) -> dict:
    """Return {'positive_label', 'score', 'all_scores'} for one alert.

    `score` is the model's score for the POSITIVE label (how strongly the model
    supports taking the recommended action), not just the top label.
    """
    pipe = _load_pipeline()
    result = pipe(alert_description, candidate_labels=candidate_labels,
                  multi_label=False)
    label_to_score = dict(zip(result["labels"], result["scores"]))
    return {
        "positive_label": positive_label,
        "score": float(label_to_score[positive_label]),
        "all_scores": {k: float(v) for k, v in label_to_score.items()},
    }


def score_to_band(score: float) -> str:
    if score >= config.BAND_HIGH:
        return config.BAND_LABELS["high"]
    if score >= config.BAND_REVIEW:
        return config.BAND_LABELS["review"]
    return config.BAND_LABELS["low"]


def driver_sentence(band: str, top_factor: str | None = None) -> str:
    """A one-line, plain-language reason for the band (no numbers)."""
    factor = top_factor or "the available signals"
    if band == config.BAND_LABELS["high"]:
        return f"Strongly supported by {factor} and a clear match to past cases."
    if band == config.BAND_LABELS["review"]:
        return f"Supported by {factor}, but a quick human check is worth it before acting."
    return f"Based on {factor}, but the signals are weak or new — verify manually."
