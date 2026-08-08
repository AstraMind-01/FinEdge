# FinEdge

AI-Powered Banking & Fraud Detection Platform

## 1. Project Overview
FinEdge is an intelligent, microservices-based banking and payment platform that integrates real-time transaction processing with AI-driven fraud detection. 

## 2. Architecture
The system follows a microservices architecture:
- **Frontend**: A React-based web application for customers and admins.
- **API Gateway**: Routes traffic to backend services.
- **Backend Services**: Java Spring Boot microservices handling core banking functionality (Auth, Account, Transaction, Notification, Audit).
- **AI/ML Service**: A Python/FastAPI service for evaluating transactions through a machine-learning model (XGBoost/Scikit-learn).
- **Databases**: Individual PostgreSQL databases per service following the database-per-service pattern.
- **Event Bus**: Kafka is used for asynchronous communication between services (e.g., triggering notifications upon transactions).

## 3. Repository Structure
The repository is organized as a monorepo so that cross-functional teams can work independently:
- `frontend/` - React application code
- `backend/` - Java Spring Boot microservices
- `ai-ml/` - Python ML and fraud detection service
- `database/` - PostgreSQL schemas and migrations
- `infrastructure/` - Docker, Kafka, and deployment configurations
- `docs/` - Architecture diagrams, API specs, and project reports
- `tests/` - Integration and E2E testing
- `.github/` - GitHub Actions workflows and PR templates

## 4. Technology Stack
- **Frontend**: React, Vite, Tailwind CSS (or Vanilla CSS)
- **Backend**: Java 21, Spring Boot 3.x, Spring Cloud
- **AI/ML**: Python, FastAPI, Pandas, Scikit-learn, XGBoost
- **Databases**: PostgreSQL
- **Messaging**: Apache Kafka, Zookeeper
- **Infrastructure**: Docker, Docker Compose

## 5. How Frontend Works
The frontend is built with React and Vite. It connects to the API Gateway to perform authentication, view accounts, and manage transactions. Developers working on the frontend own the `frontend/` directory.

## 6. How Backend Works
The backend is a suite of Java Spring Boot microservices. Each service is independently buildable via Maven. Developers modify services inside the `backend/` directory. The parent `pom.xml` in `backend/` manages dependencies for all modules.

## 7. How AI/ML Works
The AI/ML component lives in `ai-ml/`. It includes training scripts, Jupyter notebooks, and a production FastAPI service (`fraud-detection-service`) that evaluates incoming transactions in real time.

## 8. Database Architecture
Each microservice maintains its own database (e.g., `auth_db`, `account_db`) in PostgreSQL. Schemas and migrations are stored in the `database/` folder to separate infrastructure definitions from application code.

## 9. Kafka Architecture
Kafka serves as the event backbone. For example, when a transaction occurs, an event is produced to a Kafka topic which the Notification and Audit services consume. Configuration is maintained in `infrastructure/docker-compose.yml`.

## 10. Docker Setup
All infrastructure components (Kafka, Zookeeper, PostgreSQL instances) and the AI/ML service are containerized. You can spin up the environment from the `infrastructure/` directory using Docker Compose.

## 11. Local Development
- Ensure Docker is running.
- Start infrastructure: `cd infrastructure && docker-compose up -d`
- Start backend services: Navigate to `backend/` and run `mvn spring-boot:run` for each service, or use the provided scripts in `infrastructure/scripts/`.
- Start frontend: Navigate to `frontend/` and run `npm run dev`.

## 12. Team Contribution
- **Developer 1 (Team Lead)**: Owns `backend/transaction-service/`, overall integration, and architecture.
- **Developer 2 (Backend)**: Owns `backend/auth-service/` and `backend/account-service/`.
- **Developer 3 (AI/ML)**: Owns `ai-ml/`.
- **Developer 4 (Frontend + DevOps)**: Owns `frontend/` and `infrastructure/`.

## 13. GitHub Workflow
All work should be done in feature branches (e.g., `feature/transaction-service`, `feature/fraud-ml`) and merged into `main` via Pull Requests. Do not push directly to `main`. CI/CD workflows in `.github/workflows/` automatically build and test code upon push.
