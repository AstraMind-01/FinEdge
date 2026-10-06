package com.onlinebanking.transaction.service;

import com.onlinebanking.transaction.entity.RecurringFrequency;
import java.time.LocalDateTime;

public final class RecurringTransferHelper {

    private RecurringTransferHelper() {}

    public static LocalDateTime calculateNextRun(LocalDateTime currentRun, RecurringFrequency frequency) {
        return switch (frequency) {
            case DAILY -> currentRun.plusDays(1);
            case WEEKLY -> currentRun.plusWeeks(1);
            case MONTHLY -> currentRun.plusMonths(1);
        };
    }
}
