package com.onlinebanking.audit.service;

import com.onlinebanking.audit.dto.AuditLogResponse;
import com.onlinebanking.audit.entity.AuditLog;
import com.onlinebanking.audit.event.TransactionEvent;
import com.onlinebanking.audit.repository.AuditLogRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;

    public void processTransactionEvent(TransactionEvent event) {
        log.info("Audit Service recording event [{}] for user: {}", event.transactionRef(), event.initiatedByUsername());

        String action = "TRANSACTION_" + event.status().toUpperCase();
        String details = buildAuditDetails(event);

        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .performedByUsername(event.initiatedByUsername())
                .transactionRef(event.transactionRef())
                .details(details)
                .build();

        auditLogRepository.save(auditLog);
        log.info("Saved AuditLog ID {} for action {}", auditLog.getId(), action);
    }

    public List<AuditLogResponse> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc()
                .stream()
                .map(a -> new AuditLogResponse(
                        a.getId(),
                        a.getAction(),
                        a.getPerformedByUsername(),
                        a.getTransactionRef(),
                        a.getDetails(),
                        a.getTimestamp()
                ))
                .toList();
    }

    private String buildAuditDetails(TransactionEvent event) {
        return String.format("Type: %s | Amount: $%s | From: %s | To: %s | Status: %s",
                event.type(),
                event.amount(),
                event.fromAccountNumber() != null ? event.fromAccountNumber() : "N/A",
                event.toAccountNumber() != null ? event.toAccountNumber() : "N/A",
                event.status());
    }
}
