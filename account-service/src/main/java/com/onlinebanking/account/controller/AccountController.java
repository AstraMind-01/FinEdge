package com.onlinebanking.account.controller;

import com.onlinebanking.account.dto.AccountResponse;
import com.onlinebanking.account.dto.BalanceResponse;
import com.onlinebanking.account.dto.CreateAccountRequest;
import com.onlinebanking.account.dto.UpdateAccountStatusRequest;
import com.onlinebanking.account.service.AccountService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody CreateAccountRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        AccountResponse response = accountService.createAccount(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccountById(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        boolean isAdmin = hasAdminRole(authentication);
        AccountResponse response = accountService.getAccountById(id, username, isAdmin);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/balance")
    public ResponseEntity<BalanceResponse> getAccountBalance(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        boolean isAdmin = hasAdminRole(authentication);
        BalanceResponse response = accountService.getAccountBalance(id, username, isAdmin);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getUserAccounts(Authentication authentication) {
        String username = authentication.getName();
        List<AccountResponse> accounts = accountService.getUserAccounts(username);
        return ResponseEntity.ok(accounts);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountResponse> updateAccountStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAccountStatusRequest request) {
        AccountResponse response = accountService.updateAccountStatus(id, request);
        return ResponseEntity.ok(response);
    }

    private boolean hasAdminRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));
    }
}
