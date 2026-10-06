package com.onlinebanking.transaction.dto;

import com.onlinebanking.transaction.entity.RecurringFrequency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateRecurringRuleRequest(
        @NotBlank(message = "Source account number is required")
        String fromAccountNumber,

        @NotBlank(message = "Destination account number is required")
        String toAccountNumber,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        BigDecimal amount,

        String description,

        @NotNull(message = "Frequency is required")
        RecurringFrequency frequency,

        @NotNull(message = "Start date is required")
        LocalDateTime startDate,

        LocalDateTime endDate,

        Integer maxOccurrences
) {
}
