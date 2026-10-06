package com.onlinebanking.audit;

import com.onlinebanking.audit.event.AuditEventListener;
import com.onlinebanking.audit.event.TransactionEvent;
import com.onlinebanking.audit.service.AuditService;
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
class AuditLogListenerTest {

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuditEventListener listener;

    @Test
    @DisplayName("Audit Listener: Consumes TransactionEvent and records append-only audit log")
    void consumeTransactionEvent_ValidEvent_RecordsAuditLog() {
        TransactionEvent event = new TransactionEvent(
                "EVT-AUDIT-01",
                "TXN-AUDIT-01",
                "TRANSFER",
                "1011111111",
                "1022222222",
                new BigDecimal("150.00"),
                "SUCCESS",
                "alice",
                15.0,
                "ALLOW",
                LocalDateTime.now(),
                "audit-cid-456"
        );

        listener.consumeTransactionEvent(event);

        verify(auditService, times(1)).processTransactionEvent(event);
    }

    @Test
    @DisplayName("Audit Listener Resilience: Handler exception logs warning without crashing consumer thread")
    void consumeTransactionEvent_ExceptionInService_ResilientSkip() {
        TransactionEvent event = new TransactionEvent(
                "EVT-AUDIT-ERR",
                "TXN-AUDIT-ERR",
                "TRANSFER",
                "1011111111",
                "1022222222",
                new BigDecimal("150.00"),
                "FAILED",
                "alice",
                90.0,
                "HIGH_RISK",
                LocalDateTime.now(),
                "audit-cid-err"
        );

        doThrow(new RuntimeException("Database error during audit log insert")).when(auditService).processTransactionEvent(any());

        assertDoesNotThrow(() -> listener.consumeTransactionEvent(event));
    }
}
