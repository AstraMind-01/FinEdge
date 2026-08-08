from fastapi import APIRouter, Depends, status
from app.config.security import verify_jwt_token
from app.config.settings import settings
from app.model.model_loader import get_model_version, is_model_loaded
from app.schemas.fraud import FraudCheckRequest, FraudCheckResponse
from app.services.fraud_service import fraud_service

router = APIRouter(prefix="/api/v1")


@router.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """
    Health check endpoint.
    Reports service status and whether a real trained ML model is active
    or the service is running in stub/rule-based fallback mode.
    """
    model_loaded = is_model_loaded()
    return {
        "service": "fraud-detection-service",
        "status": "UP",
        "modelStatus": "ML_MODEL_LOADED" if model_loaded else "STUB_FALLBACK",
        "modelVersion": get_model_version(),
        "artifactsDir": settings.ML_ARTIFACTS_DIR,
    }


@router.post("/fraud/check", response_model=FraudCheckResponse, status_code=status.HTTP_200_OK)
def check_fraud(
    request: FraudCheckRequest,
    token_payload: dict = Depends(verify_jwt_token)
):
    return fraud_service.evaluate_transaction(request)

