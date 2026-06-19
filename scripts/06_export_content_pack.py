"""Step 06 — Export the designer-facing content pack.

Turns recommendations.json + activity_log.json into:
  outputs/content_pack.md    (copy-paste strings for Figma frames)
  outputs/content_pack.json  (same content, structured)

Run:
  python scripts/06_export_content_pack.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src import config


def _load(path, what):
    if not path.exists():
        sys.exit(f"Missing {what} ({path}). Run the earlier steps first.")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _md(recs, log) -> str:
    lines = ["# Content Pack — paste these strings into the Figma frames",
             "",
             "_All text below is plain-language and free of numbers/jargon in the "
             "UI. Internal model scores are omitted on purpose._",
             ""]

    for r in recs:
        lines += [f"## {r['id']} — {r['action']}", ""]
        lines += [f"**Target:** {r['target_summary']}  ",
                  f"**Confidence band:** {r['confidence_band']}  ",
                  f"**Confidence driver:** {r['confidence_driver']}", ""]

        lines += ["**Reasoning steps:**"]
        for i, step in enumerate(r["reasoning_steps"], 1):
            lines.append(f"{i}. {step}")
        lines.append("")

        lines += ["**Ask Why — factors that mattered:**"]
        for fct in r["factors"]:
            lines.append(f"- {fct['factor']} ({fct['weight']})")
        lines.append("")

        lines += ["**Data sources:**"]
        for d in r["data_sources"]:
            lines.append(f"- [{d['type']}] {d['description']}")
        lines.append("")

        if r["limitations"]:
            lines += ["**Limitations:**"]
            for lim in r["limitations"]:
                lines.append(f"- {lim}")
            lines.append("")

        lines += ["**Alternatives:**"]
        for a in r["alternatives"]:
            lines.append(f"- {a['action']} — {a['tradeoff']}")
        lines.append("")

        lines += ["**Human-in-the-loop controls:** " + " · ".join(r["controls"]), "", "---", ""]

    lines += ["## Activity log (audit trail screen)", ""]
    lines += ["| Time | Action | Target | What the AI recommended | Human decision | By |",
              "|---|---|---|---|---|---|"]
    for e in log["all"]:
        lines.append(
            f"| {e['timestamp']} | {e['action']} | {e['target_summary']} | "
            f"{e['ai_recommendation']} | {e['human_decision']} | {e['decided_by']} |"
        )
    lines.append("")
    lines += ["_Filtered (security) view for the search/filter state: "
              + ", ".join(e["id"] for e in log["filtered_security"]) + "._", ""]

    return "\n".join(lines)


def main() -> None:
    config.OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    recs = _load(config.RECOMMENDATIONS_JSON, "recommendations")
    log = _load(config.ACTIVITY_LOG_JSON, "activity log")

    with open(config.CONTENT_PACK_MD, "w", encoding="utf-8") as f:
        f.write(_md(recs, log))

    with open(config.CONTENT_PACK_JSON, "w", encoding="utf-8") as f:
        json.dump({"recommendations": recs, "activity_log": log}, f, indent=2)

    print(f"Wrote content pack -> {config.CONTENT_PACK_MD}")
    print(f"Wrote content pack -> {config.CONTENT_PACK_JSON}")


if __name__ == "__main__":
    main()
