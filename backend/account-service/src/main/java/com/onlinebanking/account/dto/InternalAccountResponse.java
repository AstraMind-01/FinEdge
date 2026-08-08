package com.onlinebanking.account.dto;

import com.onlinebanking.account.entity.AccountStatus;
import com.onlinebanking.account.entity.AccountType;
import java.math.BigDecimal;

public record InternalAccountResponse(
        String accountNumber,
        String ownerUsername,
        AccountType accountType,
        BigDecimal balance,
        AccountStatus status
) {
}
