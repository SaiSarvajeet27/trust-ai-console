"""Explainability -> plain language.

We run LIME over the same zero-shot classifier to find which words in the alert
actually drove the score, then TRANSLATE those raw tokens into the human-facing
factors shown on the "Ask Why" screen. The model tells us *which* signals
mattered; the translation (scenario['factor_translations']) is written by a
human. We never put a raw LIME/SHAP plot in the UI.

If LIME is unavailable, slow, or --offline is used, we fall back to the
scenario's authored_factors -- so the designers are never blocked.
"""
from __future__ import annotations

from . import config


def _weight_label(rank: int) -> str:
    return ["major", "moderate", "minor"][min(rank, 2)]


def explain_with_lime(alert_description: str, candidate_labels: list[str],
                      positive_label: str, factor_translations: dict) -> list[dict]:
    """Return a list of {'factor', 'weight'} derived from real LIME output.

    Raises on any failure so the caller can fall back cleanly.
    """
    import numpy as np
    from lime.lime_text import LimeTextExplainer
    from .confidence import _load_pipeline

    pipe = _load_pipeline()
    pos_index = candidate_labels.index(positive_label)

    def predict_proba(texts):
        out = pipe(list(texts), candidate_labels=candidate_labels, multi_label=False)
        if isinstance(out, dict):
            out = [out]
        rows = []
        for r in out:
            label_to_score = dict(zip(r["labels"], r["scores"]))
            rows.append([label_to_score[l] for l in candidate_labels])
        return np.array(rows)

    explainer = LimeTextExplainer(class_names=candidate_labels)
    exp = explainer.explain_instance(
        alert_description,
        predict_proba,
        labels=(pos_index,),
        num_features=config.LIME_NUM_FEATURES,
        num_samples=config.LIME_NUM_SAMPLES,
    )

    # Tokens that PUSH TOWARD the positive label (positive weight), ranked.
    contributions = [(tok, w) for tok, w in exp.as_list(label=pos_index) if w > 0]
    contributions.sort(key=lambda x: x[1], reverse=True)

    factors: list[dict] = []
    seen = set()
    for rank, (token, _weight) in enumerate(contributions):
        human = factor_translations.get(token.lower())
        if human and human not in seen:
            seen.add(human)
            factors.append({"factor": human, "weight": _weight_label(len(factors))})
        if len(factors) >= 3:
            break
    return factors


def factors_for_scenario(scenario: dict, offline: bool) -> list[dict]:
    """Best-effort real factors, with a clean fallback to authored factors."""
    if offline:
        return scenario["authored_factors"]
    try:
        factors = explain_with_lime(
            scenario["alert_description"],
            scenario["candidate_labels"],
            scenario["positive_label"],
            scenario["factor_translations"],
        )
        # If LIME surfaced nothing mappable, fall back rather than ship blanks.
        return factors if factors else scenario["authored_factors"]
    except Exception as exc:  # noqa: BLE001 - resilience is the point here
        print(f"  [explain] LIME unavailable ({exc.__class__.__name__}); "
              f"using authored factors for {scenario['id']}.")
        return scenario["authored_factors"]
