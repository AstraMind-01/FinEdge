from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class DecisionEnum(str, Enum):
    LOW_RISK = "LOW_RISK"
    REVIEW = "REVIEW"
    HIGH_RISK = "HIGH_RISK"


class FraudCheckRequest(BaseModel):
    transactionRef: str = Field(..., description="Unique transaction reference code")
    type: str = Field(..., description="DEPOSIT, WITHDRAWAL, or TRANSFER")
    fromAccountNumber: Optional[str] = Field(None, description="Source account number")
    toAccountNumber: Optional[str] = Field(None, description="Destination account number")
    amount: float = Field(..., gt=0, description="Transaction monetary amount")
    initiatedByUsername: str = Field(..., description="Username initiating the transaction")
    timestamp: Optional[str] = Field(None, description="ISO-8601 timestamp string")


class FraudCheckResponse(BaseModel):
    transactionRef: str
    riskScore: float = Field(..., ge=0.0, le=100.0, description="Evaluated risk score (0-100)")
    decision: DecisionEnum = Field(..., description="Categorized risk decision")
    indicators: List[str] = Field(default_factory=list, description="Rule or feature anomaly indicators")
    modelVersion: str = Field(..., description="Version of the ML model/stub evaluator")
    evaluatedAt: datetime = Field(default_factory=datetime.utcnow, description="Evaluation timestamp")
