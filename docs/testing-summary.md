# FinEdge — Testing Framework Summary & Viva Guide

This document summarizes the testing suites, execution commands, and key concepts for the **FinEdge** platform. It serves as both a QA overview and a cheat sheet for presenting your testing framework during the college viva presentation.

---

## 1. Test Coverage Overview

FinEdge is validated across multiple layers using a combination of unit testing, pipeline testing, and E2E HTTP integration testing:

| Component | Port / Path | Test Framework | Scenarios Tested |
| :--- | :--- | :--- | :--- |
| **Java Services** (Auth, Account, Transaction, Notification, Audit) | `backend/` | JUnit 5 + Mockito | Mocked repositories/controllers, JWT generation, registration conflict, balance checking, fraud checks, idempotency, Kafka listeners resilience. |
| **Fraud Detection Service** (Python) | `ai-ml/fraud-detection-service/` | pytest + FastAPI TestClient | Health check metrics, authenticated and unauthenticated REST calls, stub fallbacks when ML models are missing. |
| **ML Data Pipeline** | `ai-ml/ml/` | pytest | Missing CSV loading warning, drop columns exceeding missingness threshold, sentinel fill, unseen categorical values mapping (LeakageSafePreprocessor). |
| **E2E Request Chain** | `scripts/e2e_integration_test.py` | Python Requests | API Gateway routing, OAuth2 login, low-risk transaction success, high-risk fraud block, idempotency 409 conflict, cross-user 403 access denial, Correlation ID propagation. |

---

## 2. Copy-Pasteable Test Execution Commands

To run all test suites locally on your system, use the following commands:

### A. Java Microservices Unit Tests
Run this command from the `backend/` directory:
```powershell
& "C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.0.1\plugins\maven-plugin\lib\maven3\bin\mvn.cmd" test
```

### B. Python Fraud Detection Service Tests
Run this command from the `ai-ml/fraud-detection-service/` directory:
```powershell
python -m pytest tests
```

### C. ML Data Pipeline Preprocessing Tests
Run this command from the `ai-ml/` directory:
```powershell
python -m pytest ml/tests
```

### D. E2E Integration Request Chain Test
Ensure that the 7 microservices are running first. Then run this command from the workspace root:
```powershell
python scripts/e2e_integration_test.py
```

---

## 3. Honest Gaps & Scaffolding Disclosures

During the viva, be prepared to explain the following design trade-offs and stubs honestly:

*   **Kafka in Unit Tests:** Kafka message producers and listeners are unit-tested using Mockito stubbing. In the live system, if Kafka is not running, the Transaction Service uses a **500ms block timeout fallback** (`max.block.ms = 500`) to log a non-blocking warning and complete the transaction instead of hanging the HTTP thread indefinitely.
*   **ML Model Fallback:** The Python Fraud Detection Service checks for trained model weights (`model_metadata.json`) at startup. If they do not exist (e.g. training script has not run), it falls back gracefully to a **rule-based stub mode** (e.g., flagging transactions > $10,000 as high risk) to avoid throwing startup crashes.
*   **React Frontend Integration:** The React frontend is a marketing landing page styled like a premium SaaS product (Payvora reference reproduction). It is not functionally connected to the backend REST APIs. All functional testing is handled via backend unit, Python, and E2E integration test scripts.

---

## 4. College Viva Presentation Tips

### Q: "How does your system prevent Data Leakage during ML training?"
> **Answer:** "We implemented a custom `LeakageSafePreprocessor` in `ai-ml/ml/preprocessing/feature_engineering.py`. Encoders and scalers fit *only* on the training split. During validation/testing, unseen categories are safely mapped to a fallback value instead of causing errors or leaking information from the future validation set."

### Q: "What is the purpose of the Correlation ID in your microservices?"
> **Answer:** "Every HTTP request entering the API Gateway gets stamped with an `X-Correlation-ID` header. This ID is passed to downstream Java services via RestTemplate interceptors, written to SLF4J MDC context, and embedded into Kafka events. This allows us to trace a single request's lifecycle across logs of multiple services."

### Q: "How does the system ensure Idempotency?"
> **Answer:** "The Transaction Service checks the incoming request's `idempotencyKey`. If the key exists in the database, it retrieves the previous response. If a user tries to reuse a key with different request parameters, the system returns an `HTTP 409 Conflict` to prevent double-charging or duplicate transactions."
