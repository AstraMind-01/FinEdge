package com.onlinebanking.account;

import com.onlinebanking.account.dto.AccountResponse;
import com.onlinebanking.account.dto.AddJointHolderRequest;
import com.onlinebanking.account.dto.AddNomineeRequest;
import com.onlinebanking.account.dto.CreateAccountRequest;
import com.onlinebanking.account.dto.InternalAccountResponse;
import com.onlinebanking.account.dto.JointHolderResponse;
import com.onlinebanking.account.dto.NomineeResponse;
import com.onlinebanking.account.entity.Account;
import com.onlinebanking.account.entity.AccountStatus;
import com.onlinebanking.account.entity.AccountType;
import com.onlinebanking.account.entity.JointAccountHolder;
import com.onlinebanking.account.entity.Nominee;
import com.onlinebanking.account.entity.NomineeRelationship;
import com.onlinebanking.account.exception.KycNotVerifiedException;
import com.onlinebanking.account.exception.UnauthorizedAccessException;
import com.onlinebanking.account.repository.AccountRepository;
import com.onlinebanking.account.repository.JointAccountHolderRepository;
import com.onlinebanking.account.repository.NomineeRepository;
import com.onlinebanking.account.service.AccountService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private JointAccountHolderRepository jointAccountHolderRepository;

    @Mock
    private NomineeRepository nomineeRepository;

    @InjectMocks
    private AccountService accountService;

    private Account sampleAccount;

    @BeforeEach
    void setUp() {
        sampleAccount = Account.builder()
                .id(1L)
                .accountNumber("1012345678")
                .ownerUsername("alice")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00"))
                .status(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Create Account: Success path when KYC status is VERIFIED")
    void createAccount_Success() {
        CreateAccountRequest req = new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("500.00"));
        when(accountRepository.existsByAccountNumber(any())).thenReturn(false);
        when(accountRepository.save(any(Account.class))).thenReturn(sampleAccount);

        AccountResponse resp = accountService.createAccount(req, "alice", "VERIFIED");

        assertNotNull(resp);
        assertEquals("alice", resp.ownerUsername());
        verify(accountRepository, times(1)).save(any(Account.class));
    }

    @Test
    @DisplayName("Create Account: Unverified KYC throws KycNotVerifiedException (403)")
    void createAccount_UnverifiedKyc_ThrowsException() {
        CreateAccountRequest req = new CreateAccountRequest(AccountType.SAVINGS, new BigDecimal("500.00"));

        assertThrows(KycNotVerifiedException.class, () ->
                accountService.createAccount(req, "alice", "NOT_SUBMITTED")
        );
        verify(accountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Get Account: Owner access succeeds")
    void getAccountById_Owner_Success() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(sampleAccount));

        AccountResponse resp = accountService.getAccountById(1L, "alice", false);

        assertNotNull(resp);
        assertEquals("1012345678", resp.accountNumber());
    }

    @Test
    @DisplayName("Get Account: Non-owner non-joint user access throws UnauthorizedAccessException (403)")
    void getAccountById_NonOwner_ThrowsUnauthorized() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(sampleAccount));
        when(jointAccountHolderRepository.existsByAccountIdAndUsername(1L, "bob")).thenReturn(false);

        assertThrows(UnauthorizedAccessException.class, () ->
                accountService.getAccountById(1L, "bob", false)
        );
    }

    @Test
    @DisplayName("Get Account: Joint holder access succeeds")
    void getAccountById_JointHolder_Success() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(sampleAccount));
        when(jointAccountHolderRepository.existsByAccountIdAndUsername(1L, "bob")).thenReturn(true);

        AccountResponse resp = accountService.getAccountById(1L, "bob", false);

        assertNotNull(resp);
        assertEquals("1012345678", resp.accountNumber());
    }

    @Test
    @DisplayName("Joint Holder: Add joint holder succeeds for primary owner")
    void addJointHolder_Success() {
        AddJointHolderRequest req = new AddJointHolderRequest("bob");
        when(accountRepository.findById(1L)).thenReturn(Optional.of(sampleAccount));
        when(jointAccountHolderRepository.existsByAccountIdAndUsername(1L, "bob")).thenReturn(false);
        when(jointAccountHolderRepository.save(any())).thenAnswer(i -> {
            JointAccountHolder j = i.getArgument(0);
            j.setId(5L);
            return j;
        });

        JointHolderResponse resp = accountService.addJointHolder(1L, req, "alice", false);

        assertNotNull(resp);
        assertEquals("bob", resp.username());
    }

    @Test
    @DisplayName("Nominee: Adding nominee exceeding 100% total share throws IllegalArgumentException")
    void addNominee_Exceeding100Percent_ThrowsException() {
        Nominee existing = Nominee.builder()
                .id(1L)
                .sharePercentage(new BigDecimal("70.00"))
                .build();

        when(accountRepository.findById(1L)).thenReturn(Optional.of(sampleAccount));
        when(nomineeRepository.findByAccountId(1L)).thenReturn(List.of(existing));

        AddNomineeRequest req = new AddNomineeRequest("Bob Son", NomineeRelationship.CHILD, "9876543210", new BigDecimal("40.00"));

        assertThrows(IllegalArgumentException.class, () ->
                accountService.addNominee(1L, req, "alice", false)
        );
    }

    @Test
    @DisplayName("Account Closure: Reject closure if balance > 0")
    void closeAccount_NonZeroBalance_ThrowsException() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(sampleAccount));

        assertThrows(IllegalStateException.class, () ->
                accountService.closeAccount(1L, "alice", false)
        );
    }

    @Test
    @DisplayName("Account Closure: Zero balance allows closure")
    void closeAccount_ZeroBalance_Success() {
        sampleAccount.setBalance(BigDecimal.ZERO);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(sampleAccount));
        when(accountRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AccountResponse resp = accountService.closeAccount(1L, "alice", false);

        assertNotNull(resp);
        assertEquals(AccountStatus.CLOSED, resp.status());
    }

    @Test
    @DisplayName("Debit Balance: Closed account rejects internal debit")
    void debitBalance_ClosedAccount_ThrowsException() {
        sampleAccount.setStatus(AccountStatus.CLOSED);
        when(accountRepository.findByAccountNumber("1012345678")).thenReturn(Optional.of(sampleAccount));

        assertThrows(IllegalStateException.class, () ->
                accountService.debitBalance("1012345678", new BigDecimal("100.00"))
        );
    }
}
