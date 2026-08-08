package com.onlinebanking.audit.event;

import com.onlinebanking.audit.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private static final Logger log = LoggerFactory.getLogger(AuditEventListener.class);

    private final AuditService auditService;

    @KafkaListener(
            topics = "${app.kafka.topics.transaction-events:transaction-events}",
            groupId = "${spring.kafka.consumer.group-id:audit-service-group}"
    )
    public void consumeTransactionEvent(TransactionEvent event) {
        // Step 15: Extract correlation ID from event and set in MDC for Kafka consumer thread.
        String correlationId = event != null ? event.correlationId() : null;
        try {
            if (correlationId != null && !correlationId.isBlank()) {
                MDC.put("correlationId", correlationId);
            }

            log.info("Audit Service received TransactionEvent: [{}]", event.transactionRef());
            auditService.processTransactionEvent(event);
        } catch (Exception e) {
            log.error("Resilience Warning: Error auditing event [{}]. Skipping record without crashing listener thread: {}",
                    event != null ? event.transactionRef() : "NULL", e.getMessage());
        } finally {
            MDC.remove("correlationId");
        }
    }
}
