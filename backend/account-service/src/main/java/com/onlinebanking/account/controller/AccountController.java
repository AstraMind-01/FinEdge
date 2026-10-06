package com.onlinebanking.account.controller;

import com.onlinebanking.account.dto.AccountResponse;
import com.onlinebanking.account.dto.AddJointHolderRequest;
import com.onlinebanking.account.dto.AddNomineeRequest;
import com.onlinebanking.account.dto.BalanceResponse;
import com.onlinebanking.account.dto.CreateAccountRequest;
import com.onlinebanking.account.dto.FreezeAccountRequest;
import com.onlinebanking.account.dto.JointHolderResponse;
import com.onlinebanking.account.dto.NomineeResponse;
import com.onlinebanking.account.dto.UpdateAccountStatusRequest;
import com.onlinebanking.account.service.AccountService;
import com.onlinebanking.account.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.DeleteMapping;
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
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody CreateAccountRequest request,
            HttpServletRequest httpRequest,
            Authentication authentication) {
        String username = authentication.getName();
        String kycStatus = extractKycStatusFromRequest(httpRequest);
        AccountResponse response = accountService.createAccount(request, username, kycStatus);
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

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AccountResponse>> getAllAccountsForAdmin() {
        List<AccountResponse> accounts = accountService.getAllAccountsForAdmin();
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

    // --- Step 19: Joint Account Holder Endpoints ---

    @PostMapping("/{id}/joint-holders")
    public ResponseEntity<JointHolderResponse> addJointHolder(
            @PathVariable Long id,
            @Valid @RequestBody AddJointHolderRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        boolean isAdmin = hasAdminRole(authentication);
        JointHolderResponse response = accountService.addJointHolder(id, request, username, isAdmin);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/joint-holders")
    public ResponseEntity<List<JointHolderResponse>> getJointHolders(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        boolean isAdmin = hasAdminRole(authentication);
        List<JointHolderResponse> response = accountService.getJointHolders(id, username, isAdmin);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/joint-holders/{username}")
    public ResponseEntity<Void> removeJointHolder(
            @PathVariable Long id,
            @PathVariable("username") String targetUsername,
            Authentication authentication) {
        String username = authentication.getName();
        boolean isAdmin = hasAdminRole(authentication);
        accountService.removeJointHolder(id, targetUsername, username, isAdmin);
        return ResponseEntity.noContent().build();
    }

    // --- Step 19: Nominee Management Endpoints ---

    @PostMapping("/{id}/nominees")
    public ResponseEntity<NomineeResponse> addNominee(
            @PathVariable Long id,
            @Valid @RequestBody AddNomineeRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        boolean isAdmin = hasAdminRole(authentication);
        NomineeResponse response = accountService.addNominee(id, request, username, isAdmin);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/nominees")
    public ResponseEntity<List<NomineeResponse>> getNominees(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        boolean isAdmin = hasAdminRole(authentication);
        List<NomineeResponse> response = accountService.getNominees(id, username, isAdmin);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/nominees/{nomineeId}")
    public ResponseEntity<Void> removeNominee(
            @PathVariable Long id,
            @PathVariable Long nomineeId,
            Authentication authentication) {
        String username = authentication.getName();
        boolean isAdmin = hasAdminRole(authentication);
        accountService.removeNominee(id, nomineeId, username, isAdmin);
        return ResponseEntity.noContent().build();
    }

    // --- Step 19: Dedicated Freeze / Unfreeze & Closure Endpoints ---

    @PostMapping("/{id}/freeze")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountResponse> freezeAccount(
            @PathVariable Long id,
            @Valid @RequestBody FreezeAccountRequest request,
            Authentication authentication) {
        String adminUsername = authentication.getName();
        AccountResponse response = accountService.freezeAccount(id, request, adminUsername);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/unfreeze")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountResponse> unfreezeAccount(
            @PathVariable Long id,
            Authentication authentication) {
        String adminUsername = authentication.getName();
        AccountResponse response = accountService.unfreezeAccount(id, adminUsername);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<AccountResponse> closeAccount(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        boolean isAdmin = hasAdminRole(authentication);
        AccountResponse response = accountService.closeAccount(id, username, isAdmin);
        return ResponseEntity.ok(response);
    }

    private String extractKycStatusFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            return jwtService.extractKycStatus(jwt);
        }
        return "NOT_SUBMITTED";
    }

    private boolean hasAdminRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));
    }
}
