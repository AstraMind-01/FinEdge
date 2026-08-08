# Online Banking System using REST APIs and Microservices

## Project Objective
The **Online Banking System** is a production-inspired, educational microservices architecture built to demonstrate modern backend banking capabilities including authentication, account management, financial transactions, audit logging, and notifications using Spring Boot 3.x and Java 21.

## Architecture Overview
The system follows a microservices architecture pattern:
* **Client Interface** → **API Gateway** → **Independent Microservices** → **Dedicated PostgreSQL Databases**
* **Synchronous Communication**: HTTP / REST APIs via Spring Web & Spring Cloud Gateway.
* **Asynchronous Communication**: Kafka (planned for future phases).

```
                      +-------------------+
                      |    API Gateway    |
                      |   (Port 8080)     |
                      +---------+---------+
                                |
      +-----------------+-------+-------+-----------------+-----------------+
      |                 |               |                 |                 |
+-----+-----+     +-----+-----+   +-----+-----+     +-----+-----+     +-----+-----+
|   Auth    |     |  Account  |   |Transaction|     |Notification|    |   Audit   |
| Service   |     |  Service  |   |  Service  |     |  Service  |     |  Service  |
|(Port 8081)|     |(Port 8082)|   |(Port 8083)|     |(Port 8084)|     |(Port 8085)|
+-----------+     +-----------+   +-----------+     +-----------+     +-----------+
```

## List of Microservices
1. **api-gateway** (Port `8080`): Central entry point for API routing and cross-cutting concerns.
2. **auth-service** (Port `8081`): User registration, authentication, and credentials management.
3. **account-service** (Port `8082`): Customer bank accounts, balances, and profile operations.
4. **transaction-service** (Port `8083`): Money transfers, deposits, withdrawals, and ledger history.
5. **notification-service** (Port `8084`): Email and system alerts for banking activities.
6. **audit-service** (Port `8085`): Immutable activity logs and security compliance tracing.

## Technology Stack
* **Java**: 21 LTS
* **Framework**: Spring Boot 3.2.5
* **Cloud Framework**: Spring Cloud 2023.0.1 (Spring Cloud Gateway)
* **Build Tool**: Apache Maven
* **Database**: PostgreSQL (per-service isolation)
* **API Style**: RESTful JSON APIs (`/api/v1/...`)
* **Utilities**: Lombok
* **Containerization**: Docker & Docker Compose
* **IDE**: IntelliJ IDEA

## Current Project Status
* **Step 1 Completed**: Repository foundation, multi-module Maven structure, Spring Boot setup for all 6 microservices, dynamic health check endpoints (`GET /api/v1/health`), package structure initialization, and basic Docker Compose foundation.

## How to Run Services Locally

### Prerequisites
* JDK 21 installed (`java -version`)
* Apache Maven installed (`mvn -version`)

### Building the Project
From the root directory, compile and package all services:
```bash
mvn clean package -DskipTests
```

### Running Individual Microservices
You can run any service using Maven or by running the Spring Boot Application class in your IDE:

* **API Gateway** (Port 8080):
  ```bash
  mvn spring-boot:run -pl api-gateway
  ```
* **Auth Service** (Port 8081):
  ```bash
  mvn spring-boot:run -pl auth-service
  ```
* **Account Service** (Port 8082):
  ```bash
  mvn spring-boot:run -pl account-service
  ```
* **Transaction Service** (Port 8083):
  ```bash
  mvn spring-boot:run -pl transaction-service
  ```
* **Notification Service** (Port 8084):
  ```bash
  mvn spring-boot:run -pl notification-service
  ```
* **Audit Service** (Port 8085):
  ```bash
  mvn spring-boot:run -pl audit-service
  ```

### Verifying Service Health
Once started, verify each service health endpoint:
* API Gateway: `curl http://localhost:8080/api/v1/health`
* Auth Service: `curl http://localhost:8081/api/v1/health`
* Account Service: `curl http://localhost:8082/api/v1/health`
* Transaction Service: `curl http://localhost:8083/api/v1/health`
* Notification Service: `curl http://localhost:8084/api/v1/health`
* Audit Service: `curl http://localhost:8085/api/v1/health`
