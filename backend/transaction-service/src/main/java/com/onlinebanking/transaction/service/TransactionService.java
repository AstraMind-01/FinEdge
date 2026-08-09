package com.onlinebanking.transaction.service;

import com.onlinebanking.transaction.dto.AmountRequest;
import com.onlinebanking.transaction.dto.DepositRequest;
import com.onlinebanking.transaction.dto.FraudCheckRequest;
import com.onlinebanking.transaction.dto.FraudCheckResponse;
import com.onlinebanking.transaction.dto.InternalAccountResponse;
import com.onlinebanking.transaction.dto.TransactionResponse;
import com.onlinebanking.transaction.dto.TransferRequest;
import com.onlinebanking.transaction.dto.WithdrawRequest;
import com.onlinebanking.transaction.entity.Transaction;
import com.onlinebanking.transaction.entity.TransactionStatus;
import com.onlinebanking.transaction.entity.TransactionType;
import com.onlinebanking.transaction.event.TransactionProducer;
import com.onlinebanking.transaction.exception.AccountInactiveException;
import com.onlinebanking.transaction.exception.FraudBlockedException;
import com.onlinebanking.transaction.exception.FraudServiceUnavailableException;
import com.onlinebanking.transaction.exception.IdempotencyConflictException;
import com.onlinebanking.transaction.exception.InsufficientBalanceException;
import com.onlinebanking.transaction.exception.InvalidTransactionException;
import com.onlinebanking.transaction.exception.TransactionNotFoundException;
import com.onlinebanking.transaction.repository.TransactionRepository;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final TransactionRepository transactionRepository;
    private final TransactionProducer transactionProducer;
    private final RestTemplate restTemplate;
    private final SecureRandom random = new SecureRandom();

    @Value("${account-service.url:http://localhost:8082}")
    private String accountServiceUrl;

    @Value("${fraud-service.url:http://localhost:8086}")
    private String fraudServiceUrl;

    public TransactionResponse deposit(DepositRequest request, String username, String bearerToken) {
        String currentFingerprint = computeFingerprint("DEPOSIT", request.amount(), null, request.toAccountNumber());

        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            Optional<Transaction> existing = transactionRepository
                    .findByIdempotencyKeyAndInitiatedByUsername(request.idempotencyKey(), username);
            if (existing.isPresent()) {
                return validateIdempotencyFingerprint(existing.get(), currentFingerprint, request.idempotencyKey());
            }
        }

        InternalAccountResponse toAccount = fetchInternalAccount(request.toAccountNumber());
        validateAccountActive(toAccount);

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
            return mapToResponse(saved);
        } catch (Exception e) {
            transaction.setStatus(TransactionStatus.FAILED);
            Transaction failed = transactionRepository.save(transaction);
            transactionProducer.publishEvent(failed);
            throw new InvalidTransactionException("Deposit failed: " + e.getMessage());
        }
    }

    public TransactionResponse withdraw(WithdrawRequest request, String username, String bearerToken) {
        String currentFingerprint = computeFingerprint("WITHDRAWAL", request.amount(), request.fromAccountNumber(), null);

        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            Optional<Transaction> existing = transactionRepository
                    .findByIdempotencyKeyAndInitiatedByUsername(request.idempotencyKey(), username);
            if (existing.isPresent()) {
                return validateIdempotencyFingerprint(existing.get(), currentFingerprint, request.idempotencyKey());
            }
        }

        InternalAccountResponse fromAccount = fetchInternalAccount(request.fromAccountNumber());
        validateOwnership(fromAccount, username);
        validateAccountActive(fromAccount);

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
            return mapToResponse(saved);
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

        String currentFingerprint = computeFingerprint("TRANSFER", request.amount(), request.fromAccountNumber(), request.toAccountNumber());

        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            Optional<Transaction> existing = transactionRepository
                    .findByIdempotencyKeyAndInitiatedByUsername(request.idempotencyKey(), username);
            if (existing.isPresent()) {
                return validateIdempotencyFingerprint(existing.get(), currentFingerprint, request.idempotencyKey());
            }
        }

        InternalAccountResponse fromAccount = fetchInternalAccount(request.fromAccountNumber());
        InternalAccountResponse toAccount = fetchInternalAccount(request.toAccountNumber());

        validateOwnership(fromAccount, username);
        validateAccountActive(fromAccount);
        validateAccountActive(toAccount);

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
            return mapToResponse(saved);
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

    public TransactionResponse getTransactionById(Long id, String username) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found with ID: " + id));

        if (!transaction.getInitiatedByUsername().equalsIgnoreCase(username)) {
            throw new InvalidTransactionException("Access denied: You did not initiate this transaction");
        }

        return mapToResponse(transaction);
    }

    public List<TransactionResponse> getUserTransactionHistory(String username) {
        return transactionRepository.findByInitiatedByUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(this::mapToResponse)
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
        FraudCheckResponse response = checkFraudRisk(transaction, bearerToken);

        transaction.setRiskScore(response.riskScore());
        transaction.setRiskDecision(response.decision());
        transaction.setRiskIndicators(response.indicators() != null ? String.join(", ", response.indicators()) : "");
        transaction.setFraudCheckedAt(LocalDateTime.now());

        if ("HIGH_RISK".equalsIgnoreCase(response.decision())) {
            log.warn("BLOCKING TRANSACTION [{}]: High risk fraud decision (Score: {})",
                    transaction.getTransactionRef(), response.riskScore());
            transaction.setStatus(TransactionStatus.FAILED);
            Transaction failed = transactionRepository.save(transaction);
            transactionProducer.publishEvent(failed);
            throw new FraudBlockedException("Transaction blocked: High risk fraud detected (Risk Score: " + response.riskScore() + ")");
        }

        if ("REVIEW".equalsIgnoreCase(response.decision())) {
            log.warn("FLAGGING TRANSACTION [{}] FOR MANUAL REVIEW (Risk Score: {})",
                    transaction.getTransactionRef(), response.riskScore());
        }

        transactionRepository.save(transaction);
    }

    private FraudCheckResponse checkFraudRisk(Transaction transaction, String bearerToken) {
        try {
            String url = fraudServiceUrl + "/api/v1/fraud/check";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (bearerToken != null && !bearerToken.isBlank()) {
                headers.set("Authorization", bearerToken.startsWith("Bearer ") ? bearerToken : "Bearer " + bearerToken);
            }

            FraudCheckRequest payload = new FraudCheckRequest(
                    transaction.getTransactionRef(),
                    transaction.getType().name(),
                    transaction.getFromAccountNumber(),
                    transaction.getToAccountNumber(),
                    transaction.getAmount(),
                    transaction.getInitiatedByUsername(),
                    transaction.getCreatedAt().toString()
            );

            HttpEntity<FraudCheckRequest> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<FraudCheckResponse> response = restTemplate.postForEntity(url, entity, FraudCheckResponse.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Fail-Closed Policy: Fraud detection service unreachable or timed out for transaction [{}]: {}",
                    transaction.getTransactionRef(), e.getMessage());
            throw new FraudServiceUnavailableException("Transaction failed: Fraud detection service is unavailable or timed out.");
        }
    }

    private TransactionResponse validateIdempotencyFingerprint(Transaction existing, String currentFingerprint, String idempotencyKey) {
        if (currentFingerprint.equals(existing.getRequestFingerprint())) {
            log.info("Idempotency match found for key: {}. Returning original response.", idempotencyKey);
            return mapToResponse(existing);
        } else {
            log.warn("IDEMPOTENCY_CONFLICT: Key [{}] presented with mismatching request payload.", idempotencyKey);
            throw new IdempotencyConflictException("IDEMPOTENCY_CONFLICT: Idempotency key '" + idempotencyKey 
                    + "' was previously used with different request parameters.");
        }
    }

    private String computeFingerprint(String type, BigDecimal amount, String fromAcc, String toAcc) {
        String raw = String.format("TYPE=%s|AMT=%s|FROM=%s|TO=%s",
                type,
                amount != null ? amount.stripTrailingZeros().toPlainString() : "NULL",
                fromAcc != null ? fromAcc : "NULL",
                toAcc != null ? toAcc : "NULL");
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return raw;
        }
    }

    private InternalAccountResponse fetchInternalAccount(String accountNumber) {
        try {
            String url = accountServiceUrl + "/api/v1/accounts/internal/" + accountNumber;
            ResponseEntity<InternalAccountResponse> response = restTemplate.getForEntity(url, InternalAccountResponse.class);
            return response.getBody();
        } catch (Exception e) {
            throw new InvalidTransactionException("Account not found or inaccessible: " + accountNumber);
        }
    }

    private void debitAccount(String accountNumber, BigDecimal amount) {
        String url = accountServiceUrl + "/api/v1/accounts/internal/" + accountNumber + "/debit";
        restTemplate.postForEntity(url, new AmountRequest(amount), InternalAccountResponse.class);
    }

    private void creditAccount(String accountNumber, BigDecimal amount) {
        String url = accountServiceUrl + "/api/v1/accounts/internal/" + accountNumber + "/credit";
        restTemplate.postForEntity(url, new AmountRequest(amount), InternalAccountResponse.class);
    }

    private void validateOwnership(InternalAccountResponse account, String username) {
        if (!account.ownerUsername().equalsIgnoreCase(username)) {
            throw new InvalidTransactionException("Access denied: You do not own account " + account.accountNumber());
        }
    }

    private void validateAccountActive(InternalAccountResponse account) {
        if (!"ACTIVE".equalsIgnoreCase(account.status())) {
            throw new AccountInactiveException("Account " + account.accountNumber() + " is currently " + account.status());
        }
    }

    private String generateTransactionRef() {
        String ref;
        do {
            ref = "TXN-" + System.currentTimeMillis() + "-" + (1000 + random.nextInt(9000));
        } while (transactionRepository.existsByTransactionRef(ref));
        return ref;
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getTransactionRef(),
                t.getType(),
                t.getFromAccountNumber(),
                t.getToAccountNumber(),
                t.getAmount(),
                t.getStatus(),
                t.getInitiatedByUsername(),
                t.getCreatedAt(),
                t.getCompletedAt()
        );
    }
}
