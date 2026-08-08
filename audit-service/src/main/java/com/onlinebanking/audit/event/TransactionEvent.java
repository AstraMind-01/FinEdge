package com.onlinebanking.audit.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
        LocalDateTime timestamp
) {
}
