"""
Prints the AI risk audit trail (ai_risk_logs) straight to the terminal —
no HTTP endpoint, no frontend involved. Talks to the database directly via
SessionLocal, same as verify_ml_engine.py does for the risk engine itself.

Usage (from backend/, with venv active):
    python view_ai_risk_logs.py                      # last 20 logs, all users/auctions
    python view_ai_risk_logs.py --user-id 5           # only this bidder
    python view_ai_risk_logs.py --auction-id 12       # only this auction
    python view_ai_risk_logs.py --user-id 5 --auction-id 12
    python view_ai_risk_logs.py --limit 50 --offset 20  # paging through older entries
"""

import argparse
import json

from database import SessionLocal
from services.ai_risk_audit import get_ai_risk_logs


def format_log(log) -> str:
    lines = [
        f"#{log.id}  {log.created_at}",
        f"  user:       {log.username} (id={log.user_id})",
        f"  auction_id: {log.auction_id}",
        f"  user_stage: {log.user_stage}",
    ]

    if log.user_stage == "new":
        lines.append("  (no model run — first-auction policy, see Trust_Score_Engine.py)")
    else:
        lines += [
            f"  xgboost:            raw_probability={log.xgb_raw_probability}  "
            f"score={log.xgb_score}  weight={log.xgb_weight}  contribution={log.xgb_contribution}",
            f"  isolation_forest:   raw_score={log.iso_raw_score}  "
            f"normalized={log.iso_normalized_score}  weight={log.iso_weight}  contribution={log.iso_contribution}",
        ]

    lines += [
        f"  final_risk_score:   {log.final_risk_score}",
        f"  risk_tier:          {log.risk_tier}",
        f"  required_collateral:{log.required_collateral}",
        f"  model_version:      {log.model_version}",
        f"  ai_explanation:     {json.dumps(log.ai_explanation, indent=2)}",
    ]

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="View AI risk audit logs from the terminal.")
    parser.add_argument("--user-id", type=int, default=None, help="Only show logs for this bidder")
    parser.add_argument("--auction-id", type=int, default=None, help="Only show logs for this auction")
    parser.add_argument("--limit", type=int, default=20, help="Max rows to show (default 20, capped at 200)")
    parser.add_argument("--offset", type=int, default=0, help="Skip this many rows (for paging)")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        logs = get_ai_risk_logs(
            db,
            user_id=args.user_id,
            auction_id=args.auction_id,
            limit=args.limit,
            offset=args.offset,
        )

        if not logs:
            print("No matching AI risk logs found.")
            return

        print(f"Showing {len(logs)} log(s), most recent first:\n")
        for log in logs:
            print(format_log(log))
            print("-" * 70)
    finally:
        db.close()


if __name__ == "__main__":
    main()