# FinEdge System Architecture & Component Diagram

## 1. High-Level Microservice Topology

```mermaid
graph TD
    Client[React Frontend / Postman] -->|HTTP / REST| Gateway[API Gateway :8080]
    
    subgraph "Authentication & User Layer"
        Gateway -->|/api/auth| Auth[Auth Service :8081]
        Auth --> Supabase[(Supabase Postgres auth_service schema)]
    end

    subgraph "Core Banking Operations"
        Gateway -->|/api/accounts| Account[Account Service :8082]
        Account --> Supabase[(Supabase Postgres account_service schema)]
        
        Gateway -->|/api/transactions| Txn[Transaction Service :8083]
        Txn --> Supabase[(Supabase Postgres transaction_service schema)]
    end

    subgraph "AI / ML Real-Time Fraud Engine"
        Txn -->|Sync REST / 500ms SLA| Fraud[Fraud Detection Service :8086]
        Fraud --> MLArtifacts[ML Model Artifacts / XGBoost]
        Fraud --> Supabase[(Supabase Postgres fraud_service schema)]
    end

    subgraph "Event-Driven Asynchronous Pipeline"
        Txn -->|Publish transaction-events| Kafka[Apache Kafka Cluster :9092]
        
        Kafka -->|Subscribe| Notif[Notification Service :8084]
        Notif --> Supabase[(Supabase Postgres notification_service schema)]
        
        Kafka -->|Subscribe| Audit[Audit Service :8085]
        Audit --> Supabase[(Supabase Postgres audit_service schema)]
    end
```

## 2. Event Lifecycle & Fail-Closed Transaction Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Gateway as API Gateway
    participant Txn as Transaction Service
    participant Fraud as Fraud Service (FastAPI)
    participant Kafka as Apache Kafka
    participant Audit as Audit Service
    participant Notif as Notification Service

    Client->>Gateway: POST /api/transactions (Bearer Token + Idempotency-Key)
    Gateway->>Gateway: Validate JWT & Rate Limit
    Gateway->>Txn: Relay Request
    Txn->>Txn: Check Idempotency Key
    Txn->>Fraud: POST /api/v1/fraud/check (Amount, Accounts, Metadata)
    
    alt Fraud Check Approved (Score < 70)
        Fraud-->>Txn: HTTP 200 { decision: "ALLOW", riskScore: 12.5 }
        Txn->>Txn: Execute Debit/Credit DB Commit
        Txn->>Kafka: Publish `transaction-events` (APPROVED)
        Txn-->>Gateway: HTTP 201 Created
        Gateway-->>Client: Transaction Success
    else Fraud Blocked (Score >= 70)
        Fraud-->>Txn: HTTP 200 { decision: "BLOCK", riskScore: 88.0 }
        Txn->>Txn: Mark Status = REJECTED_FRAUD
        Txn->>Kafka: Publish `transaction-events` (BLOCKED)
        Txn-->>Gateway: HTTP 422 Unprocessable Entity
        Gateway-->>Client: Transaction Blocked by Security Policy
    else Fraud Service Timeout / Unavailable (Fail-Closed)
        Fraud--xTxn: Timeout / Connection Error
        Txn->>Txn: Fail-Closed Policy Triggered (Status = HELD_FOR_REVIEW)
        Txn-->>Gateway: HTTP 503 Service Unavailable
        Gateway-->>Client: Transaction Held for Security Review
    end

    par Async Consumption
        Kafka->>Audit: Consume Transaction Event
        Audit->>Audit: Write Append-Only Audit Record
    and Async Notification
        Kafka->>Notif: Consume Transaction Event
        Notif->>Notif: Dispatch Alert Notification
    end
```

## 3. Database Architecture Trade-Off (Step 22: Supabase Migration)

> [!NOTE]
> **Architecture Decision & Trade-Off Documentation (Viva Flag)**:
> - **Original Requirement**: Strict database-per-service with independent database instances.
> - **Production Cloud Adaptation**: Migrated to a centralized **Supabase Cloud PostgreSQL** instance (`postgres`) using **dedicated per-service schemas** (`auth_service`, `account_service`, `transaction_service`, `notification_service`, `audit_service`, `fraud_service`).
> - **Trade-off Rationale**: Maintaining 6+ physical Supabase project instances creates unnecessary cloud subscription costs and connection pooling overhead for a college/enterprise demonstration project. Logical per-service schemas preserve strict table and search path isolation (`currentSchema=service_name`) while consolidating database administration under a single Supabase project.
