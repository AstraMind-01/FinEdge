package com.onlinebanking.account.dto;

import com.onlinebanking.account.entity.AccountStatus;
import com.onlinebanking.account.entity.AccountType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountResponse(
        Long id,
        String accountNumber,
        String ownerUsername,
        AccountType accountType,
        BigDecimal balance,
        AccountStatus status,
        LocalDateTime createdAt
) {
}
