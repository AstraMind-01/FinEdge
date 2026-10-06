package com.onlinebanking.account.service;

import com.onlinebanking.account.dto.AccountResponse;
import com.onlinebanking.account.dto.AddJointHolderRequest;
import com.onlinebanking.account.dto.AddNomineeRequest;
import com.onlinebanking.account.dto.BalanceResponse;
import com.onlinebanking.account.dto.CreateAccountRequest;
import com.onlinebanking.account.dto.FreezeAccountRequest;
import com.onlinebanking.account.dto.InternalAccountResponse;
import com.onlinebanking.account.dto.JointHolderResponse;
import com.onlinebanking.account.dto.NomineeResponse;
import com.onlinebanking.account.dto.UpdateAccountStatusRequest;
import com.onlinebanking.account.entity.Account;
import com.onlinebanking.account.entity.AccountStatus;
import com.onlinebanking.account.entity.JointAccountHolder;
import com.onlinebanking.account.entity.Nominee;
import com.onlinebanking.account.exception.AccountNotFoundException;
import com.onlinebanking.account.exception.KycNotVerifiedException;
import com.onlinebanking.account.exception.UnauthorizedAccessException;
import com.onlinebanking.account.repository.AccountRepository;
import com.onlinebanking.account.repository.JointAccountHolderRepository;
import com.onlinebanking.account.repository.NomineeRepository;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final JointAccountHolderRepository jointAccountHolderRepository;
    private final NomineeRepository nomineeRepository;
    private final SecureRandom random = new SecureRandom();

    public AccountResponse createAccount(CreateAccountRequest request, String ownerUsername) {
        return createAccount(request, ownerUsername, "VERIFIED");
    }

    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request, String ownerUsername, String kycStatus) {
        // Enforce Step 18 KYC Gate
        if (kycStatus == null || !kycStatus.equalsIgnoreCase("VERIFIED")) {
            throw new KycNotVerifiedException(
                    "Account creation requires a VERIFIED KYC status. Current status: " + (kycStatus != null ? kycStatus : "NOT_SUBMITTED")
            );
        }

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

    @Transactional(readOnly = true)
    public AccountResponse getAccountById(Long id, String authenticatedUsername, boolean isAdmin) {
        Account account = accountRepository.findById(id)
                .orElseGet(() -> accountRepository.findByAccountNumber(String.valueOf(id))
                        .orElseThrow(() -> new AccountNotFoundException("Account not found with ID or Account Number: " + id)));

        validateOwnershipOrJointAccess(account, authenticatedUsername, isAdmin);
        return mapToResponse(account);
    }

    @Transactional(readOnly = true)
    public BalanceResponse getAccountBalance(Long id, String authenticatedUsername, boolean isAdmin) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + id));

        validateOwnershipOrJointAccess(account, authenticatedUsername, isAdmin);
        return new BalanceResponse(account.getAccountNumber(), account.getBalance());
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getUserAccounts(String username) {
        List<Account> primaryAccounts = accountRepository.findByOwnerUsername(username);

        List<JointAccountHolder> jointHoldings = jointAccountHolderRepository.findByUsername(username);
        List<Account> jointAccounts = jointHoldings.stream().map(JointAccountHolder::getAccount).toList();

        List<Account> combined = new ArrayList<>(primaryAccounts);
        for (Account ja : jointAccounts) {
            if (combined.stream().noneMatch(a -> a.getId().equals(ja.getId()))) {
                combined.add(ja);
            }
        }

        return combined.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAllAccountsForAdmin() {
        return accountRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public AccountResponse updateAccountStatus(Long id, UpdateAccountStatusRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + id));

        account.setStatus(request.status());
        Account updated = accountRepository.save(account);
        return mapToResponse(updated);
    }

    // --- Step 19: Joint Account Holder Operations ---

    @Transactional
    public JointHolderResponse addJointHolder(Long accountId, AddJointHolderRequest request, String authenticatedUsername, boolean isAdmin) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        validatePrimaryOwner(account, authenticatedUsername, isAdmin);

        String jointUser = request.jointUsername().trim();

        if (jointUser.equalsIgnoreCase(account.getOwnerUsername())) {
            throw new IllegalArgumentException("Cannot add the primary account owner as a joint holder.");
        }

        if (jointAccountHolderRepository.existsByAccountIdAndUsername(accountId, jointUser)) {
            throw new IllegalArgumentException("User '" + jointUser + "' is already a joint holder on this account.");
        }

        JointAccountHolder jointHolder = JointAccountHolder.builder()
                .account(account)
                .username(jointUser)
                .build();

        JointAccountHolder saved = jointAccountHolderRepository.save(jointHolder);
        return new JointHolderResponse(saved.getId(), account.getId(), saved.getUsername(), saved.getAddedAt());
    }

    @Transactional(readOnly = true)
    public List<JointHolderResponse> getJointHolders(Long accountId, String authenticatedUsername, boolean isAdmin) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        validateOwnershipOrJointAccess(account, authenticatedUsername, isAdmin);

        return jointAccountHolderRepository.findByAccountId(accountId).stream()
                .map(j -> new JointHolderResponse(j.getId(), account.getId(), j.getUsername(), j.getAddedAt()))
                .toList();
    }

    @Transactional
    public void removeJointHolder(Long accountId, String jointUsername, String authenticatedUsername, boolean isAdmin) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        // RESTRICTION: Only PRIMARY owner or ADMIN can remove joint holders
        validatePrimaryOwner(account, authenticatedUsername, isAdmin);

        if (!jointAccountHolderRepository.existsByAccountIdAndUsername(accountId, jointUsername)) {
            throw new IllegalArgumentException("User '" + jointUsername + "' is not a joint holder on account ID " + accountId);
        }

        jointAccountHolderRepository.deleteByAccountIdAndUsername(accountId, jointUsername);
    }

    // --- Step 19: Nominee Management Operations ---

    @Transactional
    public NomineeResponse addNominee(Long accountId, AddNomineeRequest request, String authenticatedUsername, boolean isAdmin) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        validatePrimaryOwner(account, authenticatedUsername, isAdmin);

        List<Nominee> existingNominees = nomineeRepository.findByAccountId(accountId);
        BigDecimal currentSum = existingNominees.stream()
                .map(Nominee::getSharePercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal newSum = currentSum.add(request.sharePercentage());
        if (newSum.compareTo(new BigDecimal("100.00")) > 0) {
            throw new IllegalArgumentException(
                    "Total nominee share percentage cannot exceed 100.00%. Current allocated: " + currentSum + "%, requested: " + request.sharePercentage() + "%"
            );
        }

        Nominee nominee = Nominee.builder()
                .account(account)
                .nomineeName(request.nomineeName())
                .relationship(request.relationship())
                .phoneNumber(request.phoneNumber())
                .sharePercentage(request.sharePercentage())
                .build();

        Nominee saved = nomineeRepository.save(nominee);
        return new NomineeResponse(
                saved.getId(), account.getId(), saved.getNomineeName(),
                saved.getRelationship(), saved.getPhoneNumber(), saved.getSharePercentage(), saved.getAddedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<NomineeResponse> getNominees(Long accountId, String authenticatedUsername, boolean isAdmin) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        validateOwnershipOrJointAccess(account, authenticatedUsername, isAdmin);

        return nomineeRepository.findByAccountId(accountId).stream()
                .map(n -> new NomineeResponse(n.getId(), account.getId(), n.getNomineeName(), n.getRelationship(), n.getPhoneNumber(), n.getSharePercentage(), n.getAddedAt()))
                .toList();
    }

    @Transactional
    public void removeNominee(Long accountId, Long nomineeId, String authenticatedUsername, boolean isAdmin) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        validatePrimaryOwner(account, authenticatedUsername, isAdmin);

        Nominee nominee = nomineeRepository.findById(nomineeId)
                .orElseThrow(() -> new IllegalArgumentException("Nominee not found with ID: " + nomineeId));

        if (!nominee.getAccount().getId().equals(accountId)) {
            throw new IllegalArgumentException("Nominee ID " + nomineeId + " does not belong to account ID " + accountId);
        }

        nomineeRepository.delete(nominee);
    }

    // --- Step 19: Freeze, Unfreeze, and Account Closure Operations ---

    @Transactional
    public AccountResponse freezeAccount(Long id, FreezeAccountRequest request, String adminUsername) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + id));

        account.setStatus(AccountStatus.FROZEN);
        account.setFrozenReason(request.reason());
        account.setFrozenAt(LocalDateTime.now());
        account.setFrozenBy(adminUsername);

        Account saved = accountRepository.save(account);
        return mapToResponse(saved);
    }

    @Transactional
    public AccountResponse unfreezeAccount(Long id, String adminUsername) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + id));

        account.setStatus(AccountStatus.ACTIVE);
        account.setFrozenReason(null);
        account.setFrozenAt(null);
        account.setFrozenBy(null);

        Account saved = accountRepository.save(account);
        return mapToResponse(saved);
    }

    @Transactional
    public AccountResponse closeAccount(Long id, String authenticatedUsername, boolean isAdmin) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + id));

        validatePrimaryOwner(account, authenticatedUsername, isAdmin);

        if (account.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            throw new IllegalStateException(
                    "Cannot close account with non-zero balance ($" + account.getBalance() + "). Please withdraw or transfer remaining funds first."
            );
        }

        account.setStatus(AccountStatus.CLOSED);
        account.setClosedAt(LocalDateTime.now());

        Account saved = accountRepository.save(account);
        return mapToResponse(saved);
    }

    // --- Internal Methods for transaction-service Integration ---

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

    @Transactional
    public InternalAccountResponse debitBalance(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with number: " + accountNumber));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Cannot debit account in status " + account.getStatus() + " for account number: " + accountNumber);
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

    @Transactional
    public InternalAccountResponse creditBalance(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with number: " + accountNumber));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Cannot credit account in status " + account.getStatus() + " for account number: " + accountNumber);
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

    private void validatePrimaryOwner(Account account, String authenticatedUsername, boolean isAdmin) {
        if (!isAdmin && !account.getOwnerUsername().equalsIgnoreCase(authenticatedUsername)) {
            throw new UnauthorizedAccessException("Access denied: Only primary account owner can perform this action.");
        }
    }

    private void validateOwnershipOrJointAccess(Account account, String authenticatedUsername, boolean isAdmin) {
        if (isAdmin || account.getOwnerUsername().equalsIgnoreCase(authenticatedUsername)) {
            return;
        }
        boolean isJoint = jointAccountHolderRepository.existsByAccountIdAndUsername(account.getId(), authenticatedUsername);
        if (!isJoint) {
            throw new UnauthorizedAccessException("Access denied: You are neither the primary owner nor a joint holder of account ID " + account.getId());
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
