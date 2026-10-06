package com.onlinebanking.transaction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ScheduleTransferRequest(
        @NotBlank(message = "Source account number is required")
        String fromAccountNumber,

        @NotBlank(message = "Destination account number is required")
        String toAccountNumber,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        BigDecimal amount,

        String description,

        @NotNull(message = "Scheduled execution date/time is required")
        LocalDateTime scheduledAt
) {
}
