package com.onlinebanking.account.dto;

import com.onlinebanking.account.entity.NomineeRelationship;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AddNomineeRequest(
        @NotBlank(message = "Nominee name is required")
        String nomineeName,

        @NotNull(message = "Relationship is required")
        NomineeRelationship relationship,

        String phoneNumber,

        @NotNull(message = "Share percentage is required")
        @DecimalMin(value = "0.01", message = "Share percentage must be greater than zero")
        @DecimalMax(value = "100.00", message = "Share percentage cannot exceed 100")
        BigDecimal sharePercentage
) {
}
