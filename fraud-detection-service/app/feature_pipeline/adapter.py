"""
FinEdge Fraud Detection Service — Step 13: Feature Pipeline Adapter

Bridges the gap between the live FraudCheckRequest schema and the IEEE-CIS
feature schema expected by the trained model.

============================================================================
TRAINING / SERVING FEATURE SKEW — KNOWN LIMITATION (Explicit, Honest)
============================================================================
The trained model (Step 12) was built on the IEEE-CIS Fraud Detection dataset
which captures ~400 rich features per transaction:
  - V1-V339: anonymized Vesta transaction-behavior signals
  - card1-card6: card network, type, bank, bin, country
  - ProductCD: product category (W, C, R, H, S)
  - addr1/addr2: billing address postal codes
  - dist1/dist2: distance metrics
  - P_emaildomain / R_emaildomain: purchaser/recipient email domains
  - id_01..id_38: device identity features

The live FinEdge FraudCheckRequest ONLY carries:
  - transactionRef, type, fromAccountNumber, toAccountNumber
  - amount, initiatedByUsername, timestamp

This mismatch is the "training/serving skew" problem in production ML systems.
A production solution requires a FEATURE STORE — a system that captures the
same feature set consistently at both training time and serving time. That is
intentionally out of scope for this college project.

APPROACH TAKEN (Best-Effort Mapping):
  - Fields that can be directly derived: TransactionAmt, log_TransactionAmt,
    transaction_hour, transaction_day (from timestamp)
  - All IEEE-CIS-specific fields the live system doesn't collect: filled with
    the sentinel/placeholder values the preprocessor expects for missing data.
    For the LR preprocessor: -999.0 (numeric sentinel, which lr_preprocessing.py
    converts back to NaN for median imputation) and "missing" (categorical token,
    handled by OHE's handle_unknown='ignore').
  - The model's predictions on this sparse feature vector are less accurate than
    the offline evaluation metrics suggest. This is acknowledged honestly.

CONSEQUENCE FOR VIVA:
  "The model produces a fraud probability, but because our live banking API
  doesn't capture the same rich feature set as the Kaggle training data,
  the predictions are best-effort approximations. A production deployment
  would need a feature store to eliminate this skew."
============================================================================
"""

import logging
import math
from datetime import datetime
from typing import Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Sentinel/placeholder values (matching ml/preprocessing/clean_data.py)
# ---------------------------------------------------------------------------
NUMERIC_SENTINEL = -999.0    # Tree-model sentinel; lr_preprocessing converts to NaN
CATEGORICAL_MISSING = "missing"  # Token for missing categorical values

# Late-night hours that may indicate elevated risk (10pm – 5am)
LATE_NIGHT_HOURS = set(range(22, 24)) | set(range(0, 5))

# High-amount threshold for generating an indicator (same as stub's $10k threshold)
HIGH_AMOUNT_THRESHOLD = 10_000.0
REVIEW_AMOUNT_THRESHOLD = 5_000.0


def build_feature_dataframe(
    amount: float,
    timestamp: Optional[str] = None,
    transaction_type: Optional[str] = None,
) -> pd.DataFrame:
    """
    Constructs a best-effort single-row DataFrame matching the IEEE-CIS feature
    schema expected by the trained model's preprocessor.

    Fields available from FraudCheckRequest:
      - amount        -> TransactionAmt, log_TransactionAmt
      - timestamp     -> transaction_hour, transaction_day
      - type          -> not used (no ProductCD mapping exists)

    All other IEEE-CIS fields (V-columns, card fields, email domains, etc.) are
    filled with sentinel/placeholder values since the live system doesn't collect them.

    Args:
        amount: Transaction monetary amount (USD).
        timestamp: ISO-8601 timestamp string (optional). If absent, midday Wednesday used.
        transaction_type: DEPOSIT / WITHDRAWAL / TRANSFER (not mapped; included for logging).

    Returns:
        pd.DataFrame with exactly 1 row matching the expected feature schema.
    """
    # ── Derive time features ─────────────────────────────────────────────
    transaction_hour = 12   # default: midday (least suspicious)
    transaction_day = 2     # default: Wednesday (mid-week)

    if timestamp:
        try:
            dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            transaction_hour = dt.hour
            transaction_day = dt.weekday()  # 0=Monday, 6=Sunday
        except (ValueError, AttributeError) as e:
            logger.debug(f"[FeatureAdapter] Could not parse timestamp '{timestamp}': {e}. Using defaults.")

    # ── Derive amount features ───────────────────────────────────────────
    log_transaction_amt = math.log1p(amount)  # matches feature_engineering.py

    # ── Build row — IEEE-CIS columns that are derivable ──────────────────
    # The preprocessor was fitted on these columns; the order must be consistent
    # with what the training pipeline produced. We set ALL columns the
    # LeakageSafePreprocessor / LogisticRegressionPreprocessor was fitted on.
    #
    # Numeric columns (real values where available, sentinel elsewhere):
    numeric_fields = {
        "TransactionAmt": amount,
        "card1": NUMERIC_SENTINEL,
        "card2": NUMERIC_SENTINEL,
        "addr1": NUMERIC_SENTINEL,
        "addr2": NUMERIC_SENTINEL,
        "dist1": NUMERIC_SENTINEL,
        "dist2": NUMERIC_SENTINEL,
        "C1":  NUMERIC_SENTINEL,
        "C2":  NUMERIC_SENTINEL,
        "C6":  NUMERIC_SENTINEL,
        "C11": NUMERIC_SENTINEL,
        "V1":  NUMERIC_SENTINEL,
        "V2":  NUMERIC_SENTINEL,
        "V3":  NUMERIC_SENTINEL,
        "V4":  NUMERIC_SENTINEL,
        "V12": NUMERIC_SENTINEL,
        "V13": NUMERIC_SENTINEL,
        "TransactionDT": NUMERIC_SENTINEL,   # raw DT not available; derived features used
        # Derived features (these ARE computable from live data):
        "log_TransactionAmt": log_transaction_amt,
        "transaction_hour":   float(transaction_hour),
        "transaction_day":    float(transaction_day),
    }

    # Categorical columns (meaningful "missing" token):
    categorical_fields = {
        "ProductCD":       CATEGORICAL_MISSING,
        "card4":           CATEGORICAL_MISSING,
        "card6":           CATEGORICAL_MISSING,
        "P_emaildomain":   CATEGORICAL_MISSING,
        "R_emaildomain":   CATEGORICAL_MISSING,
        "M1":              CATEGORICAL_MISSING,
        "M4":              CATEGORICAL_MISSING,
        "id_30":           CATEGORICAL_MISSING,
        "id_31":           CATEGORICAL_MISSING,
        "DeviceType":      CATEGORICAL_MISSING,
    }

    row = {**numeric_fields, **categorical_fields}
    df = pd.DataFrame([row])

    logger.debug(
        f"[FeatureAdapter] Built feature vector: "
        f"amount={amount}, hour={transaction_hour}, day={transaction_day}, "
        f"log_amt={log_transaction_amt:.4f} | "
        f"Sentinel-filled fields: {len(numeric_fields) - 3 + len(categorical_fields)} "
        f"(training/serving skew acknowledged)"
    )

    return df


def derive_contextual_indicators(
    amount: float,
    timestamp: Optional[str] = None,
    ml_risk_score: Optional[float] = None,
) -> list[str]:
    """
    Generates human-interpretable indicator strings from fields actually
    available in the live FraudCheckRequest.

    DESIGN PRINCIPLE: Only generate indicators for features we genuinely have.
    Do NOT fabricate indicators that imply access to card network, device,
    or V-column data — the live system doesn't collect those.

    Args:
        amount: Transaction monetary amount.
        timestamp: ISO-8601 timestamp string (optional).
        ml_risk_score: Risk score 0-100 from ML model (optional, for threshold label).

    Returns:
        List of plain-English indicator strings.
    """
    indicators = []

    # Amount-based indicators (always available)
    if amount > HIGH_AMOUNT_THRESHOLD:
        indicators.append(f"Transaction amount ${amount:,.2f} exceeds high-risk threshold (>${HIGH_AMOUNT_THRESHOLD:,.0f})")
    elif amount > REVIEW_AMOUNT_THRESHOLD:
        indicators.append(f"Transaction amount ${amount:,.2f} exceeds review threshold (>${REVIEW_AMOUNT_THRESHOLD:,.0f})")

    # Time-based indicators (only if timestamp was provided and parsed)
    if timestamp:
        try:
            dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            hour = dt.hour
            if hour in LATE_NIGHT_HOURS:
                indicators.append(
                    f"Off-hours transaction initiated at {dt.strftime('%H:%M')} "
                    "(late-night window: 10pm-5am)"
                )
        except (ValueError, AttributeError):
            pass

    # ML model signal (when model is loaded)
    if ml_risk_score is not None:
        if ml_risk_score >= 71:
            indicators.append("ML model flagged HIGH fraud probability (primary signal)")
        elif ml_risk_score >= 31:
            indicators.append("ML model flagged ELEVATED fraud probability — manual review recommended")
        else:
            indicators.append("ML model assessed LOW fraud probability")

    # Always note training/serving context for transparency
    indicators.append(
        "Note: ML score derived from limited live features (amount + time only). "
        "Rich IEEE-CIS features (card/device/V-columns) not available in live schema."
    )

    if not indicators or (len(indicators) == 1 and "Note:" in indicators[0]):
        indicators.insert(0, "Transaction parameters within normal observed range")

    return indicators
