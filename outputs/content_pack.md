# Content Pack — paste these strings into the Figma frames

_All text below is plain-language and free of numbers/jargon in the UI. Internal model scores are omitted on purpose._

## REC-001 — Quarantine device LAP-4821

**Target:** 1 device (LAP-4821)  
**Confidence band:** High Confidence  
**Confidence driver:** Strongly supported by sign-ins from an unusual location and a clear match to past cases.

**Reasoning steps:**
1. This device tried to sign in 14 times in 10 minutes from a location it has never connected from before.
2. It is 47 days behind on security updates, leaving a known weakness open.
3. It is currently contacting an address that has been linked to attacks elsewhere.
4. 343 devices with this same profile showed this exact pattern shortly before a breach last quarter.

**Ask Why — factors that mattered:**
- outdated security updates (major)
- repeated failed sign-ins (moderate)
- contact with a flagged address (minor)

**Data sources:**
- [telemetry] Live sign-in and network activity from this device over the last 24 hours
- [telemetry] Behavioral patterns from 343 devices with a similar profile over the last 14 days
- [threat intel] An external feed of addresses known to be involved in attacks
- [policy] Your organization's rule to isolate devices contacting flagged addresses

**Alternatives:**
- Isolate network access only — Less disruptive, but the device keeps running and could still be at risk.
- Force re-authentication and keep monitoring — Lets the user keep working, but delays containment if this is a real attack.

**Human-in-the-loop controls:** Approve · Override · Ask Why · See Alternatives · Escalate to Human Review

---

## REC-002 — Roll out patch KB5034441 to affected devices

**Target:** 212 devices  
**Confidence band:** Low — Verify Manually  
**Confidence driver:** Based on a known security weakness on many devices, but the signals are weak or new — verify manually.

**Reasoning steps:**
1. A new update fixes a security weakness that is present on 212 of your devices.
2. Applying it closes the weakness before it can be used against you.
3. On similar hardware, a small number of these updates have failed and needed a manual retry, so this is worth a quick review before a full roll-out.

**Ask Why — factors that mattered:**
- a known security weakness on many devices (major)

**Data sources:**
- [telemetry] A vulnerability scan covering 212 affected devices in your fleet
- [policy] Your update policy, which prioritizes security fixes
- [model prediction] Outcome patterns from similar updates on comparable hardware

**Limitations:**
- This update has not yet been tested on the Dell Latitude 7440 devices in your fleet.

**Alternatives:**
- Stage to a small pilot group first — Safer, but the remaining devices stay exposed for longer.
- Schedule for the next maintenance window — Avoids interrupting users now, but delays the fix.

**Human-in-the-loop controls:** Approve · Override · Ask Why · See Alternatives · Escalate to Human Review

---

## REC-003 — Tighten firewall policy for the Finance device group

**Target:** 78 devices (Finance group)  
**Confidence band:** Review Recommended  
**Confidence driver:** Supported by unusual internal traffic, but a quick human check is worth it before acting.

**Reasoning steps:**
1. Devices in the Finance group are exchanging traffic with a part of the network that is not normally managed.
2. This could be an early sign of risk, or it could be a normal service we simply have not seen before.
3. Because this pattern is new to your environment, we are less sure than usual and recommend a person take a look before any change is made.

**Ask Why — factors that mattered:**
- unusual internal traffic (major)

**Data sources:**
- [telemetry] Network flow logs from the 78-device Finance group over the last 7 days
- [model prediction] A comparison against typical traffic patterns for this group

**Limitations:**
- This traffic pattern has not been seen in your environment before, so confidence is limited.
- Tightening the policy may interrupt a legitimate service if this turns out to be normal activity.

**Alternatives:**
- Monitor for 48 hours before deciding — Avoids breaking anything, but leaves the possible risk open longer.
- Ask the network owner to confirm the service — Most accurate, but depends on a human reply and takes time.

**Human-in-the-loop controls:** Approve · Override · Ask Why · See Alternatives · Escalate to Human Review

---

## REC-004 — Disable inactive privileged account

**Target:** 1 account (svc-backup-03)  
**Confidence band:** Low — Verify Manually  
**Confidence driver:** Based on dormant for 96 days, but the signals are weak or new — verify manually.

**Reasoning steps:**
1. This account has not been used in 96 days but still has full admin rights.
2. Dormant accounts with high privileges are a common way in for attackers.
3. Disabling it removes the risk, and it can be re-enabled if someone needs it.

**Ask Why — factors that mattered:**
- full administrative rights (major)

**Data sources:**
- [telemetry] Sign-in and activity history for this account
- [policy] Your least-privilege rule for unused privileged accounts

**Alternatives:**
- Downgrade its privileges instead of disabling — Keeps the account, but a dormant account still adds some risk.
- Notify the owner before disabling — Safer if it's still needed, but leaves the risk open longer.

**Human-in-the-loop controls:** Approve · Override · Ask Why · See Alternatives · Escalate to Human Review

---

## REC-005 — Force password reset for the Sales team

**Target:** 79 accounts (Sales team)  
**Confidence band:** Review Recommended  
**Confidence driver:** Supported by appearance in a credential leak, but a quick human check is worth it before acting.

**Reasoning steps:**
1. Accounts across the 79-person Sales team appeared in a recent credential leak.
2. Resetting their passwords closes off anyone trying to use the leaked details.
3. Some leaked entries may be old, so this is worth a quick review before forcing it on everyone.

**Ask Why — factors that mattered:**
- appearance in a credential leak (major)

**Data sources:**
- [threat intel] A feed of credentials found in known leaks
- [telemetry] The current account list for the Sales team

**Limitations:**
- Some leaked entries may be old and no longer valid.

**Alternatives:**
- Reset only confirmed-active accounts — Less disruptive, but may miss an account that's still at risk.
- Require additional sign-in verification instead — Lighter on users, but doesn't fully close the leaked passwords.

**Human-in-the-loop controls:** Approve · Override · Ask Why · See Alternatives · Escalate to Human Review

---

## REC-006 — Enforce disk encryption on unencrypted devices

**Target:** 136 devices  
**Confidence band:** Low — Verify Manually  
**Confidence driver:** Based on devices without encryption, but the signals are weak or new — verify manually.

**Reasoning steps:**
1. 136 devices are currently storing data without disk encryption.
2. This goes against your data-protection policy.
3. Turning it on protects the data if a device is ever lost or stolen.

**Ask Why — factors that mattered:**
- devices without encryption (major)

**Data sources:**
- [telemetry] Encryption status reported by each device
- [policy] Your data-protection policy requiring disk encryption

**Limitations:**
- Encrypting older devices may cause a short, one-time slowdown.

**Alternatives:**
- Roll out in batches by department — Smoother, but leaves some devices unprotected for longer.
- Schedule it to run overnight — Avoids interrupting users, but delays protection by a day.

**Human-in-the-loop controls:** Approve · Override · Ask Why · See Alternatives · Escalate to Human Review

---

## REC-007 — Isolate device showing malware indicators

**Target:** 1 device (WKS-1377)  
**Confidence band:** Review Recommended  
**Confidence driver:** Supported by ransomware-like file activity, but a quick human check is worth it before acting.

**Reasoning steps:**
1. This device is rapidly encrypting files, which matches ransomware behaviour.
2. It is contacting an address used by attackers to control infected machines.
3. Isolating it now stops the infection from spreading to other devices.

**Ask Why — factors that mattered:**
- ransomware-like file activity (major)

**Data sources:**
- [telemetry] Live file and network activity from this device
- [threat intel] A feed of attacker command-and-control addresses
- [policy] Your rule to isolate devices showing malware activity

**Alternatives:**
- Stop the suspicious process only — Less disruptive, but malware may restart or hide elsewhere.
- Take a snapshot, then isolate — Preserves evidence for investigation, but takes a little longer.

**Human-in-the-loop controls:** Approve · Override · Ask Why · See Alternatives · Escalate to Human Review

---

## REC-008 — Revoke access for a departed employee

**Target:** 1 account (j.okafor)  
**Confidence band:** Low — Verify Manually  
**Confidence driver:** Based on employee left 12 days ago, but the signals are weak or new — verify manually.

**Reasoning steps:**
1. This account belongs to someone who left the company 12 days ago.
2. It is still active and was signed into as recently as yesterday.
3. An active account for a departed employee is a serious access risk.

**Ask Why — factors that mattered:**
- employee left 12 days ago (major)

**Data sources:**
- [telemetry] Recent sign-in activity for this account
- [policy] Your offboarding rule to revoke access when someone leaves

**Limitations:**
- Confirm with HR that offboarding is complete before revoking.

**Alternatives:**
- Suspend the account instead of deleting it — Reversible if it turns out access is still needed, but keeps it on file.
- Revoke only its remote access first — Closes the biggest risk fast, but leaves local access open.

**Human-in-the-loop controls:** Approve · Override · Ask Why · See Alternatives · Escalate to Human Review

---

## Activity log (audit trail screen)

| Time | Action | Target | What the AI recommended | Human decision | By |
|---|---|---|---|---|---|
| 2026-06-19 09:41 | Quarantine device LAP-4821 | 1 device | Recommended isolating the device after unusual sign-ins. | Pending | — |
| 2026-06-18 16:02 | Roll out patch KB5031900 | 188 devices | Recommended applying a security update. | Approved | A. Sharma |
| 2026-06-18 11:20 | Disable inactive admin account | 1 account | Recommended disabling an account unused for 90 days. | Approved | A. Sharma |
| 2026-06-17 14:55 | Block external USB on Finance group | 26 devices | Recommended blocking USB storage after a policy change. | Overridden | M. Okafor |
| 2026-06-17 10:08 | Isolate device DSK-2204 | 1 device | Flagged unusual traffic and recommended isolation. | Escalated | M. Okafor |
| 2026-06-16 17:33 | Force re-auth on 12 devices | 12 devices | Recommended re-authentication after failed sign-ins. | Approved | A. Sharma |
| 2026-06-16 09:12 | Patch rollback on WKS-1502 | 1 device | Recommended rolling back a failed update. | Approved | R. Costa |
| 2026-06-15 15:47 | Tighten firewall on Sales group | 31 devices | Recommended a firewall change after unusual traffic. | Dismissed | R. Costa |
| 2026-06-15 08:25 | Quarantine device LAP-3310 | 1 device | Recommended isolation after malware indicators. | Approved | A. Sharma |
| 2026-06-14 13:09 | Update encryption policy | 240 devices | Recommended enforcing disk encryption. | Approved | M. Okafor |
| 2026-06-13 10:15 | Revoke access for departed employee | 1 account | Account for departed employee was still active. | Approved | A. Sharma |
| 2026-06-12 14:30 | Deploy endpoint protection update | 312 devices | New endpoint protection signatures available. | Approved | R. Costa |
| 2026-06-11 09:45 | Force password reset for HR team | 45 accounts | HR credentials found in external breach database. | Approved | A. Sharma |
| 2026-06-10 16:20 | Restrict VPN access for contractors | 8 accounts | Contractor VPN sessions exceeded policy duration. | Overridden | M. Okafor |

_Filtered (security) view for the search/filter state: LOG-014, LOG-010, LOG-009, LOG-007, LOG-006, LOG-004._
