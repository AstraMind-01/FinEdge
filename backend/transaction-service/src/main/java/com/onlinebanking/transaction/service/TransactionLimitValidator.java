package com.onlinebanking.transaction.service;

import com.onlinebanking.transaction.exception.TransactionLimitExceededException;
import com.onlinebanking.transaction.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class TransactionLimitValidator {

    private static final Logger log = LoggerFactory.getLogger(TransactionLimitValidator.class);

    public static final BigDecimal SAVINGS_PER_TXN_LIMIT = new BigDecimal("5000.00");
    public static final BigDecimal SAVINGS_DAILY_LIMIT = new BigDecimal("10000.00");

    public static final BigDecimal CHECKING_PER_TXN_LIMIT = new BigDecimal("25000.00");
    public static final BigDecimal CHECKING_DAILY_LIMIT = new BigDecimal("50000.00");

    public static final BigDecimal DEFAULT_PER_TXN_LIMIT = new BigDecimal("10000.00");
    public static final BigDecimal DEFAULT_DAILY_LIMIT = new BigDecimal("20000.00");

    private TransactionLimitValidator() {}

    public static void validateTransactionLimits(
            TransactionRepository transactionRepository,
            String accountNumber,
            String accountTypeStr,
            BigDecimal amount
    ) {
        BigDecimal perTxnLimit = getPerTransactionLimit(accountTypeStr);
        BigDecimal dailyLimit = getDailyLimit(accountTypeStr);

        // 1. Per-Transaction Limit Check
        if (amount.compareTo(perTxnLimit) > 0) {
            log.warn("LIMIT_EXCEEDED: Transaction amount ${} exceeds per-transaction limit ${} for account type {}",
                    amount, perTxnLimit, accountTypeStr);
            throw new TransactionLimitExceededException(
                    "Per-transaction limit exceeded. Maximum allowed for " + (accountTypeStr != null ? accountTypeStr : "ACCOUNT") +
                    ": $" + perTxnLimit + ", Requested: $" + amount
            );
        }

        // 2. Daily Cumulative Limit Check
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);
        BigDecimal todaysTotal = transactionRepository.calculateDailyOutgoingTotal(accountNumber, startOfDay, endOfDay);
        BigDecimal projectedTotal = todaysTotal.add(amount);

        if (projectedTotal.compareTo(dailyLimit) > 0) {
            log.warn("LIMIT_EXCEEDED: Daily cumulative total ${} exceeds daily limit ${} for account {}",
                    projectedTotal, dailyLimit, accountNumber);
            throw new TransactionLimitExceededException(
                    "Daily cumulative limit exceeded. Daily limit: $" + dailyLimit +
                    ", Today's usage: $" + todaysTotal + ", Requested: $" + amount
            );
        }
    }

    public static BigDecimal getPerTransactionLimit(String accountTypeStr) {
        if (accountTypeStr != null) {
            if ("SAVINGS".equalsIgnoreCase(accountTypeStr)) return SAVINGS_PER_TXN_LIMIT;
            if ("CHECKING".equalsIgnoreCase(accountTypeStr) || "CURRENT".equalsIgnoreCase(accountTypeStr)) return CHECKING_PER_TXN_LIMIT;
        }
        return DEFAULT_PER_TXN_LIMIT;
    }

    public static BigDecimal getDailyLimit(String accountTypeStr) {
        if (accountTypeStr != null) {
            if ("SAVINGS".equalsIgnoreCase(accountTypeStr)) return SAVINGS_DAILY_LIMIT;
            if ("CHECKING".equalsIgnoreCase(accountTypeStr) || "CURRENT".equalsIgnoreCase(accountTypeStr)) return CHECKING_DAILY_LIMIT;
        }
        return DEFAULT_DAILY_LIMIT;
    }
}
