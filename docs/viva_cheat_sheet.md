# FinEdge Viva Defense & Architectural Cheat Sheet

> [!IMPORTANT]
> Quick-reference guide for examiners' probing questions on design choices, trade-offs, and production readiness.

---

## 1. Top Architectural Edge Cases & Trade-offs

### Q1: "What happens if the Fraud Detection Service goes down during a transaction?"
* **Answer**: We implemented a **Fail-Closed Policy**.
* **Rationale**: In a high-value financial institution, safety and risk containment supersede availability. If the AI service times out (500ms SLA) or errors out, transaction-service safely rejects/holds the transaction instead of allowing potentially fraudulent funds to clear.

### Q2: "How do you handle Concurrent Submissions & Idempotency?"
* **Answer**: Every transaction API call requires a client-generated `Idempotency-Key` header stored in distributed cache (Redis/DB).
* **Rationale**: If a duplicate key is presented with identical payload, the cached response is returned. If presented with a modified payload, the service returns `409 Conflict` (Idempotency Key Reuse Mismatch).

### Q3: "What is your approach to Training vs. Serving Skew in the ML pipeline?"
* **Answer**: We enforce exact schema and feature transformation equivalence via a shared Feature Pipeline Adapter (`app/feature_pipeline/adapter.py`).
* **Rationale**: Online feature transformation during inference strictly mirrors offline preprocessing steps (one-hot encoding, feature scaling, default imputations) to prevent silent model performance degradation.

### Q4: "Why use Kafka for Audit Logs instead of direct REST calls?"
* **Answer**: **Asynchronous Decoupling & Append-Only Resilience**.
* **Rationale**: Synchronous HTTP calls block core transaction throughput. With Kafka, `transaction-events` are published asynchronously. Audit & Notification services consume events independently. If Audit Service goes down, Kafka retains offsets so no audit event is lost.

### Q5: "Is your Audit Log immutable?"
* **Answer**: In this microservice layer, audit records are written to an **append-only PostgreSQL table** without `UPDATE`/`DELETE` endpoints.
* **Production Path**: In enterprise production, this Kafka topic feeds AWS QLDB (Quantum Ledger Database) or WORM (Write Once Read Many) S3 storage for cryptographic tamper-proofing.

### Q6: "Why In-Memory Rate Limiting for API Gateway?"
* **Answer**: Keeps latency sub-millisecond for local development.
* **Production Path**: Transition to Redis Token Bucket (`spring-boot-starter-data-redis-reactive` + Spring Cloud Gateway Redis RateLimiter) across multi-instance gateway clusters.

---

## 2. Microservice Topology Summary

| Service | Port | Primary Responsibility | Key Tech |
| :--- | :--- | :--- | :--- |
| **API Gateway** | 8080 | Routing, Rate Limiting, JWT Validation | Spring Cloud Gateway |
| **Auth Service** | 8081 | User Registration, Login, Token Generation | Spring Security, JWT, Postgres |
| **Account Service** | 8082 | Account Balances, Account Creation | Spring Data JPA, Postgres |
| **Transaction Service** | 8083 | Money Transfers, Fraud Check Dispatch, Event Publishing | Spring Boot, Kafka, RestTemplate |
| **Notification Service**| 8084 | Consumes Kafka events, sends email/SMS alerts | Spring Kafka, Postgres |
| **Audit Service** | 8085 | Consumes Kafka events, appends immutable log | Spring Kafka, Postgres |
| **Fraud Detection** | 8086 | Real-time AI inference & risk scoring | Python FastAPI, Scikit-Learn / XGBoost |
