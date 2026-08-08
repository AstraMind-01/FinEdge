from fastapi import APIRouter, Depends, status
from app.config.security import verify_jwt_token
from app.schemas.fraud import FraudCheckRequest, FraudCheckResponse
from app.services.fraud_service import fraud_service

router = APIRouter(prefix="/api/v1")


@router.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    return {
        "service": "fraud-detection-service",
        "status": "UP"
    }


@router.post("/fraud/check", response_model=FraudCheckResponse, status_code=status.HTTP_200_OK)
def check_fraud(
    request: FraudCheckRequest,
    token_payload: dict = Depends(verify_jwt_token)
):
    return fraud_service.evaluate_transaction(request)
