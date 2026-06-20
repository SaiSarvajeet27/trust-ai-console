// Generated from the backend pipeline output (recommendations.json + activity_log.json).
// Re-generate by running the pipeline and the converter.

export const RECOMMENDATIONS = [
  {
    "id": "REC-001",
    "title": "Quarantine device LAP-4821",
    "target": "1 device (LAP-4821)",
    "confidence": "High",
    "status": "pending",
    "reasoning": "This device tried to sign in 14 times in 10 minutes from a location it has never connected from before.",
    "category": "SECURITY",
    "impact": "Critical",
    "age": "4m ago",
    "confidenceDriver": "Strongly supported by sign-ins from an unusual location and a clear match to past cases.",
    "reasoningSteps": [
      "This device tried to sign in 14 times in 10 minutes from a location it has never connected from before.",
      "It is 47 days behind on security updates, leaving a known weakness open.",
      "It is currently contacting an address that has been linked to attacks elsewhere.",
      "343 devices with this same profile showed this exact pattern shortly before a breach last quarter."
    ],
    "dataSources": [
      {
        "tag": "METRICS",
        "label": "Live sign-in and network activity from this device over the last 24 hours"
      },
      {
        "tag": "METRICS",
        "label": "Behavioral patterns from 343 devices with a similar profile over the last 14 days"
      },
      {
        "tag": "LOGS",
        "label": "An external feed of addresses known to be involved in attacks"
      },
      {
        "tag": "CONFIG",
        "label": "Your organization's rule to isolate devices contacting flagged addresses"
      }
    ],
    "limitations": [],
    "factors": [
      {
        "name": "sign-ins from an unusual location",
        "value": 92,
        "level": "Major",
        "color": "#3b82f6"
      },
      {
        "name": "contact with a flagged address",
        "value": 88,
        "level": "Major",
        "color": "#3b82f6"
      },
      {
        "name": "outdated security updates",
        "value": 58,
        "level": "Moderate",
        "color": "#8b5cf6"
      }
    ],
    "alternatives": [
      {
        "id": "ALT-A",
        "title": "Isolate network access only",
        "tradeoff": "Less disruptive, but the device keeps running and could still be at risk.",
        "confidence": 82,
        "risk": "Low"
      },
      {
        "id": "ALT-B",
        "title": "Force re-authentication and keep monitoring",
        "tradeoff": "Lets the user keep working, but delays containment if this is a real attack.",
        "confidence": 64,
        "risk": "Medium"
      }
    ]
  },
  {
    "id": "REC-002",
    "title": "Roll out patch KB5034441 to affected devices",
    "target": "212 devices",
    "confidence": "Review",
    "status": "pending",
    "reasoning": "A new update fixes a security weakness that is present on 212 of your devices.",
    "category": "COMPLIANCE",
    "impact": "High",
    "age": "12m ago",
    "confidenceDriver": "Supported by a known security weakness on many devices, but a quick human check is worth it before acting.",
    "reasoningSteps": [
      "A new update fixes a security weakness that is present on 212 of your devices.",
      "Applying it closes the weakness before it can be used against you.",
      "On similar hardware, a small number of these updates have failed and needed a manual retry, so this is worth a quick review before a full roll-out."
    ],
    "dataSources": [
      {
        "tag": "METRICS",
        "label": "A vulnerability scan covering 212 affected devices in your fleet"
      },
      {
        "tag": "CONFIG",
        "label": "Your update policy, which prioritizes security fixes"
      },
      {
        "tag": "SCHEDULE",
        "label": "Outcome patterns from similar updates on comparable hardware"
      }
    ],
    "limitations": [
      "This update has not yet been tested on the Dell Latitude 7440 devices in your fleet."
    ],
    "factors": [
      {
        "name": "a known security weakness on many devices",
        "value": 92,
        "level": "Major",
        "color": "#3b82f6"
      },
      {
        "name": "a small past failure rate on similar hardware",
        "value": 62,
        "level": "Moderate",
        "color": "#8b5cf6"
      },
      {
        "name": "a required reboot",
        "value": 26,
        "level": "Minor",
        "color": "#334155"
      }
    ],
    "alternatives": [
      {
        "id": "ALT-A",
        "title": "Stage to a small pilot group first",
        "tradeoff": "Safer, but the remaining devices stay exposed for longer.",
        "confidence": 82,
        "risk": "Low"
      },
      {
        "id": "ALT-B",
        "title": "Schedule for the next maintenance window",
        "tradeoff": "Avoids interrupting users now, but delays the fix.",
        "confidence": 64,
        "risk": "Medium"
      }
    ]
  },
  {
    "id": "REC-003",
    "title": "Tighten firewall policy for the Finance device group",
    "target": "79 devices (Finance group)",
    "confidence": "Low",
    "status": "pending",
    "reasoning": "Devices in the Finance group are exchanging traffic with a part of the network that is not normally managed.",
    "category": "SECURITY",
    "impact": "Low",
    "age": "28m ago",
    "confidenceDriver": "Based on unusual internal traffic, but the signals are weak or new \u2014 verify manually.",
    "reasoningSteps": [
      "Devices in the Finance group are exchanging traffic with a part of the network that is not normally managed.",
      "This could be an early sign of risk, or it could be a normal service we simply have not seen before.",
      "Because this pattern is new to your environment, we are less sure than usual and recommend a person take a look before any change is made."
    ],
    "dataSources": [
      {
        "tag": "METRICS",
        "label": "Network flow logs from the 79-device Finance group over the last 7 days"
      },
      {
        "tag": "SCHEDULE",
        "label": "A comparison against typical traffic patterns for this group"
      }
    ],
    "limitations": [
      "This traffic pattern has not been seen in your environment before, so confidence is limited.",
      "Tightening the policy may interrupt a legitimate service if this turns out to be normal activity."
    ],
    "factors": [
      {
        "name": "unusual internal traffic",
        "value": 66,
        "level": "Moderate",
        "color": "#8b5cf6"
      },
      {
        "name": "an unmanaged part of the network",
        "value": 62,
        "level": "Moderate",
        "color": "#8b5cf6"
      },
      {
        "name": "a pattern never seen here before",
        "value": 84,
        "level": "Major",
        "color": "#3b82f6"
      }
    ],
    "alternatives": [
      {
        "id": "ALT-A",
        "title": "Monitor for 48 hours before deciding",
        "tradeoff": "Avoids breaking anything, but leaves the possible risk open longer.",
        "confidence": 82,
        "risk": "Low"
      },
      {
        "id": "ALT-B",
        "title": "Ask the network owner to confirm the service",
        "tradeoff": "Most accurate, but depends on a human reply and takes time.",
        "confidence": 64,
        "risk": "Medium"
      }
    ]
  },
  {
    "id": "REC-004",
    "title": "Disable inactive privileged account",
    "target": "1 account (svc-backup-03)",
    "confidence": "High",
    "status": "pending",
    "reasoning": "This account has not been used in 96 days but still has full admin rights.",
    "category": "IDENTITY",
    "impact": "Critical",
    "age": "1h ago",
    "confidenceDriver": "Strongly supported by dormant for 96 days and a clear match to past cases.",
    "reasoningSteps": [
      "This account has not been used in 96 days but still has full admin rights.",
      "Dormant accounts with high privileges are a common way in for attackers.",
      "Disabling it removes the risk, and it can be re-enabled if someone needs it."
    ],
    "dataSources": [
      {
        "tag": "METRICS",
        "label": "Sign-in and activity history for this account"
      },
      {
        "tag": "CONFIG",
        "label": "Your least-privilege rule for unused privileged accounts"
      }
    ],
    "limitations": [],
    "factors": [
      {
        "name": "dormant for 96 days",
        "value": 92,
        "level": "Major",
        "color": "#3b82f6"
      },
      {
        "name": "full administrative rights",
        "value": 88,
        "level": "Major",
        "color": "#3b82f6"
      },
      {
        "name": "no recent activity",
        "value": 58,
        "level": "Moderate",
        "color": "#8b5cf6"
      }
    ],
    "alternatives": [
      {
        "id": "ALT-A",
        "title": "Downgrade its privileges instead of disabling",
        "tradeoff": "Keeps the account, but a dormant account still adds some risk.",
        "confidence": 82,
        "risk": "Low"
      },
      {
        "id": "ALT-B",
        "title": "Notify the owner before disabling",
        "tradeoff": "Safer if it's still needed, but leaves the risk open longer.",
        "confidence": 64,
        "risk": "Medium"
      }
    ]
  },
  {
    "id": "REC-005",
    "title": "Force password reset for the Sales team",
    "target": "84 accounts (Sales team)",
    "confidence": "Review",
    "status": "pending",
    "reasoning": "Accounts across the 84-person Sales team appeared in a recent credential leak.",
    "category": "IDENTITY",
    "impact": "High",
    "age": "2h ago",
    "confidenceDriver": "Supported by appearance in a credential leak, but a quick human check is worth it before acting.",
    "reasoningSteps": [
      "Accounts across the 84-person Sales team appeared in a recent credential leak.",
      "Resetting their passwords closes off anyone trying to use the leaked details.",
      "Some leaked entries may be old, so this is worth a quick review before forcing it on everyone."
    ],
    "dataSources": [
      {
        "tag": "LOGS",
        "label": "A feed of credentials found in known leaks"
      },
      {
        "tag": "METRICS",
        "label": "The current account list for the Sales team"
      }
    ],
    "limitations": [
      "Some leaked entries may be old and no longer valid."
    ],
    "factors": [
      {
        "name": "appearance in a credential leak",
        "value": 92,
        "level": "Major",
        "color": "#3b82f6"
      },
      {
        "name": "accounts still active",
        "value": 62,
        "level": "Moderate",
        "color": "#8b5cf6"
      },
      {
        "name": "possibly outdated leak entries",
        "value": 26,
        "level": "Minor",
        "color": "#334155"
      }
    ],
    "alternatives": [
      {
        "id": "ALT-A",
        "title": "Reset only confirmed-active accounts",
        "tradeoff": "Less disruptive, but may miss an account that's still at risk.",
        "confidence": 82,
        "risk": "Low"
      },
      {
        "id": "ALT-B",
        "title": "Require additional sign-in verification instead",
        "tradeoff": "Lighter on users, but doesn't fully close the leaked passwords.",
        "confidence": 64,
        "risk": "Medium"
      }
    ]
  },
  {
    "id": "REC-006",
    "title": "Enforce disk encryption on unencrypted devices",
    "target": "127 devices",
    "confidence": "Review",
    "status": "pending",
    "reasoning": "127 devices are currently storing data without disk encryption.",
    "category": "COMPLIANCE",
    "impact": "High",
    "age": "3h ago",
    "confidenceDriver": "Supported by devices without encryption, but a quick human check is worth it before acting.",
    "reasoningSteps": [
      "127 devices are currently storing data without disk encryption.",
      "This goes against your data-protection policy.",
      "Turning it on protects the data if a device is ever lost or stolen."
    ],
    "dataSources": [
      {
        "tag": "METRICS",
        "label": "Encryption status reported by each device"
      },
      {
        "tag": "CONFIG",
        "label": "Your data-protection policy requiring disk encryption"
      }
    ],
    "limitations": [
      "Encrypting older devices may cause a short, one-time slowdown."
    ],
    "factors": [
      {
        "name": "devices without encryption",
        "value": 92,
        "level": "Major",
        "color": "#3b82f6"
      },
      {
        "name": "a policy requirement",
        "value": 62,
        "level": "Moderate",
        "color": "#8b5cf6"
      },
      {
        "name": "data-loss risk if lost or stolen",
        "value": 58,
        "level": "Moderate",
        "color": "#8b5cf6"
      }
    ],
    "alternatives": [
      {
        "id": "ALT-A",
        "title": "Roll out in batches by department",
        "tradeoff": "Smoother, but leaves some devices unprotected for longer.",
        "confidence": 82,
        "risk": "Low"
      },
      {
        "id": "ALT-B",
        "title": "Schedule it to run overnight",
        "tradeoff": "Avoids interrupting users, but delays protection by a day.",
        "confidence": 64,
        "risk": "Medium"
      }
    ]
  },
  {
    "id": "REC-007",
    "title": "Isolate device showing malware indicators",
    "target": "1 device (WKS-1377)",
    "confidence": "High",
    "status": "pending",
    "reasoning": "This device is rapidly encrypting files, which matches ransomware behaviour.",
    "category": "SECURITY",
    "impact": "Critical",
    "age": "5h ago",
    "confidenceDriver": "Strongly supported by ransomware-like file activity and a clear match to past cases.",
    "reasoningSteps": [
      "This device is rapidly encrypting files, which matches ransomware behaviour.",
      "It is contacting an address used by attackers to control infected machines.",
      "Isolating it now stops the infection from spreading to other devices."
    ],
    "dataSources": [
      {
        "tag": "METRICS",
        "label": "Live file and network activity from this device"
      },
      {
        "tag": "LOGS",
        "label": "A feed of attacker command-and-control addresses"
      },
      {
        "tag": "CONFIG",
        "label": "Your rule to isolate devices showing malware activity"
      }
    ],
    "limitations": [],
    "factors": [
      {
        "name": "ransomware-like file activity",
        "value": 92,
        "level": "Major",
        "color": "#3b82f6"
      },
      {
        "name": "contact with a control address",
        "value": 88,
        "level": "Major",
        "color": "#3b82f6"
      },
      {
        "name": "risk of spreading",
        "value": 58,
        "level": "Moderate",
        "color": "#8b5cf6"
      }
    ],
    "alternatives": [
      {
        "id": "ALT-A",
        "title": "Stop the suspicious process only",
        "tradeoff": "Less disruptive, but malware may restart or hide elsewhere.",
        "confidence": 82,
        "risk": "Low"
      },
      {
        "id": "ALT-B",
        "title": "Take a snapshot, then isolate",
        "tradeoff": "Preserves evidence for investigation, but takes a little longer.",
        "confidence": 64,
        "risk": "Medium"
      }
    ]
  },
  {
    "id": "REC-008",
    "title": "Revoke access for a departed employee",
    "target": "1 account (j.okafor)",
    "confidence": "High",
    "status": "pending",
    "reasoning": "This account belongs to someone who left the company 12 days ago.",
    "category": "IDENTITY",
    "impact": "Critical",
    "age": "8h ago",
    "confidenceDriver": "Strongly supported by employee left 12 days ago and a clear match to past cases.",
    "reasoningSteps": [
      "This account belongs to someone who left the company 12 days ago.",
      "It is still active and was signed into as recently as yesterday.",
      "An active account for a departed employee is a serious access risk."
    ],
    "dataSources": [
      {
        "tag": "METRICS",
        "label": "Recent sign-in activity for this account"
      },
      {
        "tag": "CONFIG",
        "label": "Your offboarding rule to revoke access when someone leaves"
      }
    ],
    "limitations": [
      "Confirm with HR that offboarding is complete before revoking."
    ],
    "factors": [
      {
        "name": "employee left 12 days ago",
        "value": 92,
        "level": "Major",
        "color": "#3b82f6"
      },
      {
        "name": "account accessed yesterday",
        "value": 88,
        "level": "Major",
        "color": "#3b82f6"
      },
      {
        "name": "still has active access",
        "value": 58,
        "level": "Moderate",
        "color": "#8b5cf6"
      }
    ],
    "alternatives": [
      {
        "id": "ALT-A",
        "title": "Suspend the account instead of deleting it",
        "tradeoff": "Reversible if it turns out access is still needed, but keeps it on file.",
        "confidence": 82,
        "risk": "Low"
      },
      {
        "id": "ALT-B",
        "title": "Revoke only its remote access first",
        "tradeoff": "Closes the biggest risk fast, but leaves local access open.",
        "confidence": 64,
        "risk": "Medium"
      }
    ]
  }
];

export const AUDIT_LOG = [
  {
    "timestamp": "2026-06-18 16:02",
    "actionSignature": "Roll out patch KB5031900 // 188 devices",
    "inference": "Recommended applying a security update.",
    "decision": "Approved",
    "operator": "A. Sharma",
    "recId": "LOG-013"
  },
  {
    "timestamp": "2026-06-18 11:20",
    "actionSignature": "Disable inactive admin account // 1 account",
    "inference": "Recommended disabling an account unused for 90 days.",
    "decision": "Approved",
    "operator": "A. Sharma",
    "recId": "LOG-012"
  },
  {
    "timestamp": "2026-06-17 14:55",
    "actionSignature": "Block external USB on Finance group // 26 devices",
    "inference": "Recommended blocking USB storage after a policy change.",
    "decision": "Overridden",
    "operator": "M. Okafor",
    "recId": "LOG-011"
  },
  {
    "timestamp": "2026-06-17 10:08",
    "actionSignature": "Isolate device DSK-2204 // 1 device",
    "inference": "Flagged unusual traffic and recommended isolation.",
    "decision": "Escalated",
    "operator": "M. Okafor",
    "recId": "LOG-010"
  },
  {
    "timestamp": "2026-06-16 17:33",
    "actionSignature": "Force re-auth on 12 devices // 12 devices",
    "inference": "Recommended re-authentication after failed sign-ins.",
    "decision": "Approved",
    "operator": "A. Sharma",
    "recId": "LOG-009"
  },
  {
    "timestamp": "2026-06-16 09:12",
    "actionSignature": "Patch rollback on WKS-1502 // 1 device",
    "inference": "Recommended rolling back a failed update.",
    "decision": "Approved",
    "operator": "R. Costa",
    "recId": "LOG-008"
  },
  {
    "timestamp": "2026-06-15 15:47",
    "actionSignature": "Tighten firewall on Sales group // 31 devices",
    "inference": "Recommended a firewall change after unusual traffic.",
    "decision": "Overridden",
    "operator": "R. Costa",
    "recId": "LOG-007"
  },
  {
    "timestamp": "2026-06-15 08:25",
    "actionSignature": "Quarantine device LAP-3310 // 1 device",
    "inference": "Recommended isolation after malware indicators.",
    "decision": "Approved",
    "operator": "A. Sharma",
    "recId": "LOG-006"
  },
  {
    "timestamp": "2026-06-14 13:09",
    "actionSignature": "Update encryption policy // 240 devices",
    "inference": "Recommended enforcing disk encryption.",
    "decision": "Approved",
    "operator": "M. Okafor",
    "recId": "LOG-005"
  }
];
