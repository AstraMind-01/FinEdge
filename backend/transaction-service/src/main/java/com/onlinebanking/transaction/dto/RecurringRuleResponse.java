package com.onlinebanking.transaction.dto;

import com.onlinebanking.transaction.entity.RecurringFrequency;
import com.onlinebanking.transaction.entity.RecurringRuleStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RecurringRuleResponse(
        Long id,
        String fromAccountNumber,
        String toAccountNumber,
        BigDecimal amount,
        String description,
        RecurringFrequency frequency,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Integer maxOccurrences,
        Integer completedOccurrences,
        LocalDateTime nextRunAt,
        RecurringRuleStatus status,
        String initiatedByUsername,
        LocalDateTime createdAt
) {
}
