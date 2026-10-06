# FinEdge — Intelligent Banking & Payment Platform

FinEdge is an enterprise-grade, microservices-based banking and real-time AI fraud detection platform built with Java 21 Spring Boot, Python FastAPI, XGBoost Machine Learning, Apache Kafka, and PostgreSQL.

---

## Architecture At A Glance

```
                                  +-----------------------+
                                  |   React Frontend /    |
                                  |   Postman Test Suite  |
                                  +-----------+-----------+
                                              |
                                              v
                                  +-----------------------+
                                  |   API Gateway (:8080) |
                                  +-----------+-----------+
                                              |
     +-------------------+--------------------+--------------------+
     |                   |                    |                    |
     v                   v                    v                    v
+----+---------+   +-----+--------+    +------+-------+     +------+-------+
| Auth Service |   | Account Svc  |    | Transaction  |     | Fraud Detection
|   (:8081)    |   |   (:8082)    |    |   Service    |     | Service (FastAPI)
+----+---------+   +-----+--------+    |   (:8083)    |     |   (:8086)    |
     |                   |             +------+-------+     +--------------+
     v                   v                    | (Sync REST)        ^
  [auth_db]         [account_db]              +--------------------+
                                              | (Kafka Publish)
                                              v
                                     +-----------------+
                                     |  Apache Kafka   |
                                     +---+---------+---+
                                         |         |
                                         v         v
                                  +------+--+   +--+-----------+
                                  | Notif   |   | Audit Service|
                                  | Service |   |   (:8085)    |
                                  +---------+   +--------------+
```

---

## 17-Step Implementation Journey Narrative

1. **Step 1: Monorepo & Maven Multi-Module Setup** — Established project structure (`backend/`, `ai-ml/`, `infrastructure/`) and root pom dependencies.
2. **Step 2: Database Schema & Migration Specs** — Designed PostgreSQL database-per-service schemas for Auth, Account, Transaction, Notification, and Audit.
3. **Step 3: Docker & Infrastructure Orchestration** — Configured containerized Zookeeper, Kafka broker, and 5 PostgreSQL DB instances in `docker-compose.yml`.
4. **Step 4: Auth Service & JWT Security** — Developed registration, login, BCrypt password hashing, and stateless JWT token issuance.
5. **Step 5: API Gateway & Rate Limiting** — Implemented central routing, JWT verification filter, and IP/token rate limiting.
6. **Step 6: Account Service & Balance Management** — Implemented account lifecycle, balance inquiry, and debit/credit ledger updates.
7. **Step 7: Machine Learning Data Pipeline** — Built dataset cleaning, missing value handling, feature engineering, and categorical encoding pipeline.
8. **Step 8: Fraud Detection ML Model Training** — Trained XGBoost/Scikit-learn model, evaluated ROC-AUC & precision/recall, and serialized model artifacts.
9. **Step 9: Python FastAPI Fraud Detection Microservice** — Created high-throughput FastAPI inference endpoint, schema validation, and health checks.
10. **Step 10: Model Artifact & Inference Integration** — Connected FastAPI service to trained ML model artifacts with fallback scoring logic.
11. **Step 11: Transaction Service Core & RestTemplate Integration** — Built transaction processing engine with synchronous REST calls to Fraud Service.
12. **Step 12: Fraud Policy & Fail-Closed Safety** — Implemented risk threshold enforcement, high-risk blocking, and fail-closed policy during AI service downtime.
13. **Step 13: Distributed Idempotency Control** — Enforced client-side idempotency keys and key-reuse mismatch protection (`409 Conflict`).
14. **Step 14: Kafka Event Producer & Async Messaging** — Integrated Kafka event publishing (`transaction-events`) upon transaction state change.
15. **Step 15: Notification Service Kafka Consumer** — Developed notification consumer service listening to Kafka events for customer alert generation.
16. **Step 16: Audit Log Service & Append-Only Storage** — Built dedicated audit service storing immutable event records for compliance and forensics.
17. **Step 17: End-to-End Verification & Test Automation** — Verified full system end-to-end with unit test suites and integration verification scripts.

---

## Running The Platform locally

### Prerequisites
- Java 21 JDK
- Python 3.10+
- Apache Maven 3.8+
- Docker & Docker Compose

### 1. Infrastructure Startup
```bash
cd infrastructure
docker-compose up -d
```

### 2. Backend Microservices Build & Run
```bash
# Test & Build
cd backend
mvn clean package

# Start All Services (PowerShell)
..\infrastructure\scripts\start-all-visible.ps1
```

### 3. Run AI/ML Fraud Service
```bash
cd ai-ml/fraud-detection-service
python -m uvicorn app.main:app --port 8086 --reload
```

### 4. Run End-to-End Test Suite
```bash
python infrastructure/scripts/e2e_integration_test.py
```

---

## Documentation & Viva Resources
- 📋 [Viva Defense Cheat Sheet](docs/viva_cheat_sheet.md)
- 📐 [Architecture & Component Diagram](docs/architecture_diagram.md)

---

## 👥 Contributors

Special thanks to the core contributors and engineers of FinEdge:

- **[Soumyadip Singha](https://github.com/Simply-Coder-start)** ([@Simply-Coder-start](https://github.com/Simply-Coder-start)) — Core Architecture, Full-Stack Microservices, Real-Time AI Fraud Engine, Modularization & Next.js Frontend
- **[Pritam Sahoo](https://github.com/pritamsahoo902)** ([@AstraMind-01](https://github.com/AstraMind-01)) — Project Setup, Monorepo Architecture & DevOps Pipelines
