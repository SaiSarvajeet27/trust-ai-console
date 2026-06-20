"""Step 05 — Build the activity log for the audit-trail screen.

Produces a plain-language record of past AI actions + the human decision that
followed. Enhanced with confidence_band, category, and priority fields.

Outputs:
  outputs/activity_log.json   (keys: "all", "filtered_security")

Run:
  python scripts/05_build_activity_log.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src import config
from src.schema import ActivityEntry

ENTRIES = [
    ActivityEntry("LOG-014", "2026-06-19 09:41", "Quarantine device LAP-4821",
                  "1 device", "Recommended isolating the device after unusual sign-ins.",
                  "Pending", "—",
                  confidence_band="High Confidence", category="security", priority="critical",
                  note="Awaiting admin decision."),
    ActivityEntry("LOG-013", "2026-06-18 16:02", "Roll out patch KB5031900",
                  "188 devices", "Recommended applying a security update.",
                  "Approved", "A. Sharma",
                  confidence_band="Review Recommended", category="maintenance", priority="high",
                  note="Rolled out with no failures."),
    ActivityEntry("LOG-012", "2026-06-18 11:20", "Disable inactive admin account",
                  "1 account", "Recommended disabling an account unused for 90 days.",
                  "Approved", "A. Sharma",
                  confidence_band="High Confidence", category="access", priority="high"),
    ActivityEntry("LOG-011", "2026-06-17 14:55", "Block external USB on Finance group",
                  "26 devices", "Recommended blocking USB storage after a policy change.",
                  "Overridden", "M. Okafor",
                  confidence_band="Review Recommended", category="compliance", priority="medium",
                  note="Admin kept USB enabled for two approved users."),
    ActivityEntry("LOG-010", "2026-06-17 10:08", "Isolate device DSK-2204",
                  "1 device", "Flagged unusual traffic and recommended isolation.",
                  "Escalated", "M. Okafor",
                  confidence_band="Low — Verify Manually", category="security", priority="high",
                  note="Sent to the security team for review."),
    ActivityEntry("LOG-009", "2026-06-16 17:33", "Force re-auth on 12 devices",
                  "12 devices", "Recommended re-authentication after failed sign-ins.",
                  "Approved", "A. Sharma",
                  confidence_band="High Confidence", category="security", priority="medium"),
    ActivityEntry("LOG-008", "2026-06-16 09:12", "Patch rollback on WKS-1502",
                  "1 device", "Recommended rolling back a failed update.",
                  "Approved", "R. Costa",
                  confidence_band="High Confidence", category="maintenance", priority="medium",
                  note="Device recovered after rollback."),
    ActivityEntry("LOG-007", "2026-06-15 15:47", "Tighten firewall on Sales group",
                  "31 devices", "Recommended a firewall change after unusual traffic.",
                  "Dismissed", "R. Costa",
                  confidence_band="Low — Verify Manually", category="security", priority="low",
                  note="Confirmed as a known internal service."),
    ActivityEntry("LOG-006", "2026-06-15 08:25", "Quarantine device LAP-3310",
                  "1 device", "Recommended isolation after malware indicators.",
                  "Approved", "A. Sharma",
                  confidence_band="High Confidence", category="security", priority="critical",
                  note="Threat contained."),
    ActivityEntry("LOG-005", "2026-06-14 13:09", "Update encryption policy",
                  "240 devices", "Recommended enforcing disk encryption.",
                  "Approved", "M. Okafor",
                  confidence_band="Review Recommended", category="compliance", priority="medium"),
    ActivityEntry("LOG-004", "2026-06-13 10:15", "Revoke access for departed employee",
                  "1 account", "Account for departed employee was still active.",
                  "Approved", "A. Sharma",
                  confidence_band="High Confidence", category="access", priority="high",
                  note="Access revoked within 2 hours of alert."),
    ActivityEntry("LOG-003", "2026-06-12 14:30", "Deploy endpoint protection update",
                  "312 devices", "New endpoint protection signatures available.",
                  "Approved", "R. Costa",
                  confidence_band="High Confidence", category="maintenance", priority="medium"),
    ActivityEntry("LOG-002", "2026-06-11 09:45", "Force password reset for HR team",
                  "45 accounts", "HR credentials found in external breach database.",
                  "Approved", "A. Sharma",
                  confidence_band="Review Recommended", category="security", priority="high",
                  note="All HR passwords reset successfully."),
    ActivityEntry("LOG-001", "2026-06-10 16:20", "Restrict VPN access for contractors",
                  "8 accounts", "Contractor VPN sessions exceeded policy duration.",
                  "Overridden", "M. Okafor",
                  confidence_band="Low — Verify Manually", category="compliance", priority="low",
                  note="Extended access for active project deadline."),
]


def main() -> None:
    config.OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

    all_entries = [e.to_dict() for e in ENTRIES]
    filtered = [e for e in all_entries
                if any(k in e["action"].lower()
                       for k in ("quarantine", "isolate", "firewall", "re-auth", "revoke"))]

    payload = {"all": all_entries, "filtered_security": filtered}
    with open(config.ACTIVITY_LOG_JSON, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"Wrote {len(all_entries)} activity entries "
          f"({len(filtered)} in the security filter) -> {config.ACTIVITY_LOG_JSON}")


if __name__ == "__main__":
    main()
