package com.onlinebanking.account.dto;

import com.onlinebanking.account.entity.AccountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateAccountRequest(
        @NotNull(message = "Account type is required (SAVINGS or CURRENT)")
        AccountType accountType,

        @DecimalMin(value = "0.0", message = "Initial deposit cannot be negative")
        BigDecimal initialDeposit
) {
    public CreateAccountRequest {
        if (initialDeposit == null) {
            initialDeposit = BigDecimal.ZERO;
        }
    }
}
