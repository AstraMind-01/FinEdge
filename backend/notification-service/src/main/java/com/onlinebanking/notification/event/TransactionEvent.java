package com.onlinebanking.notification.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Kafka event consumed from transaction-service.
 *
 * <p>Step 15: Added {@code correlationId} field. Jackson defaults missing fields
 * to {@code null} for backward compatibility with pre-Step-15 events.</p>
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
        String correlationId   // Step 15: correlation ID from originating HTTP request
) {
}
