package com.onlinebanking.notification.event;

import com.onlinebanking.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    private final NotificationService notificationService;

    @KafkaListener(
            topics = "${app.kafka.topics.transaction-events:transaction-events}",
            groupId = "${spring.kafka.consumer.group-id:notification-service-group}"
    )
    public void consumeTransactionEvent(TransactionEvent event) {
        // Step 15: Extract correlation ID from event and set in MDC for Kafka consumer thread.
        // This is a manual MDC set (not from an HTTP header) because Kafka consumer threads
        // are separate from servlet threads — MDC doesn't propagate across thread boundaries.
        String correlationId = event != null ? event.correlationId() : null;
        try {
            if (correlationId != null && !correlationId.isBlank()) {
                MDC.put("correlationId", correlationId);
            }

            log.info("Notification Service received TransactionEvent: [{}]", event.transactionRef());
            notificationService.processTransactionEvent(event);
        } catch (Exception e) {
            log.error("Resilience Warning: Error consuming event [{}]. Skipping record without crashing listener thread: {}",
                    event != null ? event.transactionRef() : "NULL", e.getMessage());
        } finally {
            MDC.remove("correlationId");
        }
    }
}
