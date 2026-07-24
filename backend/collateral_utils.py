from config import COLLATERAL_PERCENTAGE


def calculate_collateral_amount(auction):
    """
    Calculates the required collateral amount for a given auction.

    PLACEHOLDER LOGIC: uses a flat percentage of the auction's base_price.
    This will be replaced with a call to the AI risk model (Module 9,
    teammate's component) once that model is ready to integrate.
    Nothing outside this function should need to change when that happens.
    """
    return int(auction.base_price * COLLATERAL_PERCENTAGE)