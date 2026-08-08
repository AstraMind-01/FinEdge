package com.onlinebanking.transaction.dto;

import java.math.BigDecimal;

public record AmountRequest(
        BigDecimal amount
) {
}
