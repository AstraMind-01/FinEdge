package com.onlinebanking.transaction.service;

import com.onlinebanking.transaction.dto.CreateRecurringRuleRequest;
import com.onlinebanking.transaction.dto.DepositRequest;
import com.onlinebanking.transaction.dto.InternalAccountResponse;
import com.onlinebanking.transaction.dto.RecurringRuleResponse;
import com.onlinebanking.transaction.dto.ScheduleTransferRequest;
import com.onlinebanking.transaction.dto.ScheduledTransferResponse;
import com.onlinebanking.transaction.dto.TransactionResponse;
import com.onlinebanking.transaction.dto.TransferRequest;
import com.onlinebanking.transaction.dto.WithdrawRequest;
import com.onlinebanking.transaction.entity.RecurringRuleStatus;
import com.onlinebanking.transaction.entity.RecurringTransferRule;
import com.onlinebanking.transaction.entity.ScheduledTransfer;
import com.onlinebanking.transaction.entity.ScheduledTransferStatus;
import com.onlinebanking.transaction.entity.Transaction;
import com.onlinebanking.transaction.entity.TransactionStatus;
import com.onlinebanking.transaction.entity.TransactionType;
import com.onlinebanking.transaction.event.TransactionProducer;
import com.onlinebanking.transaction.exception.InsufficientBalanceException;
import com.onlinebanking.transaction.exception.InvalidTransactionException;
import com.onlinebanking.transaction.exception.TransactionNotFoundException;
import com.onlinebanking.transaction.repository.RecurringTransferRuleRepository;
import com.onlinebanking.transaction.repository.ScheduledTransferRepository;
import com.onlinebanking.transaction.repository.TransactionRepository;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final TransactionRepository transactionRepository;
    private final ScheduledTransferRepository scheduledTransferRepository;
    private final RecurringTransferRuleRepository recurringTransferRuleRepository;
    private final TransactionProducer transactionProducer;
    private final JwtService jwtService;
    private final RestTemplate restTemplate;
    private final SecureRandom random = new SecureRandom();

    @Value("${account-service.url:http://localhost:8082}")
    private String accountServiceUrl;

    @Value("${fraud-service.url:http://localhost:8086}")
    private String fraudServiceUrl;

    public TransactionResponse deposit(DepositRequest request, String username, String bearerToken) {
        String currentFingerprint = TransactionIdempotencyHelper.computeFingerprint("DEPOSIT", request.amount(), null, request.toAccountNumber());

        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            Optional<Transaction> existing = transactionRepository
                    .findByIdempotencyKeyAndInitiatedByUsername(request.idempotencyKey(), username);
            if (existing.isPresent()) {
                return TransactionIdempotencyHelper.validateIdempotencyFingerprint(existing.get(), currentFingerprint, request.idempotencyKey());
            }
        }

        InternalAccountResponse toAccount = fetchInternalAccount(request.toAccountNumber());
        TransactionAccountHelper.validateAccountActive(toAccount);

        Transaction transaction = Transaction.builder()
                .transactionRef(generateTransactionRef())
                .type(TransactionType.DEPOSIT)
                .toAccountNumber(request.toAccountNumber())
                .amount(request.amount())
                .status(TransactionStatus.PENDING)
                .idempotencyKey(request.idempotencyKey())
                .requestFingerprint(currentFingerprint)
                .initiatedByUsername(username)
                .build();
        transaction = transactionRepository.save(transaction);

        // Synchronous Fraud Detection Check
        evaluateFraudRisk(transaction, bearerToken);

        try {
            creditAccount(request.toAccountNumber(), request.amount());
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setCompletedAt(LocalDateTime.now());
            Transaction saved = transactionRepository.save(transaction);
            transactionProducer.publishEvent(saved);
            return TransactionMapper.mapToResponse(saved);
        } catch (Exception e) {
            transaction.setStatus(TransactionStatus.FAILED);
            Transaction failed = transactionRepository.save(transaction);
            transactionProducer.publishEvent(failed);
            throw new InvalidTransactionException("Deposit failed: " + e.getMessage());
        }
    }

    public TransactionResponse withdraw(WithdrawRequest request, String username, String bearerToken) {
        String currentFingerprint = TransactionIdempotencyHelper.computeFingerprint("WITHDRAWAL", request.amount(), request.fromAccountNumber(), null);

        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            Optional<Transaction> existing = transactionRepository
                    .findByIdempotencyKeyAndInitiatedByUsername(request.idempotencyKey(), username);
            if (existing.isPresent()) {
                return TransactionIdempotencyHelper.validateIdempotencyFingerprint(existing.get(), currentFingerprint, request.idempotencyKey());
            }
        }

        InternalAccountResponse fromAccount = fetchInternalAccount(request.fromAccountNumber());
        TransactionAccountHelper.validateOwnership(fromAccount, username);
        TransactionAccountHelper.validateAccountActive(fromAccount);

        // Validate Limits BEFORE Fraud Detection & Debit
        validateTransactionLimits(request.fromAccountNumber(), fromAccount.accountType(), request.amount());

        if (fromAccount.balance().compareTo(request.amount()) < 0) {
            throw new InsufficientBalanceException("Insufficient funds. Available: " 
                    + fromAccount.balance() + ", Requested: " + request.amount());
        }

        Transaction transaction = Transaction.builder()
                .transactionRef(generateTransactionRef())
                .type(TransactionType.WITHDRAWAL)
                .fromAccountNumber(request.fromAccountNumber())
                .amount(request.amount())
                .status(TransactionStatus.PENDING)
                .idempotencyKey(request.idempotencyKey())
                .requestFingerprint(currentFingerprint)
                .initiatedByUsername(username)
                .build();
        transaction = transactionRepository.save(transaction);

        // Synchronous Fraud Detection Check
        evaluateFraudRisk(transaction, bearerToken);

        try {
            debitAccount(request.fromAccountNumber(), request.amount());
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setCompletedAt(LocalDateTime.now());
            Transaction saved = transactionRepository.save(transaction);
            transactionProducer.publishEvent(saved);
            return TransactionMapper.mapToResponse(saved);
        } catch (Exception e) {
            transaction.setStatus(TransactionStatus.FAILED);
            Transaction failed = transactionRepository.save(transaction);
            transactionProducer.publishEvent(failed);
            throw new InvalidTransactionException("Withdrawal failed: " + e.getMessage());
        }
    }

    public TransactionResponse transfer(TransferRequest request, String username, String bearerToken) {
        if (request.fromAccountNumber().equalsIgnoreCase(request.toAccountNumber())) {
            throw new InvalidTransactionException("Source and destination account numbers cannot be the same");
        }

        String currentFingerprint = TransactionIdempotencyHelper.computeFingerprint("TRANSFER", request.amount(), request.fromAccountNumber(), request.toAccountNumber());

        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            Optional<Transaction> existing = transactionRepository
                    .findByIdempotencyKeyAndInitiatedByUsername(request.idempotencyKey(), username);
            if (existing.isPresent()) {
                return TransactionIdempotencyHelper.validateIdempotencyFingerprint(existing.get(), currentFingerprint, request.idempotencyKey());
            }
        }

        InternalAccountResponse fromAccount = fetchInternalAccount(request.fromAccountNumber());
        InternalAccountResponse toAccount = fetchInternalAccount(request.toAccountNumber());

        TransactionAccountHelper.validateOwnership(fromAccount, username);
        TransactionAccountHelper.validateAccountActive(fromAccount);
        TransactionAccountHelper.validateAccountActive(toAccount);

        // Validate Limits BEFORE Fraud Detection & Debit
        validateTransactionLimits(request.fromAccountNumber(), fromAccount.accountType(), request.amount());

        if (fromAccount.balance().compareTo(request.amount()) < 0) {
            throw new InsufficientBalanceException("Insufficient funds for transfer. Available: " 
                    + fromAccount.balance() + ", Requested: " + request.amount());
        }

        Transaction transaction = Transaction.builder()
                .transactionRef(generateTransactionRef())
                .type(TransactionType.TRANSFER)
                .fromAccountNumber(request.fromAccountNumber())
                .toAccountNumber(request.toAccountNumber())
                .amount(request.amount())
                .status(TransactionStatus.PENDING)
                .idempotencyKey(request.idempotencyKey())
                .requestFingerprint(currentFingerprint)
                .initiatedByUsername(username)
                .build();
        transaction = transactionRepository.save(transaction);

        // Synchronous Fraud Detection Check
        evaluateFraudRisk(transaction, bearerToken);

        boolean debited = false;
        try {
            debitAccount(request.fromAccountNumber(), request.amount());
            debited = true;

            creditAccount(request.toAccountNumber(), request.amount());

            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setCompletedAt(LocalDateTime.now());
            Transaction saved = transactionRepository.save(transaction);
            transactionProducer.publishEvent(saved);
            return TransactionMapper.mapToResponse(saved);
        } catch (Exception e) {
            log.error("Transfer failed during execution. Debited: {}. Error: {}", debited, e.getMessage());

            if (debited) {
                try {
                    log.warn("Executing compensating rollback: refunding {} to account {}", request.amount(), request.fromAccountNumber());
                    creditAccount(request.fromAccountNumber(), request.amount());
                } catch (Exception rollbackEx) {
                    log.error("CRITICAL: Compensating rollback refund failed for account {}: {}", request.fromAccountNumber(), rollbackEx.getMessage());
                }
            }

            transaction.setStatus(TransactionStatus.FAILED);
            Transaction failed = transactionRepository.save(transaction);
            transactionProducer.publishEvent(failed);
            throw new InvalidTransactionException("Transfer failed: " + e.getMessage());
        }
    }

    private void validateTransactionLimits(String accountNumber, String accountTypeStr, BigDecimal amount) {
        TransactionLimitValidator.validateTransactionLimits(transactionRepository, accountNumber, accountTypeStr, amount);
    }

    @Transactional
    public ScheduledTransferResponse scheduleTransfer(ScheduleTransferRequest request, String username) {
        if (request.fromAccountNumber().equalsIgnoreCase(request.toAccountNumber())) {
            throw new InvalidTransactionException("Source and destination account numbers cannot be the same");
        }
        if (request.scheduledAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTransactionException("Scheduled execution time must be in the future");
        }

        InternalAccountResponse fromAccount = fetchInternalAccount(request.fromAccountNumber());
        TransactionAccountHelper.validateOwnership(fromAccount, username);

        ScheduledTransfer st = ScheduledTransfer.builder()
                .fromAccountNumber(request.fromAccountNumber())
                .toAccountNumber(request.toAccountNumber())
                .amount(request.amount())
                .description(request.description())
                .scheduledAt(request.scheduledAt())
                .status(ScheduledTransferStatus.PENDING)
                .initiatedByUsername(username)
                .build();

        ScheduledTransfer saved = scheduledTransferRepository.save(st);
        return TransactionMapper.mapToScheduledResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ScheduledTransferResponse> getUserScheduledTransfers(String username) {
        return scheduledTransferRepository.findByInitiatedByUsernameOrderByScheduledAtDesc(username).stream()
                .map(TransactionMapper::mapToScheduledResponse)
                .toList();
    }

    @Transactional
    public void cancelScheduledTransfer(Long id, String username) {
        ScheduledTransfer st = scheduledTransferRepository.findById(id)
                .orElseThrow(() -> new TransactionNotFoundException("Scheduled transfer not found with ID: " + id));

        if (!st.getInitiatedByUsername().equalsIgnoreCase(username)) {
            throw new InvalidTransactionException("Access denied: You did not initiate this scheduled transfer");
        }

        st.setStatus(ScheduledTransferStatus.CANCELLED);
        scheduledTransferRepository.save(st);
    }

    @Transactional
    public void processDueScheduledTransfers() {
        ScheduledTransferExecutionHelper.processDueScheduledTransfers(
                scheduledTransferRepository,
                (req, user) -> transfer(req, user, null)
        );
    }

    @Transactional
    public RecurringRuleResponse createRecurringRule(CreateRecurringRuleRequest request, String username) {
        if (request.fromAccountNumber().equalsIgnoreCase(request.toAccountNumber())) {
            throw new InvalidTransactionException("Source and destination account numbers cannot be the same");
        }

        InternalAccountResponse fromAccount = fetchInternalAccount(request.fromAccountNumber());
        TransactionAccountHelper.validateOwnership(fromAccount, username);

        LocalDateTime nextRun = request.startDate().isBefore(LocalDateTime.now()) ? LocalDateTime.now() : request.startDate();

        RecurringTransferRule rule = RecurringTransferRule.builder()
                .fromAccountNumber(request.fromAccountNumber())
                .toAccountNumber(request.toAccountNumber())
                .amount(request.amount())
                .description(request.description())
                .frequency(request.frequency())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .maxOccurrences(request.maxOccurrences())
                .completedOccurrences(0)
                .consecutiveFailures(0)
                .nextRunAt(nextRun)
                .status(RecurringRuleStatus.ACTIVE)
                .initiatedByUsername(username)
                .build();

        RecurringTransferRule saved = recurringTransferRuleRepository.save(rule);
        return TransactionMapper.mapToRecurringResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RecurringRuleResponse> getUserRecurringRules(String username) {
        return recurringTransferRuleRepository.findByInitiatedByUsernameOrderByCreatedAtDesc(username).stream()
                .map(TransactionMapper::mapToRecurringResponse)
                .toList();
    }

    @Transactional
    public void cancelRecurringRule(Long id, String username) {
        RecurringTransferRule rule = recurringTransferRuleRepository.findById(id)
                .orElseThrow(() -> new TransactionNotFoundException("Recurring rule not found with ID: " + id));

        if (!rule.getInitiatedByUsername().equalsIgnoreCase(username)) {
            throw new InvalidTransactionException("Access denied: You did not initiate this recurring rule");
        }

        rule.setStatus(RecurringRuleStatus.CANCELLED);
        recurringTransferRuleRepository.save(rule);
    }

    @Transactional
    public void processDueRecurringRules() {
        ScheduledTransferExecutionHelper.processDueRecurringRules(
                recurringTransferRuleRepository,
                (req, user) -> transfer(req, user, null)
        );
    }

    public TransactionResponse getTransactionById(Long id, String username) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found with ID: " + id));

        if (!transaction.getInitiatedByUsername().equalsIgnoreCase(username)) {
            throw new InvalidTransactionException("Access denied: You did not initiate this transaction");
        }

        return TransactionMapper.mapToResponse(transaction);
    }

    public List<TransactionResponse> getUserTransactionHistory(String username) {
        return transactionRepository.findByInitiatedByUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(TransactionMapper::mapToResponse)
                .toList();
    }

    public List<TransactionResponse> getRecentGlobalTransactions() {
        return transactionRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(TransactionMapper::mapToResponse)
                .toList();
    }

    public List<TransactionResponse> getAccountTransactionHistory(String accountNumber, String username) {
        // Validate ownership: the account must belong to the authenticated user
        InternalAccountResponse account = fetchInternalAccount(accountNumber);
        validateOwnership(account, username);

        return transactionRepository
                .findByFromAccountNumberOrToAccountNumberOrderByCreatedAtDesc(accountNumber, accountNumber)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void evaluateFraudRisk(Transaction transaction, String bearerToken) {
        TransactionFraudHelper.evaluateFraudRisk(
                transaction,
                bearerToken,
                restTemplate,
                fraudServiceUrl,
                jwtService,
                transactionRepository,
                transactionProducer
        );
    }

    private InternalAccountResponse fetchInternalAccount(String accountNumber) {
        return TransactionAccountHelper.fetchInternalAccount(restTemplate, accountServiceUrl, accountNumber);
    }

    private void debitAccount(String accountNumber, BigDecimal amount) {
        TransactionAccountHelper.debitAccount(restTemplate, accountServiceUrl, accountNumber, amount);
    }

    private void creditAccount(String accountNumber, BigDecimal amount) {
        TransactionAccountHelper.creditAccount(restTemplate, accountServiceUrl, accountNumber, amount);
    }

    private String generateTransactionRef() {
        String ref;
        do {
            ref = "TXN-" + System.currentTimeMillis() + "-" + (1000 + random.nextInt(9000));
        } while (transactionRepository.existsByTransactionRef(ref));
        return ref;
    }
}
