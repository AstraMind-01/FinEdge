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
        if (auditLogRepository.count() == 0) {
            seedInitialAuditLogs();
        }
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

    private void seedInitialAuditLogs() {
        AuditLog log1 = AuditLog.builder()
                .action("SYSTEM_BOOT")
                .performedByUsername("SYSTEM")
                .transactionRef("SYS-INIT-001")
                .details("FinEdge Microservices Engine initialized with Fail-Closed Security Policy")
                .build();

        AuditLog log2 = AuditLog.builder()
                .action("KYC_VERIFICATION")
                .performedByUsername("admin_demo_user")
                .transactionRef("KYC-88902")
                .details("KYC Verification approved for user admin_demo_user (Passport P99998888)")
                .build();

        AuditLog log3 = AuditLog.builder()
                .action("SECURITY_POLICY")
                .performedByUsername("SYSTEM")
                .transactionRef("SEC-POL-003")
                .details("Fail-closed fraud detection policy and JWT claims enforcement activated")
                .build();

        AuditLog log4 = AuditLog.builder()
                .action("ACCOUNT_OPENED")
                .performedByUsername("admin_demo_user")
                .transactionRef("ACC-OPEN-001")
                .details("New Savings Account opened with initial deposit $10,000.00")
                .build();

        auditLogRepository.saveAll(List.of(log1, log2, log3, log4));
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
