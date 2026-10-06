package com.onlinebanking.transaction.dto;

import com.onlinebanking.transaction.entity.ScheduledTransferStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ScheduledTransferResponse(
        Long id,
        String fromAccountNumber,
        String toAccountNumber,
        BigDecimal amount,
        String description,
        LocalDateTime scheduledAt,
        ScheduledTransferStatus status,
        String failureReason,
        String initiatedByUsername,
        LocalDateTime createdAt,
        LocalDateTime executedAt
) {
}
