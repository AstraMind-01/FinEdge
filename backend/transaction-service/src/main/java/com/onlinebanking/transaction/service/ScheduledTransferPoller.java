package com.onlinebanking.transaction.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * ScheduledTransferPoller — Background poller for Scheduled and Recurring transfers.
 * 
 * SYSTEM LIMITATION CAVEAT (For Viva Presentation):
 * This scheduler uses an in-memory Spring @Scheduled polling job.
 * In a production multi-instance microservice environment, this poller must be backed by a 
 * distributed lock (e.g. ShedLock, Redis/Redlock, or Quartz DB clustering) to prevent duplicate execution 
 * when multiple transaction-service instances run concurrently.
 */
@Component
@RequiredArgsConstructor
public class ScheduledTransferPoller {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTransferPoller.class);

    private final TransactionService transactionService;

    @Scheduled(fixedDelay = 3000)
    public void processDueTransfers() {
        try {
            transactionService.processDueScheduledTransfers();
            transactionService.processDueRecurringRules();
        } catch (Exception e) {
            log.error("Error in ScheduledTransferPoller execution loop: {}", e.getMessage(), e);
        }
    }
}
