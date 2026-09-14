import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()  # don't rely on import order elsewhere having already loaded backend/.env

# Portable resolution of the ml-major directory: defaults to
# "<repo root>/ml-major" (three levels up from this file: services/ -> backend/ -> repo root),
# but can be overridden per-machine with an ML_DIR env var (see backend/.env) so nobody
# has to hardcode their own local path here.
_DEFAULT_ML_DIR = Path(__file__).resolve().parent.parent.parent / "ml-major"
_ML_DIR = os.getenv("ML_DIR", str(_DEFAULT_ML_DIR))

if _ML_DIR not in sys.path:
    sys.path.append(_ML_DIR)

from Trust_Score_Engine import RiskScoreEngine

risk_engine = RiskScoreEngine(
    xgb_model_path=f"{_ML_DIR}/final_xgb_shill_model.json",
    xgb_metadata_path=f"{_ML_DIR}/final_model_metadata.json",
    iso_model_path=f"{_ML_DIR}/isolation_forest_model.pkl",
    iso_scaler_path=f"{_ML_DIR}/isolation_forest_scaler.pkl",
    iso_metadata_path=f"{_ML_DIR}/isolation_forest_metadata.json",
)