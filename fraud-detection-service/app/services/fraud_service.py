from datetime import datetime
import logging
from app.config.settings import settings
from app.schemas.fraud import DecisionEnum, FraudCheckRequest, FraudCheckResponse

logger = logging.getLogger(__name__)


class FraudService:
    """
    STUB Fraud Detection Service.

    NOTE: This is a placeholder mock risk evaluator. Real feature engineering,
    historical profile calculations, and trained ML model inference (Scikit-Learn/XGBoost)
    will be integrated in Steps 11-13.
    """

    def evaluate_transaction(self, request: FraudCheckRequest) -> FraudCheckResponse:
        logger.info(
            f"Evaluating stub fraud risk for transaction [{request.transactionRef}] "
            f"type={request.type} amount={request.amount} user={request.initiatedByUsername}"
        )

        amount = request.amount
        indicators = []

        # Simple deterministic heuristic for demonstration and consistent test behavior
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

        return FraudCheckResponse(
            transactionRef=request.transactionRef,
            riskScore=risk_score,
            decision=decision,
            indicators=indicators,
            modelVersion=settings.MODEL_VERSION,
            evaluatedAt=datetime.utcnow()
        )


fraud_service = FraudService()
