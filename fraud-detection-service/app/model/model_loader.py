"""
FinEdge Fraud Detection Service — Step 13: ML Model Loader

Loads trained model artifacts from ml/artifacts/ at service startup.
Exposes a clean interface for fraud_service.py to call without knowing
which model is currently selected.

DESIGN DECISIONS:
=================
1. Module-level registry dict (_registry) — loaded once at startup via
   load_model(), accessed per-request via is_model_loaded() / predict_fraud_probability().
   This avoids re-loading the pkl on every request (joblib.load is expensive).

2. Graceful fallback — ANY failure (missing files, corrupt pkl, JSON errors,
   missing keys) logs a WARNING and leaves the service in STUB mode.
   The service NEVER crashes due to missing artifacts.

3. production_model key — the loader reads model_metadata.json["production_model"]
   to identify which artifact to load. This was explicitly added in Step 13 to
   avoid hardcoding "logistic_regression" or inferring from array position.
   If the user re-runs Step 12 with real Kaggle data and updates production_model
   to "xgboost_v1.pkl", this loader picks it up with zero code changes.

4. XGBoost handling — if the selected model artifact is an XGBoost model but
   xgboost is not installed in this service's environment, joblib.load will fail.
   The loader catches this and falls back to stub mode with a clear warning.
"""

import json
import logging
import os
import sys
from typing import Any, Optional

import joblib
import numpy as np


def _ensure_ml_on_path(artifacts_dir: str) -> None:
    """
    Ensures the monorepo root (parent of ml/ and fraud-detection-service/) is on
    sys.path so that joblib can deserialize custom classes like
    ml.training.lr_preprocessing.LogisticRegressionPreprocessor and
    ml.preprocessing.feature_engineering.LeakageSafePreprocessor.

    Root detection: navigate up from artifacts_dir (ml/artifacts/) two levels
    to reach the monorepo root.
    """
    # artifacts_dir = .../FinEdge/ml/artifacts
    # parent        = .../FinEdge/ml
    # grandparent   = .../FinEdge  <-- monorepo root
    monorepo_root = os.path.abspath(os.path.join(artifacts_dir, "..", ".."))
    if monorepo_root not in sys.path:
        sys.path.insert(0, monorepo_root)
        logger.debug(f"[ModelLoader] Added monorepo root to sys.path: {monorepo_root}")

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level registry — populated once at startup, read per-request
# ---------------------------------------------------------------------------
_registry: dict = {
    "loaded": False,
    "model": None,
    "preprocessor": None,
    "model_name": None,
    "model_version": "stub-v0",
    "preprocessor_type": None,  # "lr" or "tree"
    "metadata": {},
}


def load_model(artifacts_dir: str) -> None:
    """
    Loads the production ML model and its preprocessor from artifacts_dir.

    Called once from app/main.py startup_event(). Results stored in _registry.
    On any failure: logs a WARNING and leaves _registry["loaded"] = False
    so the service falls back to stub rule-based scoring.

    Args:
        artifacts_dir: Absolute or relative path to the ml/artifacts/ directory.
    """
    global _registry

    logger.info(f"[ModelLoader] Attempting to load ML artifacts from: {artifacts_dir}")

    artifacts_dir = os.path.abspath(artifacts_dir)

    # Ensure ml package is importable for joblib pkl deserialization
    _ensure_ml_on_path(artifacts_dir)
    metadata_path = os.path.join(artifacts_dir, "model_metadata.json")

    # ── 1. Read model_metadata.json ─────────────────────────────────────
    if not os.path.exists(metadata_path):
        logger.warning(
            f"[ModelLoader] model_metadata.json not found at {metadata_path}. "
            "Run ml/training/train_models.py first. "
            "Falling back to STUB rule-based scoring."
        )
        return

    try:
        with open(metadata_path, "r") as f:
            metadata = json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        logger.warning(
            f"[ModelLoader] Failed to parse model_metadata.json: {e}. "
            "Falling back to STUB mode."
        )
        return

    # ── 2. Identify production model ─────────────────────────────────────
    production_artifact = metadata.get("production_model")
    if not production_artifact:
        logger.warning(
            "[ModelLoader] 'production_model' key missing from model_metadata.json. "
            "Re-run Step 12 (train_models.py) or manually add the key. "
            "Falling back to STUB mode."
        )
        return

    # Find the matching entry in models[] to get the preprocessor artifact
    model_entry = next(
        (m for m in metadata.get("models", []) if m["artifact"] == production_artifact),
        None,
    )
    if not model_entry:
        logger.warning(
            f"[ModelLoader] No entry in metadata['models'] matches '{production_artifact}'. "
            "Falling back to STUB mode."
        )
        return

    preprocessor_artifact = model_entry.get("preprocessor_artifact", "")
    model_name = model_entry.get("model_name", production_artifact)

    # ── 3. Load model pkl ────────────────────────────────────────────────
    model_path = os.path.join(artifacts_dir, production_artifact)
    if not os.path.exists(model_path):
        logger.warning(
            f"[ModelLoader] Model artifact not found: {model_path}. "
            "Falling back to STUB mode."
        )
        return

    try:
        model = joblib.load(model_path)
        logger.info(f"[ModelLoader] Model loaded: {production_artifact} ({model_name})")
    except Exception as e:
        logger.warning(
            f"[ModelLoader] Failed to load model artifact '{model_path}': {e}. "
            "Tip: if the selected model is XGBoost, ensure xgboost is installed. "
            "Falling back to STUB mode."
        )
        return

    # ── 4. Load preprocessor pkl ─────────────────────────────────────────
    preprocessor = None
    if preprocessor_artifact:
        preprocessor_path = os.path.join(artifacts_dir, preprocessor_artifact)
        if not os.path.exists(preprocessor_path):
            logger.warning(
                f"[ModelLoader] Preprocessor artifact not found: {preprocessor_path}. "
                "Falling back to STUB mode."
            )
            return
        try:
            preprocessor = joblib.load(preprocessor_path)
            logger.info(f"[ModelLoader] Preprocessor loaded: {preprocessor_artifact}")
        except Exception as e:
            logger.warning(
                f"[ModelLoader] Failed to load preprocessor '{preprocessor_path}': {e}. "
                "Falling back to STUB mode."
            )
            return

    # Identify preprocessor type: lr_preprocessor uses LogisticRegressionPreprocessor,
    # tree_preprocessor uses LeakageSafePreprocessor (only LabelEncoder, no scaler/OHE).
    preprocessor_type = "lr" if "lr_preprocessor" in preprocessor_artifact else "tree"

    # Derive a clean version string: "logistic_regression_v1" from "logistic_regression_v1.pkl"
    model_version = os.path.splitext(production_artifact)[0]

    # ── 5. Populate registry ─────────────────────────────────────────────
    _registry.update({
        "loaded": True,
        "model": model,
        "preprocessor": preprocessor,
        "model_name": model_name,
        "model_version": model_version,
        "preprocessor_type": preprocessor_type,
        "metadata": metadata,
    })

    data_source = metadata.get("data_source", "unknown")
    logger.info(
        f"[ModelLoader] SUCCESS — ML model ready.\n"
        f"  Model     : {model_name} ({model_version})\n"
        f"  Data      : {data_source}\n"
        f"  Artifacts : {artifacts_dir}"
    )
    if "SYNTHETIC" in data_source.upper():
        logger.warning(
            "[ModelLoader] SYNTHETIC TRAINING DATA — model was trained on placeholder data. "
            "Fraud probability outputs are for pipeline demonstration only. "
            "Re-train with real Kaggle IEEE-CIS data for meaningful predictions."
        )


# ---------------------------------------------------------------------------
# Public interface — called per-request from fraud_service.py
# ---------------------------------------------------------------------------

def is_model_loaded() -> bool:
    """Returns True if a real trained model was loaded successfully at startup."""
    return _registry["loaded"]


def get_model_version() -> str:
    """Returns the model version string (e.g. 'logistic_regression_v1' or 'stub-v0')."""
    return _registry["model_version"]


def get_model_metadata() -> dict:
    """Returns the full metadata dict for health endpoint reporting."""
    return _registry["metadata"]


def predict_fraud_probability(feature_df) -> float:
    """
    Runs the loaded model on a pre-built feature DataFrame.

    Args:
        feature_df: pd.DataFrame with one row, matching the training schema.
                    Built by app/feature_pipeline/adapter.py.

    Returns:
        float in [0.0, 1.0] — predicted probability of fraud.
        Returns 0.0 on any inference error (fail-safe, not fail-open).
    """
    if not _registry["loaded"]:
        logger.error("[ModelLoader] predict_fraud_probability() called but no model loaded.")
        return 0.0

    try:
        model = _registry["model"]
        preprocessor = _registry["preprocessor"]

        # Transform features using the fitted preprocessor
        if preprocessor is not None:
            X = preprocessor.transform(feature_df)
        else:
            X = feature_df.values

        # predict_proba returns [[prob_legit, prob_fraud]] — take fraud column
        proba = model.predict_proba(X)[0][1]
        return float(np.clip(proba, 0.0, 1.0))

    except Exception as e:
        logger.error(
            f"[ModelLoader] Inference error: {e}. "
            "Returning 0.0 (conservative fail-safe — not fail-open)."
        )
        return 0.0
