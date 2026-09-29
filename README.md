# FinEdge – AI-Powered Banking & Fraud Detection Platform

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2023.x-blue.svg)](https://spring.io/projects/spring-cloud)
[![Python](https://img.shields.io/badge/Python-3.11+-yellow.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-teal.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-Next.js%20%7C%20React%2019-cyan.svg)](https://nextjs.org/)
[![Kafka](https://img.shields.io/badge/Apache%20Kafka-Distributed-black.svg)](https://kafka.apache.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

---

## 1. Project Overview
**FinEdge** is an intelligent, enterprise-grade digital banking and payment platform engineered as a distributed microservices system. It integrates real-time payment orchestration, fine-grained account management, cryptographic audit logging, and machine learning-powered fraud detection to safeguard financial transactions as they occur.

Developed for academic demonstration and production-readiness benchmarking (B.Tech AI & ML capstone), FinEdge showcases modern cloud-native architectural patterns, reactive event-driven synchronization, biometric/passkey security, and low-latency inference pipelines.

---

## 2. Problem Statement
Traditional banking infrastructures frequently suffer from:
- **Monolithic Bottlenecks**: Tightly coupled monolithic backends that fail to scale transaction throughput during demand spikes.
- **Post-Facto Fraud Analysis**: Legacy rule engines and batch-driven fraud analysis that detect fraudulent activity hours or days after funds have settled.
- **High False Positive Rates**: Static threshold rules blocking legitimate user activity while missing sophisticated modern fraud vectors.
- **Siloed Auditing & Notification**: Fragmented notification delivery and tamper-vulnerable audit trails.

**FinEdge resolves these challenges** by decoupling domain responsibilities across specialized Spring Boot microservices, deploying a sub-50ms Python/FastAPI fraud scoring engine into the transaction lifecycle, publishing all state transitions to an Apache Kafka event spine, and delivering real-time biometric and passwordless security.

---

## 3. Main Features

### Customer Banking Experience
- **Authentication & Security**: Multi-factor authentication (MFA/OTP), WebAuthn Passkeys (biometric fingerprint/Face ID), and secure 60s cross-device QR challenge flows.
- **Account & Ledger Management**: Multi-currency account portfolios (Savings, Checking, Investment), real-time balance calculations, account freeze/unfreeze toggles, and signed short-lived balance disclosure tokens.
- **Transaction & Transfers**: Intra-bank and inter-bank transfers with idempotency key enforcement, scheduled payments, and simulated Razorpay payment gateway integration.
- **Ayasa AI Virtual Assistant**: Natural language customer support assistant with conversational guidance, fuzzy intent classification, and 7-point grounded workflows.

### Fraud Detection & Risk Engine
- **In-flight Risk Assessment**: Synchronous REST evaluation during transaction processing returning risk scores (0–100), risk tiering (`LOW`, `MEDIUM`, `HIGH`), and human-interpretable risk flags.
- **Adaptive Fraud Actioning**: Real-time decision routing: `ALLOW` (scores < 40), `CHALLENGE_2FA` (scores 40–74), or `BLOCK` (scores ≥ 75).
- **Explainable Indicators**: Flags for anomalous velocity, unusual geographical distance, unusual transaction amount relative to account history, and high-frequency nocturnal activity.

### Administrative & Regulatory Operations
- **Real-Time Live Transaction Feed**: Administrative monitoring of all transactions with real-time status tracking.
- **Fraud Alert Console**: Manual dispute and investigation portal for flagged transactions with reason auditing.
- **Audit Trails**: Non-repudiable event stream of all authentication, transaction, and permission state shifts.
- **CSV & Analytical Reports**: Dynamic reporting engine for transaction volume, failure patterns, and compliance exports.

---

## 4. Architecture
FinEdge adopts an event-driven microservices architecture partitioned into domain services, an API Gateway edge layer, an asynchronous Kafka messaging spine, dedicated relational databases per service, and a Python machine learning inference service.

```
                                  ┌──────────────────────────┐
                                  │   Next.js 15+ Frontend   │
                                  │   (React 19, TypeScript) │
                                  └─────────────┬────────────┘
                                                │ HTTP / REST
                                                ▼
                                  ┌──────────────────────────┐
                                  │  Spring Cloud API Gateway│ (Port 8080)
                                  └─────────────┬────────────┘
                                                │
       ┌──────────────────┬─────────────────────┼─────────────────────┬──────────────────┐
       │                  │                     │                     │                  │
       ▼                  ▼                     ▼                     ▼                  ▼
┌──────────────┐   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐   ┌──────────────┐
│ Auth Service │   │Account Service│     │ Transaction  │      │Support / Admin│  │FastAPI Fraud │
│  (Port 8081) │   │ (Port 8082)  │      │ Service(8083)│      │  (8087/8088) │   │Engine (8086) │
└──────┬───────┘   └──────┬───────┘      └──────┬───────┘      └──────┬───────┘   └──────────────┘
       │                  │                     │                     │
   [auth_db]         [account_db]        [transaction_db]       [support_db]
                                                │
                                                ▼
                                     ┌─────────────────────┐
                                     │ Apache Kafka Broker │
                                     └──────────┬──────────┘
                                                │
                               ┌────────────────┴────────────────┐
                               ▼                                 ▼
                     ┌────────────────────┐            ┌────────────────────┐
                     │Notification Service│            │   Audit Service    │
                     │    (Port 8084)     │            │    (Port 8085)     │
                     └─────────┬──────────┘            └─────────┬──────────┘
                           [notif_db]                         [audit_db]
```

---

## 5. Microservices

| Service | Port | Technology | Primary Responsibilities | Status |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway** | `8080` | Spring Cloud Gateway | Edge routing, JWT validation, rate limiting, CORS management | **Implemented** |
| **Auth Service** | `8081` | Spring Boot 3, JPA | User registration, login, JWT issuance/refresh, 2FA OTP, WebAuthn Passkeys, QR challenges | **Implemented** |
| **Account Service** | `8082` | Spring Boot 3, JPA | Bank account creation, balance inquiry, account freeze/unfreeze, KYC record storage | **Implemented** |
| **Transaction Service** | `8083` | Spring Boot 3, JPA | Payment execution, fund transfers, deposits/withdrawals, state machine, Kafka event publisher | **Implemented** |
| **Fraud Detection Service**| `8086` | Python, FastAPI | Real-time ML inference, risk score calculation, explainable flag generation | **Implemented** |
| **Notification Service** | `8084` | Spring Boot 3, Kafka | Asynchronous event listener, email/SMS notification dispatch | **Implemented** |
| **Audit Service** | `8085` | Spring Boot 3, Kafka | Immutable event ledger, audit event tracking, compliance search | **Implemented** |
| **Support Service** | `8087` | Spring Boot 3, H2/JPA | Help desk tickets, Ayasa AI assistant prompt grounding and state management | **Implemented** |
| **Admin Service** | `8088` | Spring Boot 3, JPA | Administrative user actions, transaction overrides, system configurations, report exports | **Implemented** |

---

## 6. AI/ML Fraud Detection
The fraud detection system uses a dual-engine approach combining real-time feature transformation with trained classification models:

1. **Inference API**: A production FastAPI service (`ai-ml/fraud-detection-service`) exposes `/api/v1/fraud/evaluate` with p99 response times < 35ms.
2. **Feature Adapter**: Dynamically computes rolling features:
   - `amount_to_avg_ratio`: Compares transaction amount against user's historical baseline.
   - `velocity_1h` & `velocity_24h`: Transaction counts within preceding time windows.
   - `distance_from_last_tx`: Geo-velocity calculation between consecutive coordinates.
   - `is_night_time`: Temporal flags for high-risk transaction hours (12:00 AM – 5:00 AM).
3. **Threshold Actions**:
   - **Score 0–39**: Low risk (`ALLOW` – immediate execution)
   - **Score 40–74**: Medium risk (`CHALLENGE_2FA` – requires biometric / OTP step-up)
   - **Score 75–100**: High risk (`BLOCK` – transaction denied and security alert published)

---

## 7. Technology Stack

### Backend Core
- **Java 21 LTS** & **Spring Boot 3.2.x**
- **Spring Cloud Gateway 2023.x**
- **Spring Data JPA & Hibernate**
- **Spring Security 6** with JWT (HMAC-SHA256) & WebAuthn
- **Maven** (multi-module project structure)

### Machine Learning & Data Science
- **Python 3.11+**
- **FastAPI** & **Uvicorn**
- **Scikit-learn** (Logistic Regression, Random Forest Classifier)
- **XGBoost** (Gradient Boosting benchmark model)
- **Pandas** & **NumPy** (data wrangling and vector math)
- **Joblib** (model persistence)

### Persistence & Messaging
- **PostgreSQL 15** (database-per-service isolation)
- **Apache Kafka 3.x** & **Zookeeper** (event messaging)
- **H2 in-memory DB** (lightweight local support store)

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons** & **Google Material Symbols**

### DevOps & Containerization
- **Docker** & **Docker Compose**
- **GitHub Actions** CI/CD

---

## 8. Dataset Information
The machine learning pipeline is designed around standardized synthetic and benchmark transaction datasets:
- **Baseline Dataset**: Based on European credit card fraud detection benchmarks and synthetic banking transaction sequences (e.g., PaySim financial transaction simulation).
- **Features**: Includes step/timestamp, transaction type (`TRANSFER`, `PAYMENT`, `CASH_OUT`, `DEBIT`), monetary amount, origin balance before/after, destination balance before/after, and ground-truth fraud label (`isFraud`).
- **Data Privacy**: Raw datasets are excluded from Git via `.gitignore` (`ml/data/raw/*`, `ml/data/processed/*`). Placeholders and `.gitkeep` anchor directories are maintained for team consistency.

---

## 9. ML Pipeline

```
  [Raw Transaction Dataset]
             │
             ▼
┌───────────────────────────┐
│     Data Cleaning         │ ───> Null handling, type casting, outlier mitigation
└────────────┬──────────────┘
             ▼
┌───────────────────────────┐
│   Feature Engineering     │ ───> Rolling velocity, balance delta ratios, geo-speed
└────────────┬──────────────┘
             ▼
┌───────────────────────────┐
│ Model Training & Benchmark│ ───> Logistic Regression (baseline), Random Forest, XGBoost
└────────────┬──────────────┘
             ▼
┌───────────────────────────┐
│ Calibration & Evaluation  │ ───> Precision-Recall AUC, ROC-AUC, threshold optimization
└────────────┬──────────────┘
             ▼
┌───────────────────────────┐
│    Artifact Export        │ ───> Serialized pipeline (*.joblib / *.pkl)
└────────────┬──────────────┘
             ▼
┌───────────────────────────┐
│  FastAPI Serving Adapter  │ ───> Real-time inference via /api/v1/fraud/evaluate
└───────────────────────────┘
```

---

## 10. Transaction Flow

```
1. Customer initiates transfer via Frontend
               │
               ▼
2. API Gateway validates JWT and forwards request to Transaction Service
               │
               ▼
3. Transaction Service creates PENDING transaction record
               │
               ▼
4. Transaction Service calls FastAPI Fraud Service (/api/v1/fraud/evaluate)
               │
        ┌──────┴──────────────────────────┐
        │                                 │
 [Score < 40]                      [Score >= 75]
 (LOW RISK)                         (HIGH RISK)
        │                                 │
        ▼                                 ▼
5a. Debit origin account            5b. Mark transaction REJECTED
    Credit destination account          Publish FRAUD_ALERT to Kafka
    Mark transaction COMPLETED          Return 403 Forbidden to caller
        │
        ▼
6. Publish TRANSACTION_SUCCESS to Kafka
        │
        ├─────────────────────────────┐
        ▼                             ▼
Notification Service             Audit Service
(sends email receipt)            (writes immutable audit record)
```

---

## 11. API Information

### Gateway Endpoints (`http://localhost:8080`)
All public requests pass through the API Gateway, which prefixes routes by domain:

- **Authentication Service**: `/auth-api/auth/**`
  - `POST /auth/register`: Create customer account.
  - `POST /auth/login`: Authenticate and receive `accessToken` + `refreshToken`.
  - `POST /auth/refresh`: Rotate refresh token for a fresh access token.
  - `POST /auth/passkey/register` & `login`: WebAuthn biometric authentication.
  - `POST /auth/qr/generate` & `poll`: Passwordless cross-device QR authentication.
- **Account Service**: `/account-api/accounts/**`
  - `GET /accounts`: Retrieve authenticated user accounts.
  - `POST /accounts`: Open new savings/checking account.
  - `GET /accounts/{id}/balance`: Check account balance (with security token verification).
- **Transaction Service**: `/transaction-api/transactions/**`
  - `POST /transactions/transfer`: Initiate peer-to-peer or inter-bank fund transfer.
  - `POST /transactions/deposit`: Deposit funds into account.
  - `POST /transactions/withdraw`: Cash withdrawal.
  - `GET /transactions/history`: Paginated transaction history with status filters.
- **Fraud Detection Service**: `http://localhost:8086`
  - `POST /api/v1/fraud/evaluate`: Synchronous fraud evaluation payload.
  - `GET /api/v1/health`: Liveness and readiness health check.
- **Admin Service**: `/admin-api/admin/**`
  - `GET /admin/transactions`: System-wide transaction inspection.
  - `POST /admin/transactions/{id}/flag`: Manual fraud override.
  - `GET /admin/reports/transactions/export`: Export CSV transaction logs.

---

## 12. Kafka Architecture
FinEdge utilizes Apache Kafka topics to decouple critical write paths from read-heavy notification and audit workflows:

- **`transaction-events`**:
  - Emitted by: `transaction-service`
  - Consumed by: `notification-service`, `audit-service`
  - Payloads: `TransactionInitiatedEvent`, `TransactionCompletedEvent`, `TransactionFailedEvent`
- **`fraud-alerts`**:
  - Emitted by: `transaction-service` (when fraud score exceeds threshold)
  - Consumed by: `notification-service` (triggers immediate SMS/Email security notice), `admin-service`
- **`audit-events`**:
  - Emitted by: `auth-service`, `account-service`, `admin-service`
  - Consumed by: `audit-service` (persisted to `audit_db`)

---

## 13. Database Architecture
FinEdge strictly adheres to the **Database-per-Service** design pattern to maintain loose coupling:

| Database | Service Owner | Primary Entities |
| :--- | :--- | :--- |
| `auth_db` | Auth Service | `users`, `roles`, `user_roles`, `refresh_tokens`, `webauthn_credentials` |
| `account_db` | Account Service | `accounts`, `account_limits`, `kyc_documents` |
| `transaction_db`| Transaction Service | `transactions`, `transfer_requests`, `idempotency_keys` |
| `notification_db`| Notification Service | `notification_templates`, `notification_logs` |
| `audit_db` | Audit Service | `audit_logs`, `security_events` |
| `support_db` | Support Service | `support_tickets`, `ayasa_conversations` (H2/Postgres) |

SQL initialization and migration scripts are located in `database/`.

---

## 14. Docker Setup
All backing infrastructure (Kafka, Zookeeper, and PostgreSQL instances) can be launched using Docker Compose from the `infrastructure/` directory:

```bash
# Navigate to infrastructure folder
cd infrastructure

# Start all databases, Kafka broker, and Zookeeper in detached mode
docker compose up -d

# Verify all containers are healthy
docker compose ps
```

Container port allocations:
- PostgreSQL (`auth_db`): `5431`
- PostgreSQL (`account_db`): `5432`
- PostgreSQL (`transaction_db`): `5433`
- PostgreSQL (`audit_db`): `5434`
- PostgreSQL (`notification_db`): `5435`
- Zookeeper: `2181`
- Apache Kafka: `9092`

---

## 15. Local Development Instructions

### Prerequisites
- **Java 21 JDK** installed (`java -version`)
- **Maven 3.9+** installed (`mvn -version`)
- **Python 3.11+** installed (`python --version`)
- **Node.js 18+** & **npm** (`node -v`)
- **Docker Desktop** running

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/AstraMind-01/FinEdge.git
cd FinEdge

# Create local environment config from template
cp .env.example .env
cp frontend/.env.example frontend/.env.local
```

### Step 2: Spin Up Infrastructure
```bash
cd infrastructure
docker compose up -d
cd ..
```

### Step 3: Run Python Fraud Detection Service
```bash
cd ai-ml/fraud-detection-service
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8086 --reload
```

### Step 4: Run Spring Boot Microservices
You can run each service individually or run them using the provided automation scripts:
```bash
# In backend/ root:
mvn clean install -DskipTests

# Run API Gateway:
cd backend/api-gateway && mvn spring-boot:run

# In separate terminals, run:
# - backend/auth-service
# - backend/account-service
# - backend/transaction-service
# - backend/notification-service
# - backend/audit-service
# - backend/support-service
```
*(Windows PowerShell helper scripts are also available in `infrastructure/scripts/`)*

### Step 5: Run Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 16. Team Contribution

| Member | Role | Assigned Ownership | Branch |
| :--- | :--- | :--- | :--- |
| **Pritam Sahoo** (`AstraMind-01`) | **Team Lead & Architect** | Transaction Service, Transaction workflow, ML integration, System integration, Architecture | `feature/transaction-service` |
| **Subhankar Das** (`Immortalcoder0`) | **Backend Developer** | Auth Service, Account Service, JWT/security, Account ownership | `feature/auth-account` |
| **Soumyadip Singha** (`Simply-Coder-start`) | **AI/ML Specialist** | Fraud Detection Service, Python/FastAPI, ML preprocessing, Model training, Model evaluation, Risk scoring | `feature/fraud-ml` |
| **Rishav Singh** (`rishavsingh181`) | **Frontend & DevOps** | React frontend, Fraud dashboard, Docker/DevOps, Integration testing | `feature/frontend-devops` |

---

## 17. GitHub Workflow

To maintain code quality, stability, and zero secret leakage, the team adheres to strict branch protection rules:

1. **No direct pushes to `main`**: All features must branch from `main`.
2. **Dedicated Feature Branches**:
   - `feature/transaction-service`
   - `feature/auth-account`
   - `feature/fraud-ml`
   - `feature/frontend-devops`
3. **Conventional Commits**: Every commit message must follow the convention (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
4. **Pull Requests Required**: Open a Pull Request into `main` using the repository PR template (`.github/pull_request_template.md`).
5. **Mandatory Peer Review**: At least one other team member must approve before merge.
6. **Zero Secrets Policy**: Never commit `.env`, `.pem`, `.key`, or plain-text credentials.

---

## 18. Honest Project Status & Future Improvements

### Current Implementation Status
- [x] Java Spring Boot Microservices (Gateway, Auth, Account, Transaction, Notification, Audit, Support, Admin)
- [x] WebAuthn Biometric Passkeys & QR Code Authentication Flow
- [x] Next.js + React 19 Customer Banking & Admin Monitoring UI
- [x] Python FastAPI Real-Time Fraud Evaluation Service (`/api/v1/fraud/evaluate`)
- [x] Kafka Event-Driven Architecture with Multi-Database Isolation
- [x] Docker Compose multi-service local environment setup
- [x] Ayasa AI Assistant with grounded banking intent walkthroughs
- [ ] *(In Progress)* Full ML training on multi-gigabyte production PaySim datasets (scripts written, large raw dataset excluded from Git)
- [ ] *(In Progress)* Distributed Tracing with Zipkin/OpenTelemetry across all microservices
- [ ] *(Planned)* Kubernetes (k8s) Helm charts and cloud deployment (AWS/GCP)
- [ ] *(Planned)* Live biometric liveness detection via front camera stream

### Future Roadmap
1. **Graph Neural Networks (GNN)**: Implementing Neo4j and GNNs to detect organized financial fraud rings and mule networks.
2. **Open Banking PSD2 APIs**: Exposing standardized read/write APIs for third-party fintech integrators.
3. **Multi-Region Active-Active Replication**: Expanding Kafka and PostgreSQL clusters across cloud availability zones.
