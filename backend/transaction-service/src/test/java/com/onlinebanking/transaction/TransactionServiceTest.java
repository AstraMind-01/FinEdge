package com.onlinebanking.transaction;

import com.onlinebanking.transaction.dto.CreateRecurringRuleRequest;
import com.onlinebanking.transaction.dto.DepositRequest;
import com.onlinebanking.transaction.dto.FraudCheckResponse;
import com.onlinebanking.transaction.dto.InternalAccountResponse;
import com.onlinebanking.transaction.dto.RecurringRuleResponse;
import com.onlinebanking.transaction.dto.ScheduleTransferRequest;
import com.onlinebanking.transaction.dto.ScheduledTransferResponse;
import com.onlinebanking.transaction.dto.TransactionResponse;
import com.onlinebanking.transaction.dto.TransferRequest;
import com.onlinebanking.transaction.dto.WithdrawRequest;
import com.onlinebanking.transaction.entity.RecurringFrequency;
import com.onlinebanking.transaction.entity.RecurringRuleStatus;
import com.onlinebanking.transaction.entity.RecurringTransferRule;
import com.onlinebanking.transaction.entity.ScheduledTransfer;
import com.onlinebanking.transaction.entity.ScheduledTransferStatus;
import com.onlinebanking.transaction.entity.Transaction;
import com.onlinebanking.transaction.entity.TransactionStatus;
import com.onlinebanking.transaction.exception.FraudBlockedException;
import com.onlinebanking.transaction.exception.FraudServiceUnavailableException;
import com.onlinebanking.transaction.exception.IdempotencyConflictException;
import com.onlinebanking.transaction.exception.InsufficientBalanceException;
import com.onlinebanking.transaction.exception.TransactionLimitExceededException;
import com.onlinebanking.transaction.event.TransactionProducer;
import com.onlinebanking.transaction.repository.RecurringTransferRuleRepository;
import com.onlinebanking.transaction.repository.ScheduledTransferRepository;
import com.onlinebanking.transaction.repository.TransactionRepository;
import com.onlinebanking.transaction.service.JwtService;
import com.onlinebanking.transaction.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private ScheduledTransferRepository scheduledTransferRepository;

    @Mock
    private RecurringTransferRuleRepository recurringTransferRuleRepository;

    @Mock
    private TransactionProducer transactionProducer;

    @Mock
    private JwtService jwtService;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private TransactionService transactionService;

    private InternalAccountResponse sampleAccount;
    private InternalAccountResponse recipientAccount;

    @BeforeEach
    void setUp() {
        sampleAccount = new InternalAccountResponse(
                "1011111111",
                "alice",
                "SAVINGS",
                new BigDecimal("10000.00"),
                "ACTIVE"
        );
        recipientAccount = new InternalAccountResponse(
                "1022222222",
                "bob",
                "CURRENT",
                new BigDecimal("500.00"),
                "ACTIVE"
        );
    }

    @Test
    @DisplayName("Deposit: Success path credits account and publishes event")
    void deposit_Success() {
        DepositRequest req = new DepositRequest("1011111111", new BigDecimal("200.00"), "idemp-001");

        when(transactionRepository.findByIdempotencyKeyAndInitiatedByUsername("idemp-001", "alice"))
                .thenReturn(Optional.empty());
        when(restTemplate.getForEntity(contains("/accounts/internal/1011111111"), eq(InternalAccountResponse.class)))
                .thenReturn(ResponseEntity.ok(sampleAccount));

        FraudCheckResponse fraudResp = new FraudCheckResponse("TXN-1", 10.0, "ALLOW", List.of(), "v1", "2026-08-08T20:00:00Z");
        when(restTemplate.postForEntity(contains("/fraud/check"), any(HttpEntity.class), eq(FraudCheckResponse.class)))
                .thenReturn(ResponseEntity.ok(fraudResp));

        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> {
            Transaction t = i.getArgument(0);
            t.setId(100L);
            t.setCreatedAt(LocalDateTime.now());
            return t;
        });

        TransactionResponse resp = transactionService.deposit(req, "alice", "Bearer jwt-xyz");

        assertNotNull(resp);
        assertEquals(TransactionStatus.SUCCESS, resp.status());
        verify(transactionProducer, times(1)).publishEvent(any(Transaction.class));
    }

    @Test
    @DisplayName("Withdraw: Exceeding per-transaction limit throws TransactionLimitExceededException (403)")
    void withdraw_ExceedsPerTransactionLimit_ThrowsException() {
        // SAVINGS per-transaction limit is $5,000.00; request $6,000.00
        WithdrawRequest req = new WithdrawRequest("1011111111", new BigDecimal("6000.00"), "idemp-limit-1");

        when(restTemplate.getForEntity(contains("/accounts/internal/1011111111"), eq(InternalAccountResponse.class)))
                .thenReturn(ResponseEntity.ok(sampleAccount));

        assertThrows(TransactionLimitExceededException.class, () ->
                transactionService.withdraw(req, "alice", "Bearer jwt-xyz")
        );
        // Verify fraud detection was NOT called (limit check fails fast)
        verify(restTemplate, never()).postForEntity(contains("/fraud/check"), any(), any());
    }

    @Test
    @DisplayName("Transfer: Exceeding daily cumulative limit throws TransactionLimitExceededException (403)")
    void transfer_ExceedsDailyCumulativeLimit_ThrowsException() {
        // SAVINGS daily cumulative limit is $10,000.00; today's usage already $8,000.00, requesting $3,000.00
        TransferRequest req = new TransferRequest("1011111111", "1022222222", new BigDecimal("3000.00"), "idemp-limit-2");

        when(restTemplate.getForEntity(contains("/accounts/internal/1011111111"), eq(InternalAccountResponse.class)))
                .thenReturn(ResponseEntity.ok(sampleAccount));
        when(restTemplate.getForEntity(contains("/accounts/internal/1022222222"), eq(InternalAccountResponse.class)))
                .thenReturn(ResponseEntity.ok(recipientAccount));
        when(transactionRepository.calculateDailyOutgoingTotal(eq("1011111111"), any(), any()))
                .thenReturn(new BigDecimal("8000.00"));

        assertThrows(TransactionLimitExceededException.class, () ->
                transactionService.transfer(req, "alice", "Bearer jwt-xyz")
        );
    }

    @Test
    @DisplayName("Scheduled Transfer: Schedule a future-dated transfer successfully")
    void scheduleTransfer_Success() {
        ScheduleTransferRequest req = new ScheduleTransferRequest(
                "1011111111",
                "1022222222",
                new BigDecimal("500.00"),
                "Rent payment",
                LocalDateTime.now().plusDays(5)
        );

        when(restTemplate.getForEntity(contains("/accounts/internal/1011111111"), eq(InternalAccountResponse.class)))
                .thenReturn(ResponseEntity.ok(sampleAccount));
        when(scheduledTransferRepository.save(any(ScheduledTransfer.class))).thenAnswer(i -> {
            ScheduledTransfer st = i.getArgument(0);
            st.setId(10L);
            return st;
        });

        ScheduledTransferResponse resp = transactionService.scheduleTransfer(req, "alice");

        assertNotNull(resp);
        assertEquals(ScheduledTransferStatus.PENDING, resp.status());
        assertEquals(new BigDecimal("500.00"), resp.amount());
    }

    @Test
    @DisplayName("Recurring Transfer: Create a valid recurring rule successfully")
    void createRecurringRule_Success() {
        CreateRecurringRuleRequest req = new CreateRecurringRuleRequest(
                "1011111111",
                "1022222222",
                new BigDecimal("200.00"),
                "Weekly allowance",
                RecurringFrequency.WEEKLY,
                LocalDateTime.now(),
                LocalDateTime.now().plusMonths(3),
                12
        );

        when(restTemplate.getForEntity(contains("/accounts/internal/1011111111"), eq(InternalAccountResponse.class)))
                .thenReturn(ResponseEntity.ok(sampleAccount));
        when(recurringTransferRuleRepository.save(any(RecurringTransferRule.class))).thenAnswer(i -> {
            RecurringTransferRule r = i.getArgument(0);
            r.setId(20L);
            return r;
        });

        RecurringRuleResponse resp = transactionService.createRecurringRule(req, "alice");

        assertNotNull(resp);
        assertEquals(RecurringRuleStatus.ACTIVE, resp.status());
        assertEquals(RecurringFrequency.WEEKLY, resp.frequency());
    }

    @Test
    @DisplayName("Deposit: High Risk Fraud score blocks deposit with FraudBlockedException")
    void deposit_HighRisk_BlocksTransaction() {
        DepositRequest req = new DepositRequest("1011111111", new BigDecimal("50.00"), "idemp-high-risk");

        when(restTemplate.getForEntity(contains("/accounts/internal/1011111111"), eq(InternalAccountResponse.class)))
                .thenReturn(ResponseEntity.ok(sampleAccount));

        FraudCheckResponse fraudResp = new FraudCheckResponse("TXN-1", 88.0, "HIGH_RISK", List.of("HIGH_AMOUNT"), "v1", "2026-08-08T20:00:00Z");
        when(restTemplate.postForEntity(contains("/fraud/check"), any(HttpEntity.class), eq(FraudCheckResponse.class)))
                .thenReturn(ResponseEntity.ok(fraudResp));

        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> {
            Transaction t = i.getArgument(0);
            if (t.getCreatedAt() == null) t.setCreatedAt(LocalDateTime.now());
            return t;
        });

        assertThrows(FraudBlockedException.class, () ->
                transactionService.deposit(req, "alice", "Bearer jwt-xyz")
        );
    }
}
