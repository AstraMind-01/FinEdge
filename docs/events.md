# Transaction Events Contract Specification

## Overview
To prevent tight coupling between microservices, each service maintains independent codebases and models (no shared common JAR/module).
The `transaction-service` produces events to Kafka topic `transaction-events`. Consuming services (`notification-service`, `audit-service`) implement matching event DTOs based on this contract specification.

## Topic Name
`transaction-events`

## Event Contract Schema (`TransactionEvent`)

```json
{
  "eventId": "String (UUID v4)",
  "transactionRef": "String (e.g. TXN-1723109500000-4821)",
  "type": "String (DEPOSIT | WITHDRAWAL | TRANSFER)",
  "fromAccountNumber": "String (nullable)",
  "toAccountNumber": "String (nullable)",
  "amount": "Number (BigDecimal format, e.g. 500.00)",
  "status": "String (SUCCESS | FAILED)",
  "initiatedByUsername": "String",
  "riskScore": "Number (Double format 0-100, nullable, e.g. 85.0)",
  "riskDecision": "String (LOW_RISK | REVIEW | HIGH_RISK, nullable)",
  "timestamp": "String (ISO-8601 LocalDateTime, e.g. 2026-08-08T11:05:00)"
}
```

## Field Descriptions
* `eventId`: Unique ID for message deduplication by consumers.
* `transactionRef`: Human-readable reference assigned by `transaction-service`.
* `type`: Type of financial movement (`DEPOSIT`, `WITHDRAWAL`, `TRANSFER`).
* `fromAccountNumber`: Source account number (null for `DEPOSIT`).
* `toAccountNumber`: Destination account number (null for `WITHDRAWAL`).
* `amount`: Transaction monetary value.
* `status`: Processing outcome (`SUCCESS` or `FAILED`).
* `initiatedByUsername`: Account owner/user who requested the transaction.
* `riskScore`: AI Fraud Detection risk score (0-100).
* `riskDecision`: Fraud detection decision recommendation (`LOW_RISK`, `REVIEW`, `HIGH_RISK`).
* `timestamp`: ISO timestamp when the transaction event occurred.
