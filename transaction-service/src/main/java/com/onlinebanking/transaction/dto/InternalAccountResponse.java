package com.onlinebanking.transaction.dto;

import java.math.BigDecimal;

public record InternalAccountResponse(
        String accountNumber,
        String ownerUsername,
        String accountType,
        BigDecimal balance,
        String status
) {
}
