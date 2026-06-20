"""The 8 recommendation scenarios — enriched for hackathon.

Each scenario mixes:
  * AUTHORED content (reasoning, sources, limitations, alternatives) -- written
    in plain language by a human. Strings may contain {placeholders} that the
    assembly step fills with REAL counts from the generated fleet.
  * MODEL parameters (alert_description, candidate_labels, positive_label) used
    by the zero-shot classifier to produce a genuine confidence score.
  * factor_translations: maps raw tokens the explainer surfaces to the
    plain-language factor we show in the "Ask Why" screen. authored_factors is
    the offline fallback when the explainer is not run.

NEW fields added for the reengineered UI:
  * devil_advocate  – counter-arguments against the recommendation
  * agent_pipeline  – which AI agents contributed and what they found
  * historical_precedent – past similar actions and their outcomes
  * priority        – critical | high | medium | low
  * category        – security | compliance | maintenance | access
  * incident_template – template for post-action incident report
"""

SCENARIOS = [
    # ------------------------------------------------------------------ HIGH
    {
        "id": "REC-001",
        "action": "Quarantine device LAP-4821",
        "target_device_id": "LAP-4821",
        "target_summary": "1 device (LAP-4821)",
        "priority": "critical",
        "category": "security",
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
        "limitations": [],
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
        # -------------- NEW FIELDS --------------
        "devil_advocate": {
            "counter_argument": (
                "The 14 failed logins could be a legitimate user who forgot "
                "their password while travelling. Quarantining a device used by "
                "a travelling executive could disrupt a critical deal."
            ),
            "risk_if_ignored": (
                "If this IS an active compromise, every minute the device stays "
                "on the network gives the attacker lateral movement opportunity. "
                "Historical data shows breaches from this pattern spread to an "
                "average of 12 devices within 2 hours."
            ),
        },
        "agent_pipeline": [
            {"agent": "Detection Agent", "action": "Flagged anomalous login pattern",
             "detail": "14 failed logins from unrecognized IP in 10-minute window",
             "timestamp": "2026-06-19 09:12"},
            {"agent": "Analysis Agent", "action": "Correlated with threat intel",
             "detail": "Outbound traffic matches known C2 address on ThreatFeed-7",
             "timestamp": "2026-06-19 09:13"},
            {"agent": "Analysis Agent", "action": "Checked patch status",
             "detail": "Device is 47 days behind — CVE-2026-1234 is exploitable",
             "timestamp": "2026-06-19 09:13"},
            {"agent": "Remediation Agent", "action": "Recommended quarantine",
             "detail": "Highest-confidence action given combined risk factors",
             "timestamp": "2026-06-19 09:14"},
        ],
        "historical_precedent": {
            "similar_alerts": 23,
            "actions_taken": {"Quarantined": 18, "Monitored": 3, "Ignored": 2},
            "outcomes": {"Threat confirmed": 16, "False positive": 5, "Inconclusive": 2},
            "summary": "Of 23 similar alerts in the past 90 days, 18 were quarantined and 16 turned out to be real threats. The 2 that were ignored both led to data breaches.",
        },
        "incident_template": {
            "title": "Security Quarantine — {target_summary}",
            "root_cause": "Anomalous login pattern combined with C2 communication and unpatched vulnerabilities.",
            "safeguards": [
                "Enforce maximum 30-day patch windows for all endpoint devices",
                "Add the flagged IP range to the network blocklist",
                "Enable automatic quarantine for devices with 10+ failed logins from unknown locations",
            ],
        },
    },
    # ---------------------------------------------------------------- REVIEW
    {
        "id": "REC-002",
        "action": "Roll out patch KB5034441 to affected devices",
        "target_flag": "needs_patch",
        "target_summary": "{patch_count} devices",
        "priority": "high",
        "category": "maintenance",
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
        "devil_advocate": {
            "counter_argument": (
                "Rolling out to all {patch_count} devices simultaneously risks a "
                "fleet-wide disruption if the patch triggers the known failure mode. "
                "A phased rollout would limit blast radius."
            ),
            "risk_if_ignored": (
                "The vulnerability (CVE-2026-0044) is being actively exploited in "
                "the wild. Each day of delay exposes {patch_count} devices to a "
                "known attack vector."
            ),
        },
        "agent_pipeline": [
            {"agent": "Detection Agent", "action": "Identified vulnerable devices",
             "detail": "Scanned fleet and found {patch_count} devices missing KB5034441",
             "timestamp": "2026-06-18 03:00"},
            {"agent": "Analysis Agent", "action": "Assessed patch risk",
             "detail": "2.3% failure rate on similar Dell hardware in public reports",
             "timestamp": "2026-06-18 03:05"},
            {"agent": "Remediation Agent", "action": "Recommended fleet-wide rollout",
             "detail": "Vulnerability severity outweighs patch failure risk",
             "timestamp": "2026-06-18 03:06"},
        ],
        "historical_precedent": {
            "similar_alerts": 15,
            "actions_taken": {"Patched immediately": 9, "Staged rollout": 4, "Deferred": 2},
            "outcomes": {"Successful": 12, "Partial failure": 2, "Rollback needed": 1},
            "summary": "Of 15 similar patch recommendations, 13 were applied (9 immediately, 4 staged) with a 92% success rate. The 2 deferred patches both led to security incidents.",
        },
        "incident_template": {
            "title": "Security Patch Rollout — KB5034441",
            "root_cause": "Vulnerability CVE-2026-0044 present across {patch_count} fleet devices.",
            "safeguards": [
                "Implement automated vulnerability scanning on a weekly schedule",
                "Create a pilot group for testing patches before fleet-wide rollout",
                "Set a maximum 14-day window for critical security patches",
            ],
        },
    },
    # ------------------------------------------------------------------- LOW
    {
        "id": "REC-003",
        "action": "Tighten firewall policy for the Finance device group",
        "target_flag": "is_finance",
        "target_summary": "{finance_count} devices (Finance group)",
        "priority": "medium",
        "category": "security",
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
        "devil_advocate": {
            "counter_argument": (
                "The 'unusual' traffic could be a newly deployed internal tool "
                "that the Finance team started using this week. Blocking it "
                "without checking could disrupt end-of-quarter financial reporting."
            ),
            "risk_if_ignored": (
                "If this is data exfiltration from the Finance group, sensitive "
                "financial data could be leaving the network. The unmanaged "
                "segment makes forensics harder."
            ),
        },
        "agent_pipeline": [
            {"agent": "Detection Agent", "action": "Flagged anomalous traffic",
             "detail": "Finance group → unmanaged subnet, 340% above baseline",
             "timestamp": "2026-06-17 14:22"},
            {"agent": "Analysis Agent", "action": "Pattern comparison",
             "detail": "No matching pattern in 12-month history for this group",
             "timestamp": "2026-06-17 14:25"},
            {"agent": "Remediation Agent", "action": "Suggested firewall tightening",
             "detail": "Low confidence — flagged for human review",
             "timestamp": "2026-06-17 14:26"},
        ],
        "historical_precedent": {
            "similar_alerts": 8,
            "actions_taken": {"Tightened firewall": 3, "Monitored first": 4, "Dismissed": 1},
            "outcomes": {"Legitimate service": 5, "Actual risk": 2, "Inconclusive": 1},
            "summary": "Of 8 similar alerts, 5 turned out to be legitimate new services. The 2 that were actual risks were caught during monitoring. Consider monitoring first.",
        },
        "incident_template": {
            "title": "Firewall Policy Change — Finance Group",
            "root_cause": "Anomalous traffic between Finance devices and unmanaged network segment.",
            "safeguards": [
                "Require network change requests for new internal services",
                "Implement automatic traffic baselining for all department groups",
                "Create an allow-list process for new internal services",
            ],
        },
    },
    # ------------------------------------------------------------------ HIGH
    {
        "id": "REC-004",
        "action": "Disable inactive privileged account",
        "target_summary": "1 account (svc-backup-03)",
        "priority": "high",
        "category": "access",
        "alert_description": (
            "A privileged service account has not been used in 96 days but still "
            "holds full administrative rights, which is a common target for "
            "attackers."
        ),
        "candidate_labels": [
            "recommended security cleanup",
            "leave as is",
            "needs owner confirmation",
        ],
        "positive_label": "recommended security cleanup",
        "reasoning_steps": [
            "This account has not been used in 96 days but still has full admin rights.",
            "Dormant accounts with high privileges are a common way in for attackers.",
            "Disabling it removes the risk, and it can be re-enabled if someone needs it.",
        ],
        "data_sources": [
            {"type": "telemetry",
             "description": "Sign-in and activity history for this account"},
            {"type": "policy",
             "description": "Your least-privilege rule for unused privileged accounts"},
        ],
        "limitations": [],
        "alternatives": [
            {"action": "Downgrade its privileges instead of disabling",
             "tradeoff": "Keeps the account, but a dormant account still adds some risk."},
            {"action": "Notify the owner before disabling",
             "tradeoff": "Safer if it's still needed, but leaves the risk open longer."},
        ],
        "authored_factors": [
            {"factor": "dormant for 96 days", "weight": "major"},
            {"factor": "full administrative rights", "weight": "major"},
            {"factor": "no recent activity", "weight": "moderate"},
        ],
        "factor_translations": {
            "dormant": "dormant for 96 days",
            "unused": "dormant for 96 days",
            "privileged": "full administrative rights",
            "administrative": "full administrative rights",
        },
        "devil_advocate": {
            "counter_argument": (
                "This is a backup service account. It may only run quarterly or "
                "during disaster-recovery drills. Disabling it could break the "
                "next scheduled backup rotation."
            ),
            "risk_if_ignored": (
                "Dormant privileged accounts are the #1 target for credential "
                "stuffing attacks. If compromised, the attacker gets full admin "
                "access with no one monitoring the account."
            ),
        },
        "agent_pipeline": [
            {"agent": "Detection Agent", "action": "Identified dormant account",
             "detail": "svc-backup-03 — no activity for 96 days, admin privileges active",
             "timestamp": "2026-06-19 02:00"},
            {"agent": "Analysis Agent", "action": "Assessed privilege risk",
             "detail": "Account has Domain Admin + Backup Operator roles",
             "timestamp": "2026-06-19 02:01"},
            {"agent": "Remediation Agent", "action": "Recommended disable",
             "detail": "Least-privilege policy violation — disable with option to re-enable",
             "timestamp": "2026-06-19 02:02"},
        ],
        "historical_precedent": {
            "similar_alerts": 11,
            "actions_taken": {"Disabled": 8, "Downgraded": 2, "Left active": 1},
            "outcomes": {"No issues after disable": 7, "Re-enabled later": 1, "Breach via active account": 1, "Downgrade successful": 2},
            "summary": "Of 11 similar dormant account alerts, 8 were disabled with no issues. The 1 account left active was later used in an unauthorized access incident.",
        },
        "incident_template": {
            "title": "Privileged Account Cleanup — svc-backup-03",
            "root_cause": "Service account left active 96 days past last use with full administrative rights.",
            "safeguards": [
                "Implement 60-day automatic privilege review for all service accounts",
                "Require justification renewal for accounts inactive > 30 days",
                "Enable alerts when dormant privileged accounts are accessed",
            ],
        },
    },
    # ---------------------------------------------------------------- REVIEW
    {
        "id": "REC-005",
        "action": "Force password reset for the Sales team",
        "target_flag": "is_sales",
        "target_summary": "{sales_count} accounts (Sales team)",
        "priority": "high",
        "category": "security",
        "alert_description": (
            "Several Sales accounts appeared in a recent credential leak. Forcing "
            "a reset would close the exposure but will require users to set new "
            "passwords."
        ),
        "candidate_labels": [
            "recommended protective action",
            "low risk, monitor",
            "false match",
        ],
        "positive_label": "recommended protective action",
        "reasoning_steps": [
            "Accounts across the {sales_count}-person Sales team appeared in a recent "
            "credential leak.",
            "Resetting their passwords closes off anyone trying to use the leaked details.",
            "Some leaked entries may be old, so this is worth a quick review before "
            "forcing it on everyone.",
        ],
        "data_sources": [
            {"type": "threat intel",
             "description": "A feed of credentials found in known leaks"},
            {"type": "telemetry",
             "description": "The current account list for the Sales team"},
        ],
        "limitations": [
            "Some leaked entries may be old and no longer valid.",
        ],
        "alternatives": [
            {"action": "Reset only confirmed-active accounts",
             "tradeoff": "Less disruptive, but may miss an account that's still at risk."},
            {"action": "Require additional sign-in verification instead",
             "tradeoff": "Lighter on users, but doesn't fully close the leaked passwords."},
        ],
        "authored_factors": [
            {"factor": "appearance in a credential leak", "weight": "major"},
            {"factor": "accounts still active", "weight": "moderate"},
            {"factor": "possibly outdated leak entries", "weight": "minor"},
        ],
        "factor_translations": {
            "leak": "appearance in a credential leak",
            "credential": "appearance in a credential leak",
            "active": "accounts still active",
        },
        "devil_advocate": {
            "counter_argument": (
                "Forcing a reset on all {sales_count} Sales accounts during business "
                "hours could lock out the team mid-deal. The leak data may be stale — "
                "many credentials could have been changed already."
            ),
            "risk_if_ignored": (
                "Leaked credentials are typically tested by attackers within 24-48 "
                "hours of a dump. Any account still using the leaked password is "
                "immediately vulnerable to account takeover."
            ),
        },
        "agent_pipeline": [
            {"agent": "Detection Agent", "action": "Cross-referenced credential dump",
             "detail": "Matched {sales_count} Sales team emails in DarkLeaks-2026-06 dump",
             "timestamp": "2026-06-18 18:30"},
            {"agent": "Analysis Agent", "action": "Validated account status",
             "detail": "All matched accounts are currently active with standard access",
             "timestamp": "2026-06-18 18:32"},
            {"agent": "Remediation Agent", "action": "Recommended password reset",
             "detail": "Fleet-wide reset for affected team with MFA re-enrollment",
             "timestamp": "2026-06-18 18:33"},
        ],
        "historical_precedent": {
            "similar_alerts": 6,
            "actions_taken": {"Full reset": 4, "Partial reset": 1, "MFA only": 1},
            "outcomes": {"No breach after reset": 5, "Account takeover before reset": 1},
            "summary": "Of 6 credential leak alerts, 5 were resolved without incident through resets. In 1 case, a delayed response led to an account takeover before the reset was applied.",
        },
        "incident_template": {
            "title": "Credential Leak Response — Sales Team",
            "root_cause": "Sales team credentials appeared in external credential dump DarkLeaks-2026-06.",
            "safeguards": [
                "Enable mandatory MFA for all user accounts",
                "Implement continuous credential monitoring against known leak databases",
                "Enforce password complexity and rotation policies",
            ],
        },
    },
    # ---------------------------------------------------------------- REVIEW
    {
        "id": "REC-006",
        "action": "Enforce disk encryption on unencrypted devices",
        "target_flag": "unencrypted",
        "target_summary": "{unencrypted_count} devices",
        "priority": "medium",
        "category": "compliance",
        "alert_description": (
            "A number of devices are storing data without disk encryption, against "
            "policy. Enabling it protects the data if a device is lost or stolen."
        ),
        "candidate_labels": [
            "recommended compliance action",
            "optional",
            "not applicable",
        ],
        "positive_label": "recommended compliance action",
        "reasoning_steps": [
            "{unencrypted_count} devices are currently storing data without disk encryption.",
            "This goes against your data-protection policy.",
            "Turning it on protects the data if a device is ever lost or stolen.",
        ],
        "data_sources": [
            {"type": "telemetry",
             "description": "Encryption status reported by each device"},
            {"type": "policy",
             "description": "Your data-protection policy requiring disk encryption"},
        ],
        "limitations": [
            "Encrypting older devices may cause a short, one-time slowdown.",
        ],
        "alternatives": [
            {"action": "Roll out in batches by department",
             "tradeoff": "Smoother, but leaves some devices unprotected for longer."},
            {"action": "Schedule it to run overnight",
             "tradeoff": "Avoids interrupting users, but delays protection by a day."},
        ],
        "authored_factors": [
            {"factor": "devices without encryption", "weight": "major"},
            {"factor": "a policy requirement", "weight": "moderate"},
            {"factor": "data-loss risk if lost or stolen", "weight": "moderate"},
        ],
        "factor_translations": {
            "encryption": "devices without encryption",
            "policy": "a policy requirement",
            "stolen": "data-loss risk if lost or stolen",
        },
        "devil_advocate": {
            "counter_argument": (
                "Encrypting {unencrypted_count} devices simultaneously could cause "
                "performance issues during work hours. Some older devices may not "
                "handle encryption well and could require hardware upgrades."
            ),
            "risk_if_ignored": (
                "Every unencrypted device that is lost or stolen exposes company "
                "data in plaintext. A single lost laptop can trigger a data breach "
                "notification under GDPR, costing millions in fines."
            ),
        },
        "agent_pipeline": [
            {"agent": "Detection Agent", "action": "Compliance scan completed",
             "detail": "Found {unencrypted_count} devices without BitLocker/FileVault",
             "timestamp": "2026-06-19 01:00"},
            {"agent": "Analysis Agent", "action": "Policy violation confirmed",
             "detail": "Data protection policy DP-003 requires full-disk encryption",
             "timestamp": "2026-06-19 01:02"},
            {"agent": "Remediation Agent", "action": "Recommended enforcement",
             "detail": "Push BitLocker policy via MDM with silent encryption",
             "timestamp": "2026-06-19 01:03"},
        ],
        "historical_precedent": {
            "similar_alerts": 4,
            "actions_taken": {"Enforced immediately": 2, "Batched rollout": 1, "Overnight schedule": 1},
            "outcomes": {"Successful": 3, "Minor slowdowns reported": 1},
            "summary": "All 4 previous encryption enforcement actions succeeded. 1 batch reported minor performance issues on older hardware that resolved within 24 hours.",
        },
        "incident_template": {
            "title": "Encryption Compliance Enforcement",
            "root_cause": "{unencrypted_count} devices running without required disk encryption per policy DP-003.",
            "safeguards": [
                "Enable encryption enforcement as part of device enrollment",
                "Add encryption status to the weekly compliance dashboard",
                "Block access to sensitive resources from unencrypted devices",
            ],
        },
    },
    # ------------------------------------------------------------------ HIGH
    {
        "id": "REC-007",
        "action": "Isolate device showing malware indicators",
        "target_summary": "1 device (WKS-1377)",
        "priority": "critical",
        "category": "security",
        "alert_description": (
            "A device is behaving like it has malware — unexpected encrypted files "
            "and contact with a command-and-control address."
        ),
        "candidate_labels": [
            "confirmed threat",
            "suspicious but unclear",
            "likely false positive",
        ],
        "positive_label": "confirmed threat",
        "reasoning_steps": [
            "This device is rapidly encrypting files, which matches ransomware behaviour.",
            "It is contacting an address used by attackers to control infected machines.",
            "Isolating it now stops the infection from spreading to other devices.",
        ],
        "data_sources": [
            {"type": "telemetry",
             "description": "Live file and network activity from this device"},
            {"type": "threat intel",
             "description": "A feed of attacker command-and-control addresses"},
            {"type": "policy",
             "description": "Your rule to isolate devices showing malware activity"},
        ],
        "limitations": [],
        "alternatives": [
            {"action": "Stop the suspicious process only",
             "tradeoff": "Less disruptive, but malware may restart or hide elsewhere."},
            {"action": "Take a snapshot, then isolate",
             "tradeoff": "Preserves evidence for investigation, but takes a little longer."},
        ],
        "authored_factors": [
            {"factor": "ransomware-like file activity", "weight": "major"},
            {"factor": "contact with a control address", "weight": "major"},
            {"factor": "risk of spreading", "weight": "moderate"},
        ],
        "factor_translations": {
            "encrypted": "ransomware-like file activity",
            "malware": "ransomware-like file activity",
            "command": "contact with a control address",
            "control": "contact with a control address",
        },
        "devil_advocate": {
            "counter_argument": (
                "The file encryption could be a legitimate backup or archival "
                "process. The C2 address match could be a shared hosting IP that "
                "also hosts legitimate services."
            ),
            "risk_if_ignored": (
                "If this is ransomware, the encryption will become irreversible "
                "within minutes. The C2 connection suggests active attacker control — "
                "the infection could spread to the entire network segment."
            ),
        },
        "agent_pipeline": [
            {"agent": "Detection Agent", "action": "Behavioral anomaly detected",
             "detail": "WKS-1377 encrypting 47 files/min — 12x normal rate",
             "timestamp": "2026-06-19 11:45"},
            {"agent": "Detection Agent", "action": "Network anomaly detected",
             "detail": "Outbound connection to 185.234.xx.xx (known C2)",
             "timestamp": "2026-06-19 11:45"},
            {"agent": "Analysis Agent", "action": "Threat classification",
             "detail": "Pattern matches LockBit 4.0 ransomware family with 94% similarity",
             "timestamp": "2026-06-19 11:46"},
            {"agent": "Remediation Agent", "action": "Emergency isolation recommended",
             "detail": "Immediate network isolation to prevent lateral spread",
             "timestamp": "2026-06-19 11:46"},
        ],
        "historical_precedent": {
            "similar_alerts": 5,
            "actions_taken": {"Isolated immediately": 4, "Process stopped only": 1},
            "outcomes": {"Contained": 4, "Spread before containment": 1},
            "summary": "Of 5 similar malware alerts, 4 were isolated immediately and contained. The 1 where only the process was stopped saw the malware restart and spread to 3 additional devices.",
        },
        "incident_template": {
            "title": "Malware Isolation — WKS-1377",
            "root_cause": "Ransomware infection (LockBit 4.0 family) via unknown entry vector.",
            "safeguards": [
                "Deploy next-gen endpoint detection on all workstations",
                "Implement network micro-segmentation to limit lateral movement",
                "Increase backup frequency and test restoration procedures",
                "Block known C2 IP ranges at the network perimeter",
            ],
        },
    },
    # ------------------------------------------------------------------ HIGH
    {
        "id": "REC-008",
        "action": "Revoke access for a departed employee",
        "target_summary": "1 account (j.okafor)",
        "priority": "high",
        "category": "access",
        "alert_description": (
            "An account belonging to an employee who left the company 12 days ago "
            "is still active and was accessed yesterday."
        ),
        "candidate_labels": [
            "recommended offboarding action",
            "verify with HR",
            "no action needed",
        ],
        "positive_label": "recommended offboarding action",
        "reasoning_steps": [
            "This account belongs to someone who left the company 12 days ago.",
            "It is still active and was signed into as recently as yesterday.",
            "An active account for a departed employee is a serious access risk.",
        ],
        "data_sources": [
            {"type": "telemetry",
             "description": "Recent sign-in activity for this account"},
            {"type": "policy",
             "description": "Your offboarding rule to revoke access when someone leaves"},
        ],
        "limitations": [
            "Confirm with HR that offboarding is complete before revoking.",
        ],
        "alternatives": [
            {"action": "Suspend the account instead of deleting it",
             "tradeoff": "Reversible if it turns out access is still needed, but keeps it on file."},
            {"action": "Revoke only its remote access first",
             "tradeoff": "Closes the biggest risk fast, but leaves local access open."},
        ],
        "authored_factors": [
            {"factor": "employee left 12 days ago", "weight": "major"},
            {"factor": "account accessed yesterday", "weight": "major"},
            {"factor": "still has active access", "weight": "moderate"},
        ],
        "factor_translations": {
            "left": "employee left 12 days ago",
            "departed": "employee left 12 days ago",
            "accessed": "account accessed yesterday",
            "active": "still has active access",
        },
        "devil_advocate": {
            "counter_argument": (
                "The employee might be in a transition period — some departures "
                "include a consulting or handover phase. The yesterday login could "
                "be an automated process tied to their account."
            ),
            "risk_if_ignored": (
                "A departed employee with active access can exfiltrate data, "
                "sabotage systems, or sell credentials. The fact the account was "
                "used yesterday suggests someone is actively using it."
            ),
        },
        "agent_pipeline": [
            {"agent": "Detection Agent", "action": "Cross-referenced HR records",
             "detail": "j.okafor marked as departed on 2026-06-07 — account still active",
             "timestamp": "2026-06-19 06:00"},
            {"agent": "Detection Agent", "action": "Sign-in activity detected",
             "detail": "Account used yesterday from IP 203.45.xx.xx (external)",
             "timestamp": "2026-06-19 06:01"},
            {"agent": "Analysis Agent", "action": "Risk assessment",
             "detail": "Active credentials for departed employee — high insider threat risk",
             "timestamp": "2026-06-19 06:02"},
            {"agent": "Remediation Agent", "action": "Recommended immediate revocation",
             "detail": "Disable account, revoke all tokens, reset shared credentials",
             "timestamp": "2026-06-19 06:03"},
        ],
        "historical_precedent": {
            "similar_alerts": 9,
            "actions_taken": {"Revoked immediately": 7, "Suspended": 1, "Verified with HR first": 1},
            "outcomes": {"Clean revocation": 7, "Data exfiltration discovered": 1, "Account needed for handover": 1},
            "summary": "Of 9 similar departed-employee alerts, 7 were revoked immediately without issue. 1 late response discovered data had already been exfiltrated. 1 required a brief re-enable for handover.",
        },
        "incident_template": {
            "title": "Access Revocation — Departed Employee j.okafor",
            "root_cause": "Offboarding process failed to disable account for employee who left 12 days ago.",
            "safeguards": [
                "Automate account disablement within 24 hours of HR departure date",
                "Implement daily reconciliation between HR records and active accounts",
                "Require manager sign-off to keep accounts active past departure date",
            ],
        },
    },
]

# Offline fallback scores (used with --offline so a slow/absent model never
# blocks the designers). Spread across the three bands.
OFFLINE_SCORES = {
    "REC-001": 0.93,   # High Confidence
    "REC-002": 0.68,   # Review Recommended
    "REC-003": 0.49,   # Low — Verify Manually
    "REC-004": 0.88,   # High Confidence
    "REC-005": 0.66,   # Review Recommended
    "REC-006": 0.72,   # Review Recommended
    "REC-007": 0.91,   # High Confidence
    "REC-008": 0.83,   # High Confidence
}
