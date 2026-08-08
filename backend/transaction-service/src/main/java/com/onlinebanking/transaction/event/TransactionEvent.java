package com.onlinebanking.transaction.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Kafka event published after each transaction (deposit, withdrawal, transfer).
 * Consumed by notification-service and audit-service.
 *
 * <p>Step 15: Added {@code correlationId} field to propagate the request's
 * correlation ID through the async Kafka path. This allows notification-service
 * and audit-service to log the same correlation ID that was used for the
 * originating HTTP request, enabling end-to-end request tracing via grep.</p>
 *
 * <p>Jackson will default this field to {@code null} for any events already
 * serialized in the Kafka topic without it (backward compatible).</p>
 */
public record TransactionEvent(
        String eventId,
        String transactionRef,
        String type,
        String fromAccountNumber,
        String toAccountNumber,
        BigDecimal amount,
        String status,
        String initiatedByUsername,
        Double riskScore,
        String riskDecision,
        LocalDateTime timestamp,
        String correlationId   // Step 15: added as LAST field for backward compatibility
) {
}
