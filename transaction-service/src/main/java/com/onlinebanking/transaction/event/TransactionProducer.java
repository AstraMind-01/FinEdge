package com.onlinebanking.transaction.event;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TransactionProducer {

    private static final Logger log = LoggerFactory.getLogger(TransactionProducer.class);

    private final KafkaTemplate<String, TransactionEvent> kafkaTemplate;

    @Value("${app.kafka.topics.transaction-events:transaction-events}")
    private String topicName;

    public void publishEvent(com.onlinebanking.transaction.entity.Transaction transaction) {
        try {
            // Step 15: Read correlation ID from MDC (set by CorrelationIdLoggingFilter)
            // and propagate through the Kafka event so downstream consumers can log it.
            String correlationId = MDC.get("correlationId");

            TransactionEvent event = new TransactionEvent(
                    UUID.randomUUID().toString(),
                    transaction.getTransactionRef(),
                    transaction.getType().name(),
                    transaction.getFromAccountNumber(),
                    transaction.getToAccountNumber(),
                    transaction.getAmount(),
                    transaction.getStatus().name(),
                    transaction.getInitiatedByUsername(),
                    transaction.getRiskScore(),
                    transaction.getRiskDecision(),
                    transaction.getCreatedAt(),
                    correlationId   // Step 15: threaded from HTTP request MDC
            );


            log.info("Publishing TransactionEvent [{}] (Risk: {}, Decision: {}) to Kafka topic '{}'",
                    event.transactionRef(), event.riskScore(), event.riskDecision(), topicName);
            kafkaTemplate.send(topicName, transaction.getTransactionRef(), event)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Failed to publish TransactionEvent [{}]: {}", event.transactionRef(), ex.getMessage());
                        } else {
                            log.info("Successfully published TransactionEvent [{}] to partition {}",
                                    event.transactionRef(), result.getRecordMetadata().partition());
                        }
                    });
        } catch (Exception e) {
            log.error("Non-blocking error publishing TransactionEvent [{}]: {}", transaction.getTransactionRef(), e.getMessage());
        }
    }
}
