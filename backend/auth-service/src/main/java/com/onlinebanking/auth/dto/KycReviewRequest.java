package com.onlinebanking.auth.dto;

import jakarta.validation.constraints.NotNull;

public record KycReviewRequest(
        @NotNull(message = "Approved status is required")
        Boolean approved,

        String rejectionReason
) {
}
