package com.onlinebanking.transaction.dto;

import com.onlinebanking.transaction.entity.TransactionStatus;
import com.onlinebanking.transaction.entity.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        String transactionRef,
        TransactionType type,
        String fromAccountNumber,
        String toAccountNumber,
        BigDecimal amount,
        TransactionStatus status,
        String initiatedByUsername,
        LocalDateTime createdAt,
        LocalDateTime completedAt
) {
}
