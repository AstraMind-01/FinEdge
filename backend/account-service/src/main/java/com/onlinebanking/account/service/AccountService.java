package com.onlinebanking.account.service;

import com.onlinebanking.account.dto.AccountResponse;
import com.onlinebanking.account.dto.BalanceResponse;
import com.onlinebanking.account.dto.CreateAccountRequest;
import com.onlinebanking.account.dto.InternalAccountResponse;
import com.onlinebanking.account.dto.LimitsResponse;
import com.onlinebanking.account.dto.UpdateAccountStatusRequest;
import com.onlinebanking.account.entity.Account;
import com.onlinebanking.account.entity.AccountStatus;
import com.onlinebanking.account.exception.AccountNotFoundException;
import com.onlinebanking.account.exception.UnauthorizedAccessException;
import com.onlinebanking.account.repository.AccountRepository;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final SecureRandom random = new SecureRandom();

    public AccountResponse createAccount(CreateAccountRequest request, String ownerUsername) {
        String accountNumber = generateUniqueAccountNumber();

        Account account = Account.builder()
                .accountNumber(accountNumber)
                .ownerUsername(ownerUsername)
                .accountType(request.accountType())
                .balance(request.initialDeposit())
                .status(AccountStatus.ACTIVE)
                .build();

        Account saved = accountRepository.save(account);
        return mapToResponse(saved);
    }

    public AccountResponse getAccountById(Long id, String authenticatedUsername, boolean isAdmin) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + id));

        validateOwnership(account, authenticatedUsername, isAdmin);
        return mapToResponse(account);
    }

    public BalanceResponse getAccountBalance(Long id, String authenticatedUsername, boolean isAdmin) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + id));

        validateOwnership(account, authenticatedUsername, isAdmin);
        return new BalanceResponse(account.getAccountNumber(), account.getBalance());
    }

    public List<AccountResponse> getUserAccounts(String ownerUsername) {
        return accountRepository.findByOwnerUsername(ownerUsername)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public AccountResponse updateAccountStatus(Long id, UpdateAccountStatusRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + id));

        account.setStatus(request.status());
        Account updated = accountRepository.save(account);
        return mapToResponse(updated);
    }

    public AccountResponse freezeAccount(Long id, String authenticatedUsername) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + id));
        validateOwnership(account, authenticatedUsername, false);

        if (account.getStatus() == AccountStatus.FROZEN) {
            return mapToResponse(account); // idempotent
        }
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE accounts can be frozen. Current status: " + account.getStatus());
        }

        account.setStatus(AccountStatus.FROZEN);
        Account updated = accountRepository.save(account);
        return mapToResponse(updated);
    }

    public AccountResponse unfreezeAccount(Long id, String authenticatedUsername) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + id));
        validateOwnership(account, authenticatedUsername, false);

        if (account.getStatus() == AccountStatus.ACTIVE) {
            return mapToResponse(account); // idempotent
        }
        if (account.getStatus() != AccountStatus.FROZEN) {
            throw new IllegalStateException("Only FROZEN accounts can be unfrozen. Current status: " + account.getStatus());
        }

        account.setStatus(AccountStatus.ACTIVE);
        Account updated = accountRepository.save(account);
        return mapToResponse(updated);
    }

    public LimitsResponse getAccountLimits(Long id, String authenticatedUsername) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + id));
        validateOwnership(account, authenticatedUsername, false);

        return switch (account.getAccountType()) {
            case SAVINGS -> new LimitsResponse(
                    "SAVINGS",
                    new BigDecimal("200000.00"),
                    new BigDecimal("50000.00"),
                    new BigDecimal("200000.00")
            );
            case CURRENT -> new LimitsResponse(
                    "CURRENT",
                    new BigDecimal("500000.00"),
                    new BigDecimal("200000.00"),
                    new BigDecimal("500000.00")
            );
        };
    }

    // --- Minimal Additive Internal Methods for Step 5 ---

    public InternalAccountResponse getInternalAccountByNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with number: " + accountNumber));
        return new InternalAccountResponse(
                account.getAccountNumber(),
                account.getOwnerUsername(),
                account.getAccountType(),
                account.getBalance(),
                account.getStatus()
        );
    }

    public InternalAccountResponse debitBalance(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with number: " + accountNumber));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Cannot debit inactive or frozen account: " + accountNumber);
        }
        if (account.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient funds in account: " + accountNumber);
        }

        account.setBalance(account.getBalance().subtract(amount));
        Account saved = accountRepository.save(account);
        return new InternalAccountResponse(
                saved.getAccountNumber(),
                saved.getOwnerUsername(),
                saved.getAccountType(),
                saved.getBalance(),
                saved.getStatus()
        );
    }

    public InternalAccountResponse creditBalance(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with number: " + accountNumber));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Cannot credit inactive or frozen account: " + accountNumber);
        }

        account.setBalance(account.getBalance().add(amount));
        Account saved = accountRepository.save(account);
        return new InternalAccountResponse(
                saved.getAccountNumber(),
                saved.getOwnerUsername(),
                saved.getAccountType(),
                saved.getBalance(),
                saved.getStatus()
        );
    }

    private void validateOwnership(Account account, String authenticatedUsername, boolean isAdmin) {
        if (!isAdmin && !account.getOwnerUsername().equalsIgnoreCase(authenticatedUsername)) {
            throw new UnauthorizedAccessException("Access denied: You do not own account ID " + account.getId());
        }
    }

    private String generateUniqueAccountNumber() {
        String accountNumber;
        do {
            long suffix = 10000000L + random.nextInt(90000000);
            accountNumber = "10" + suffix;
        } while (accountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }

    private AccountResponse mapToResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getAccountNumber(),
                account.getOwnerUsername(),
                account.getAccountType(),
                account.getBalance(),
                account.getStatus(),
                account.getCreatedAt()
        );
    }
}
