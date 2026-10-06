package com.onlinebanking.transaction.service;

import com.onlinebanking.transaction.dto.TransferRequest;
import com.onlinebanking.transaction.entity.RecurringRuleStatus;
import com.onlinebanking.transaction.entity.RecurringTransferRule;
import com.onlinebanking.transaction.entity.ScheduledTransfer;
import com.onlinebanking.transaction.entity.ScheduledTransferStatus;
import com.onlinebanking.transaction.repository.RecurringTransferRuleRepository;
import com.onlinebanking.transaction.repository.ScheduledTransferRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.function.BiConsumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ScheduledTransferExecutionHelper {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTransferExecutionHelper.class);

    private ScheduledTransferExecutionHelper() {}

    public static void processDueScheduledTransfers(
            ScheduledTransferRepository scheduledTransferRepository,
            BiConsumer<TransferRequest, String> transferExecutor
    ) {
        List<ScheduledTransfer> dueTransfers = scheduledTransferRepository
                .findByStatusAndScheduledAtLessThanEqual(ScheduledTransferStatus.PENDING, LocalDateTime.now());

        for (ScheduledTransfer st : dueTransfers) {
            log.info("Executing due scheduled transfer ID [{}] for account [{}] -> [{}]",
                    st.getId(), st.getFromAccountNumber(), st.getToAccountNumber());
            try {
                TransferRequest transferReq = new TransferRequest(
                        st.getFromAccountNumber(),
                        st.getToAccountNumber(),
                        st.getAmount(),
                        "SCHED-KEY-" + st.getId() + "-" + System.currentTimeMillis()
                );

                transferExecutor.accept(transferReq, st.getInitiatedByUsername());

                st.setStatus(ScheduledTransferStatus.COMPLETED);
                st.setExecutedAt(LocalDateTime.now());
                st.setFailureReason(null);
            } catch (Exception e) {
                log.error("Scheduled transfer ID [{}] FAILED at execution time: {}", st.getId(), e.getMessage());
                st.setStatus(ScheduledTransferStatus.FAILED);
                st.setFailureReason(e.getMessage());
            }
            scheduledTransferRepository.save(st);
        }
    }

    public static void processDueRecurringRules(
            RecurringTransferRuleRepository recurringTransferRuleRepository,
            BiConsumer<TransferRequest, String> transferExecutor
    ) {
        List<RecurringTransferRule> dueRules = recurringTransferRuleRepository
                .findByStatusAndNextRunAtLessThanEqual(RecurringRuleStatus.ACTIVE, LocalDateTime.now());

        for (RecurringTransferRule rule : dueRules) {
            int nextOccurrenceNum = rule.getCompletedOccurrences() + 1;
            log.info("Executing recurring rule ID [{}] occurrence #{}: account [{}] -> [{}]",
                    rule.getId(), nextOccurrenceNum, rule.getFromAccountNumber(), rule.getToAccountNumber());

            boolean success = false;
            try {
                TransferRequest transferReq = new TransferRequest(
                        rule.getFromAccountNumber(),
                        rule.getToAccountNumber(),
                        rule.getAmount(),
                        "REC-KEY-" + rule.getId() + "-" + nextOccurrenceNum + "-" + System.currentTimeMillis()
                );

                transferExecutor.accept(transferReq, rule.getInitiatedByUsername());
                success = true;
            } catch (Exception e) {
                log.error("Recurring rule ID [{}] occurrence #{} FAILED: {}", rule.getId(), nextOccurrenceNum, e.getMessage());
            }

            if (success) {
                rule.setCompletedOccurrences(rule.getCompletedOccurrences() + 1);
                rule.setConsecutiveFailures(0);
            } else {
                rule.setConsecutiveFailures(rule.getConsecutiveFailures() + 1);
                if (rule.getConsecutiveFailures() >= 3) {
                    log.warn("PAUSING RECURRING RULE [{}]: 3 consecutive occurrence failures", rule.getId());
                    rule.setStatus(RecurringRuleStatus.PAUSED);
                }
            }

            // Advance nextRunAt to next occurrence schedule window
            LocalDateTime nextRun = RecurringTransferHelper.calculateNextRun(rule.getNextRunAt(), rule.getFrequency());
            rule.setNextRunAt(nextRun);

            // Check completion rules
            if (rule.getMaxOccurrences() != null && rule.getCompletedOccurrences() >= rule.getMaxOccurrences()) {
                log.info("Recurring rule [{}] reached max occurrences ({}). Marking COMPLETED.", rule.getId(), rule.getMaxOccurrences());
                rule.setStatus(RecurringRuleStatus.COMPLETED);
            } else if (rule.getEndDate() != null && nextRun.isAfter(rule.getEndDate())) {
                log.info("Recurring rule [{}] next run [{}] is past end date [{}]. Marking COMPLETED.", rule.getId(), nextRun, rule.getEndDate());
                rule.setStatus(RecurringRuleStatus.COMPLETED);
            }

            recurringTransferRuleRepository.save(rule);
        }
    }
}
