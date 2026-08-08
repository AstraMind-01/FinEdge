# FinEdge – AI-Powered Banking & Fraud Detection Platform

## 1. Project Overview
FinEdge is an intelligent, modern microservices-based banking platform that integrates Artificial Intelligence to provide real-time fraud detection, secure transactions, and scalable account management.

## 2. Problem Statement
Traditional banking systems struggle with monolithic architectures, high latency, and rule-based fraud detection systems that are slow to adapt to new threats. FinEdge solves this by adopting a microservices architecture for scalability and embedding a machine learning pipeline to proactively identify anomalous and fraudulent transactions in real-time.

## 3. Main Features
- **User Authentication & Authorization**: Secure JWT-based access control with role management.
- **Account Management**: Create and manage bank accounts, balances, and ownership.
- **Transaction Processing**: Handle deposits, withdrawals, and secure transfers with idempotency.
- **AI Fraud Detection**: Real-time evaluation of transactions using trained ML models to generate risk scores.
- **Audit & Notification**: Asynchronous event-driven architecture using Kafka to notify users and audit all actions.

## 4. Architecture
FinEdge uses a distributed microservices architecture coordinated via an API Gateway. Services communicate synchronously via REST and asynchronously via Apache Kafka.

## 5. Microservices
- **API Gateway**: Central entry point routing traffic to appropriate backend services.
- **Auth Service**: Handles registration, login, and JWT token issuance.
- **Account Service**: Manages customer bank accounts and balances.
- **Transaction Service**: Core engine for processing financial movements.
- **Fraud Detection Service**: Python/FastAPI service exposing ML inference for transaction risk scoring.
- **Notification Service**: Consumes Kafka events to send alerts to users.
- **Audit Service**: Immutable ledger for compliance and system auditing.

## 6. AI/ML Fraud Detection
The AI pipeline consumes transaction data and outputs a fraud probability score. Transactions exceeding the risk threshold are flagged for manual review or automatically declined. Models are evaluated based on Precision, Recall, and F1-score to minimize false positives.

## 7. Technology Stack
- **Backend Core**: Java 21, Spring Boot, Spring Cloud, Microservices
- **AI/ML**: Python, FastAPI, Scikit-learn, Pandas, NumPy
- **Database**: PostgreSQL
- **Messaging**: Apache Kafka
- **Containerization**: Docker, Docker Compose
- **Frontend**: React (Planned)

## 8. Dataset Information
The machine learning models are trained on historical, anonymized financial transaction datasets with labeled fraudulent events.

## 9. ML Pipeline
- **Preprocessing**: Imputation, scaling, and categorical encoding.
- **Feature Engineering**: Deriving velocity metrics, transaction frequencies, and historical behavior.
- **Modeling**: Logistic Regression, Random Forest, XGBoost benchmark.
- **Inference**: Exposed via a high-performance FastAPI endpoint.

## 10. Transaction Flow
1. User initiates a transfer via API Gateway.
2. API Gateway routes to Transaction Service.
3. Transaction Service verifies JWT and Account ownership via Auth and Account Services.
4. Transaction Service synchronously calls Fraud Detection Service for a risk score.
5. If approved, balances are updated and an event is published to Kafka.
6. Notification and Audit services consume the event for further processing.

## 11. API Information
The APIs are RESTful, documented via OpenAPI/Swagger (available at each service's `/v3/api-docs` endpoint), and secured with Bearer Tokens.

## 12. Kafka Architecture
Kafka acts as the central event bus decoupling the core path from auxiliary services. Core topics include `transactions-topic`, `notifications-topic`, and `audit-topic`.

## 13. Database Architecture
Each microservice owns its database in alignment with the "Database-per-service" pattern, ensuring loose coupling and independent scalability. PostgreSQL is the standard RDBMS used.

## 14. Docker Setup
The entire stack, including PostgreSQL databases, Zookeeper, Kafka, and the microservices, can be spun up using `docker-compose`.

## 15. Local Development Instructions
1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in the values.
3. Start infrastructure services: `docker-compose up -d postgres zookeeper kafka`
4. Build Java services: `mvn clean install`
5. Run services locally via your IDE or start all via `docker-compose up -d`.

## 16. Team Contribution
- **Pritam Sahoo (@AstraMind-01)**: Transaction Service, ML integration, System integration, Architecture
- **Subhankar Das (@Immortalcoder0)**: Auth Service, Account Service, JWT/security
- **Rishav (@rishavsingh181)**: Fraud Detection Service, Python/FastAPI, ML preprocessing
- **Soumyadip Singha (@Simply-Coder-start)**: React frontend, DevOps, Docker, Integration testing

## 17. GitHub Workflow
- `main` is protected.
- Create feature branches: `feature/<name>`
- Create Pull Requests and require at least one review.
- Never commit secrets to the repository.

## 18. Future Improvements
- Kubernetes deployment manifests.
- CI/CD pipelines using GitHub Actions.
- Enhanced Model explainability (SHAP/LIME).
- GraphQL API Gateway integration.
