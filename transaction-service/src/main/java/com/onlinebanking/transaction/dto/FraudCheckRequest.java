package com.onlinebanking.transaction.dto;

import java.math.BigDecimal;

public record FraudCheckRequest(
        String transactionRef,
        String type,
        String fromAccountNumber,
        String toAccountNumber,
        BigDecimal amount,
        String initiatedByUsername,
        String timestamp
) {
}
