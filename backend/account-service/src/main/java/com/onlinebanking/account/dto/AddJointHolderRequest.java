package com.onlinebanking.account.dto;

import jakarta.validation.constraints.NotBlank;

public record AddJointHolderRequest(
        @NotBlank(message = "Joint holder username is required")
        String jointUsername
) {
}
