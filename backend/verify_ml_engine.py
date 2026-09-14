"""
One-off sanity check for the ML risk engine integration.

Runs the actual XGBoost + isolation-forest scoring path (the part that only
fires for bidders with completed_auctions > 0) using synthetic feature data,
bypassing the database entirely. Confirms the models load, score, and that
evaluate_auction_entry() returns a well-formed result.

Usage (from backend/, with venv active):
    python verify_ml_engine.py
"""

import pandas as pd

from services.risk_engine_loader import risk_engine
from Trust_Score_Engine import evaluate_auction_entry

FEATURE_COLUMNS = [
    "Bidder_Tendency", "Bidding_Ratio", "Successive_Outbidding", "Last_Bidding",
    "Auction_Bids", "Starting_Price_Average", "Early_Bidding", "Winning_Ratio",
    "Auction_Duration",
]


def run_case(label, feature_values, completed_auctions=5, starting_price=50000):
    features = pd.DataFrame([dict(zip(FEATURE_COLUMNS, feature_values))])
    result = evaluate_auction_entry(
        engine=risk_engine,
        user_id="sanity-check",
        starting_price=starting_price,
        completed_auctions=completed_auctions,
        features=features,
    )
    print(f"\n--- {label} ---")
    print(f"  user_stage:       {result['user_stage']}")
    print(f"  risk_tier:        {result['risk_tier']}")
    print(f"  risk_score:       {result['risk_score']}")
    print(f"  entry_allowed:    {result['entry_allowed']}")
    print(f"  collateral:       {result['collateral']}")


if __name__ == "__main__":
    print("Loading models and running synthetic scoring cases...")

    # A brand-new bidder: skips the model entirely, flat base-rate collateral.
    run_case("New bidder (completed_auctions=0)", [0] * 9, completed_auctions=0)

    # A "clean" established bidder profile: low tendency/outbidding, healthy ratios.
    run_case("Established, low-risk-looking profile", [
        0.1, 0.3, 0.0, 0.6, 0.3, 0.9, 0.4, 0.4, 0.5,
    ])

    # A "suspicious" established bidder profile: high tendency + successive
    # outbidding + narrow starting-price ratio — classic shill-bidding signals.
    run_case("Established, high-risk-looking profile", [
        0.95, 0.9, 1.0, 0.95, 1.0, 0.98, 0.95, 0.9, 0.1,
    ])

    print("\nIf all three cases above printed without errors, the XGBoost + "
          "isolation-forest scoring path is working end-to-end.")
