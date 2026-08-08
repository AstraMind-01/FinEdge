package com.onlinebanking.audit.dto;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        String action,
        String performedByUsername,
        String transactionRef,
        String details,
        LocalDateTime timestamp
) {
}
