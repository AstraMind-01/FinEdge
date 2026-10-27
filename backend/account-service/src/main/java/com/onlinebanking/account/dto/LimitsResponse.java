package com.onlinebanking.account.dto;

import java.math.BigDecimal;

public record LimitsResponse(
        String accountType,
        BigDecimal dailyTransactionLimit,
        BigDecimal perTransactionLimit,
        BigDecimal dailyTransferLimit
) {
}
