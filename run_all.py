"""Run the whole pipeline end to end, in order.

  python run_all.py            # use the real Hugging Face model (slower)
  python run_all.py --offline  # predefined scores + authored factors (fast)

Steps 02 and 03 honor --offline; the rest are deterministic.
"""
import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SCRIPTS = ROOT / "scripts"

ORDER = [
    ("01_generate_fleet.py", False),
    ("02_classify_alerts.py", True),
    ("03_explain_alerts.py", True),
    ("04_assemble_recommendations.py", False),
    ("05_build_activity_log.py", False),
    ("06_export_content_pack.py", False),
]


def main(offline: bool) -> None:
    for name, takes_offline in ORDER:
        cmd = [sys.executable, str(SCRIPTS / name)]
        if takes_offline and offline:
            cmd.append("--offline")
        print(f"\n=== {name}{' --offline' if (takes_offline and offline) else ''} ===")
        result = subprocess.run(cmd)
        if result.returncode != 0:
            sys.exit(f"Step failed: {name}")
    print("\nDone. Final artifacts are in ./outputs/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--offline", action="store_true",
                        help="Skip model downloads; use predefined scores + authored factors.")
    args = parser.parse_args()
    main(args.offline)
