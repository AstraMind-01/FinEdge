import base64
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
import jwt
from app.config.settings import settings
from app.main import app

client = TestClient(app)


def get_test_jwt() -> str:
    try:
        key = base64.b64decode(settings.JWT_SECRET)
    except Exception:
        key = settings.JWT_SECRET.encode("utf-8")

    payload = {
        "sub": "testuser",
        "role": "CUSTOMER",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, key, algorithm="HS256")


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {
        "service": "fraud-detection-service",
        "status": "UP"
    }


def test_fraud_check_stub_authenticated():
    token = get_test_jwt()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "transactionRef": "TXN-TEST-100",
        "type": "TRANSFER",
        "fromAccountNumber": "1001",
        "toAccountNumber": "1002",
        "amount": 15000.0,
        "initiatedByUsername": "testuser"
    }
    response = client.post("/api/v1/fraud/check", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["transactionRef"] == "TXN-TEST-100"
    assert data["decision"] == "HIGH_RISK"
    assert data["riskScore"] == 85.0


def test_fraud_check_unauthenticated():
    payload = {
        "transactionRef": "TXN-TEST-101",
        "type": "DEPOSIT",
        "amount": 500.0,
        "initiatedByUsername": "testuser"
    }
    response = client.post("/api/v1/fraud/check", json=payload)
    assert response.status_code == 403 or response.status_code == 401
