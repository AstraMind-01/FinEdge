"""
FinEdge Fraud Detection Service — Step 13: Updated Fraud Service

Replaces the stub scorer with the trained ML model when artifacts are available,
while preserving the stub as a graceful fallback.

SCORING LOGIC:
==============
When ML model IS loaded (is_model_loaded() == True):
  - Primary score: model.predict_proba(features)[:, 1] * 100
  - Risk thresholds: unchanged (0-30 LOW, 31-70 REVIEW, 71-100 HIGH)
  - Indicators: derived from genuinely available live features only
                (amount size, time of day) — no fabricated indicators
  - modelVersion: real model version from model_metadata.json

When ML model is NOT loaded (stub fallback):
  - Unchanged amount-threshold heuristic (85 HIGH / 55 REVIEW / 15 LOW)
  - modelVersion: "stub-v0"
  - Indicators: original rule-based strings

BLENDING DECISION:
==================
The amount-threshold rule is NOT blended into the riskScore when the model is
loaded. It is instead surfaced as an indicator string. Rationale:
  1. Simplest and most honest: one score, one source (the model).
  2. Amount-threshold is already baked into the model's training data distribution.
  3. Blending two scores requires a weighting choice that's hard to justify.
  4. For a viva: "The ML model is the primary scorer; the rule adds interpretability."
"""

import logging
from datetime import datetime

from app.config.settings import settings
from app.feature_pipeline.adapter import build_feature_dataframe, derive_contextual_indicators
from app.model.model_loader import (
    get_model_version,
    is_model_loaded,
    predict_fraud_probability,
)
from app.schemas.fraud import DecisionEnum, FraudCheckRequest, FraudCheckResponse

logger = logging.getLogger(__name__)


def _classify_risk(risk_score: float) -> DecisionEnum:
    """Maps 0-100 risk score to decision using project-standard thresholds."""
    if risk_score >= 71:
        return DecisionEnum.HIGH_RISK
    elif risk_score >= 31:
        return DecisionEnum.REVIEW
    else:
        return DecisionEnum.LOW_RISK


class FraudService:
    """
    Fraud Detection Service — ML-primary with stub fallback.

    Mode 1 (ML): Uses trained model probability * 100 as the risk score.
    Mode 2 (Stub): Original amount-threshold heuristic (unchanged from pre-Step 13).
    """

    def evaluate_transaction(self, request: FraudCheckRequest) -> FraudCheckResponse:
        logger.info(
            f"[FraudService] Evaluating transaction [{request.transactionRef}] "
            f"type={request.type} amount={request.amount} user={request.initiatedByUsername} "
            f"mode={'ML' if is_model_loaded() else 'STUB'}"
        )

        if is_model_loaded():
            return self._evaluate_with_model(request)
        else:
            return self._evaluate_with_stub(request)

    # ------------------------------------------------------------------
    # Mode 1: ML model scoring
    # ------------------------------------------------------------------

    def _evaluate_with_model(self, request: FraudCheckRequest) -> FraudCheckResponse:
        """
        Scores the transaction using the loaded ML model.

        Feature construction note: Only amount and timestamp can be meaningfully
        derived from the live request. All IEEE-CIS-specific fields are filled with
        sentinel placeholders. See app/feature_pipeline/adapter.py for full discussion
        of training/serving skew.
        """
        # Build best-effort feature vector from live request fields
        feature_df = build_feature_dataframe(
            amount=request.amount,
            timestamp=request.timestamp,
            transaction_type=request.type,
        )

        # Get fraud probability [0.0, 1.0] from model
        fraud_probability = predict_fraud_probability(feature_df)
        risk_score = round(fraud_probability * 100.0, 2)
        decision = _classify_risk(risk_score)

        # Generate indicators from genuinely available live fields
        indicators = derive_contextual_indicators(
            amount=request.amount,
            timestamp=request.timestamp,
            ml_risk_score=risk_score,
        )

        model_version = get_model_version()
        logger.info(
            f"[FraudService] ML result: prob={fraud_probability:.4f} "
            f"score={risk_score} decision={decision} model={model_version}"
        )

        return FraudCheckResponse(
            transactionRef=request.transactionRef,
            riskScore=risk_score,
            decision=decision,
            indicators=indicators,
            modelVersion=model_version,
            evaluatedAt=datetime.utcnow(),
        )

    # ------------------------------------------------------------------
    # Mode 2: Stub / rule-based fallback (unchanged from pre-Step 13)
    # ------------------------------------------------------------------

    def _evaluate_with_stub(self, request: FraudCheckRequest) -> FraudCheckResponse:
        """
        Original deterministic amount-threshold heuristic.
        Used when ML artifacts are not available (fresh clone, missing pkl files, etc.).
        """
        amount = request.amount
        indicators = []

        if amount > 10000.0:
            risk_score = 85.0
            decision = DecisionEnum.HIGH_RISK
            indicators.append("Transaction amount exceeds high risk threshold ($10,000)")
            indicators.append("High monetary value anomaly flag")
        elif amount > 5000.0:
            risk_score = 55.0
            decision = DecisionEnum.REVIEW
            indicators.append("Transaction amount exceeds review threshold ($5,000)")
            indicators.append("Manual compliance verification recommended")
        else:
            risk_score = 15.0
            decision = DecisionEnum.LOW_RISK
            indicators.append("Transaction parameters within normal baseline risk profile")

        logger.info(
            f"[FraudService] STUB result: score={risk_score} decision={decision}"
        )

        return FraudCheckResponse(
            transactionRef=request.transactionRef,
            riskScore=risk_score,
            decision=decision,
            indicators=indicators,
            modelVersion=settings.MODEL_VERSION,  # "stub-v0"
            evaluatedAt=datetime.utcnow(),
        )


fraud_service = FraudService()
