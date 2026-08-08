package com.onlinebanking.account.dto;

import com.onlinebanking.account.entity.AccountStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAccountStatusRequest(
        @NotNull(message = "Account status is required (ACTIVE, INACTIVE, or FROZEN)")
        AccountStatus status
) {
}
