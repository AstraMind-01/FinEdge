package com.onlinebanking.account.dto;

import jakarta.validation.constraints.NotBlank;

public record FreezeAccountRequest(
        @NotBlank(message = "Reason for freezing account is required")
        String reason
) {
}
