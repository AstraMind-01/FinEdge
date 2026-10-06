package com.onlinebanking.transaction.service;

import com.onlinebanking.transaction.dto.RecurringRuleResponse;
import com.onlinebanking.transaction.dto.ScheduledTransferResponse;
import com.onlinebanking.transaction.dto.TransactionResponse;
import com.onlinebanking.transaction.entity.RecurringTransferRule;
import com.onlinebanking.transaction.entity.ScheduledTransfer;
import com.onlinebanking.transaction.entity.Transaction;

public final class TransactionMapper {

    private TransactionMapper() {}

    public static TransactionResponse mapToResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getTransactionRef(),
                t.getType(),
                t.getFromAccountNumber(),
                t.getToAccountNumber(),
                t.getAmount(),
                t.getStatus(),
                t.getInitiatedByUsername(),
                t.getCreatedAt(),
                t.getCompletedAt(),
                t.getRiskScore(),
                t.getRiskDecision(),
                t.getRiskIndicators()
        );
    }

    public static ScheduledTransferResponse mapToScheduledResponse(ScheduledTransfer st) {
        return new ScheduledTransferResponse(
                st.getId(),
                st.getFromAccountNumber(),
                st.getToAccountNumber(),
                st.getAmount(),
                st.getDescription(),
                st.getScheduledAt(),
                st.getStatus(),
                st.getFailureReason(),
                st.getInitiatedByUsername(),
                st.getCreatedAt(),
                st.getExecutedAt()
        );
    }

    public static RecurringRuleResponse mapToRecurringResponse(RecurringTransferRule r) {
        return new RecurringRuleResponse(
                r.getId(),
                r.getFromAccountNumber(),
                r.getToAccountNumber(),
                r.getAmount(),
                r.getDescription(),
                r.getFrequency(),
                r.getStartDate(),
                r.getEndDate(),
                r.getMaxOccurrences(),
                r.getCompletedOccurrences(),
                r.getNextRunAt(),
                r.getStatus(),
                r.getInitiatedByUsername(),
                r.getCreatedAt()
        );
    }
}
