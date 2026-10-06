package com.onlinebanking.notification;

import com.onlinebanking.notification.event.NotificationEventListener;
import com.onlinebanking.notification.event.TransactionEvent;
import com.onlinebanking.notification.service.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationListenerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationEventListener listener;

    @Test
    @DisplayName("Kafka Listener: Consumes well-formed TransactionEvent and processes notification")
    void consumeTransactionEvent_ValidEvent_ProcessesSuccessfully() {
        TransactionEvent event = new TransactionEvent(
                "EVT-001",
                "TXN-100",
                "DEPOSIT",
                null,
                "1011111111",
                new BigDecimal("500.00"),
                "SUCCESS",
                "alice",
                10.0,
                "ALLOW",
                LocalDateTime.now(),
                "test-correlation-id-123"
        );

        listener.consumeTransactionEvent(event);

        verify(notificationService, times(1)).processTransactionEvent(event);
    }

    @Test
    @DisplayName("Kafka Listener Resilience: Malformed or throwing event does not crash listener thread")
    void consumeTransactionEvent_ExceptionInService_ResilientSkip() {
        TransactionEvent event = new TransactionEvent(
                "EVT-ERR",
                "TXN-ERR",
                "DEPOSIT",
                null,
                "1011111111",
                new BigDecimal("500.00"),
                "SUCCESS",
                "alice",
                10.0,
                "ALLOW",
                LocalDateTime.now(),
                "err-correlation-id"
        );

        doThrow(new RuntimeException("Simulated processing error")).when(notificationService).processTransactionEvent(any());

        assertDoesNotThrow(() -> listener.consumeTransactionEvent(event));
    }
}
