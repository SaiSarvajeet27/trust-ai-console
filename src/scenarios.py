"""The 3 recommendation scenarios.

Each scenario mixes:
  * AUTHORED content (reasoning, sources, limitations, alternatives) -- written
    in plain language by a human. Strings may contain {placeholders} that the
    assembly step fills with REAL counts from the generated fleet.
  * MODEL parameters (alert_description, candidate_labels, positive_label) used
    by the zero-shot classifier to produce a genuine confidence score.
  * factor_translations: maps raw tokens the explainer surfaces to the
    plain-language factor we show in the "Ask Why" screen. authored_factors is
    the offline fallback when the explainer is not run.

Pick scenarios at different confidence levels so the confidence system has
range to show off: high / review / low.
"""

SCENARIOS = [
    # ------------------------------------------------------------------ HIGH
    {
        "id": "REC-001",
        "action": "Quarantine device LAP-4821",
        "target_device_id": "LAP-4821",
        "target_summary": "1 device (LAP-4821)",
        "alert_description": (
            "Device LAP-4821 recorded 14 failed login attempts from an "
            "unrecognized location within 10 minutes, has not received security "
            "patches in 47 days, and is sending outbound traffic to an address "
            "flagged on a threat intelligence feed."
        ),
        "candidate_labels": [
            "confirmed security threat",
            "routine activity",
            "likely false positive",
        ],
        "positive_label": "confirmed security threat",
        "reasoning_steps": [
            "This device tried to sign in 14 times in 10 minutes from a location "
            "it has never connected from before.",
            "It is 47 days behind on security updates, leaving a known weakness open.",
            "It is currently contacting an address that has been linked to attacks "
            "elsewhere.",
            "{similar_count} devices with this same profile showed this exact pattern "
            "shortly before a breach last quarter.",
        ],
        "data_sources": [
            {"type": "telemetry",
             "description": "Live sign-in and network activity from this device over the last 24 hours"},
            {"type": "telemetry",
             "description": "Behavioral patterns from {similar_count} devices with a similar profile over the last 14 days"},
            {"type": "threat intel",
             "description": "An external feed of addresses known to be involved in attacks"},
            {"type": "policy",
             "description": "Your organization's rule to isolate devices contacting flagged addresses"},
        ],
        "limitations": [],  # high-confidence, nothing at the edge of competence
        "alternatives": [
            {"action": "Isolate network access only",
             "tradeoff": "Less disruptive, but the device keeps running and could still be at risk."},
            {"action": "Force re-authentication and keep monitoring",
             "tradeoff": "Lets the user keep working, but delays containment if this is a real attack."},
        ],
        "authored_factors": [
            {"factor": "sign-ins from an unusual location", "weight": "major"},
            {"factor": "contact with a flagged address", "weight": "major"},
            {"factor": "outdated security updates", "weight": "moderate"},
        ],
        "factor_translations": {
            "failed": "repeated failed sign-ins",
            "login": "repeated failed sign-ins",
            "unrecognized": "sign-ins from an unusual location",
            "location": "sign-ins from an unusual location",
            "flagged": "contact with a flagged address",
            "threat": "contact with a flagged address",
            "outbound": "contact with a flagged address",
            "patches": "outdated security updates",
            "patch": "outdated security updates",
        },
    },
    # ---------------------------------------------------------------- REVIEW
    {
        "id": "REC-002",
        "action": "Roll out patch KB5034441 to affected devices",
        "target_flag": "needs_patch",
        "target_summary": "{patch_count} devices",
        "alert_description": (
            "A security patch addresses a vulnerability present on many devices "
            "in the fleet. The patch has a small reported failure rate on similar "
            "hardware and requires a device reboot to take effect."
        ),
        "candidate_labels": [
            "recommended maintenance action",
            "high-risk change",
            "no action needed",
        ],
        "positive_label": "recommended maintenance action",
        "reasoning_steps": [
            "A new update fixes a security weakness that is present on {patch_count} "
            "of your devices.",
            "Applying it closes the weakness before it can be used against you.",
            "On similar hardware, a small number of these updates have failed and "
            "needed a manual retry, so this is worth a quick review before a full "
            "roll-out.",
        ],
        "data_sources": [
            {"type": "telemetry",
             "description": "A vulnerability scan covering {patch_count} affected devices in your fleet"},
            {"type": "policy",
             "description": "Your update policy, which prioritizes security fixes"},
            {"type": "model prediction",
             "description": "Outcome patterns from similar updates on comparable hardware"},
        ],
        "limitations": [
            "This update has not yet been tested on the Dell Latitude 7440 devices in your fleet.",
        ],
        "alternatives": [
            {"action": "Stage to a small pilot group first",
             "tradeoff": "Safer, but the remaining devices stay exposed for longer."},
            {"action": "Schedule for the next maintenance window",
             "tradeoff": "Avoids interrupting users now, but delays the fix."},
        ],
        "authored_factors": [
            {"factor": "a known security weakness on many devices", "weight": "major"},
            {"factor": "a small past failure rate on similar hardware", "weight": "moderate"},
            {"factor": "a required reboot", "weight": "minor"},
        ],
        "factor_translations": {
            "vulnerability": "a known security weakness on many devices",
            "patch": "a known security weakness on many devices",
            "failure": "a small past failure rate on similar hardware",
            "reboot": "a required reboot",
        },
    },
    # ------------------------------------------------------------------- LOW
    {
        "id": "REC-003",
        "action": "Tighten firewall policy for the Finance device group",
        "target_flag": "is_finance",
        "target_summary": "{finance_count} devices (Finance group)",
        "alert_description": (
            "Unusual internal traffic was seen between the Finance device group "
            "and an unmanaged part of the network. Tightening the firewall policy "
            "might reduce risk, but it could also block a legitimate internal "
            "service that has not been seen before."
        ),
        "candidate_labels": [
            "recommended security change",
            "needs human review",
            "false positive",
        ],
        "positive_label": "recommended security change",
        "reasoning_steps": [
            "Devices in the Finance group are exchanging traffic with a part of the "
            "network that is not normally managed.",
            "This could be an early sign of risk, or it could be a normal service "
            "we simply have not seen before.",
            "Because this pattern is new to your environment, we are less sure than "
            "usual and recommend a person take a look before any change is made.",
        ],
        "data_sources": [
            {"type": "telemetry",
             "description": "Network flow logs from the {finance_count}-device Finance group over the last 7 days"},
            {"type": "model prediction",
             "description": "A comparison against typical traffic patterns for this group"},
        ],
        "limitations": [
            "This traffic pattern has not been seen in your environment before, so confidence is limited.",
            "Tightening the policy may interrupt a legitimate service if this turns out to be normal activity.",
        ],
        "alternatives": [
            {"action": "Monitor for 48 hours before deciding",
             "tradeoff": "Avoids breaking anything, but leaves the possible risk open longer."},
            {"action": "Ask the network owner to confirm the service",
             "tradeoff": "Most accurate, but depends on a human reply and takes time."},
        ],
        "authored_factors": [
            {"factor": "unusual internal traffic", "weight": "moderate"},
            {"factor": "an unmanaged part of the network", "weight": "moderate"},
            {"factor": "a pattern never seen here before", "weight": "major"},
        ],
        "factor_translations": {
            "unusual": "unusual internal traffic",
            "traffic": "unusual internal traffic",
            "unmanaged": "an unmanaged part of the network",
            "legitimate": "a possible legitimate service",
            "service": "a possible legitimate service",
        },
    },
]

# Offline fallback scores (used with --offline so a slow/absent model never
# blocks the designers). Chosen to land in three different bands.
OFFLINE_SCORES = {
    "REC-001": 0.93,   # High Confidence
    "REC-002": 0.68,   # Review Recommended
    "REC-003": 0.49,   # Low — Verify Manually
}
