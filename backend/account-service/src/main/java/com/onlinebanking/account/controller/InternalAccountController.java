package com.onlinebanking.account.controller;

import com.onlinebanking.account.dto.AmountRequest;
import com.onlinebanking.account.dto.InternalAccountResponse;
import com.onlinebanking.account.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/accounts/internal")
@RequiredArgsConstructor
public class InternalAccountController {

    private final AccountService accountService;

    @GetMapping("/{accountNumber}")
    public ResponseEntity<InternalAccountResponse> getAccountByNumber(@PathVariable String accountNumber) {
        InternalAccountResponse response = accountService.getInternalAccountByNumber(accountNumber);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{accountNumber}/debit")
    public ResponseEntity<InternalAccountResponse> debitBalance(
            @PathVariable String accountNumber,
            @Valid @RequestBody AmountRequest request) {
        InternalAccountResponse response = accountService.debitBalance(accountNumber, request.amount());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{accountNumber}/credit")
    public ResponseEntity<InternalAccountResponse> creditBalance(
            @PathVariable String accountNumber,
            @Valid @RequestBody AmountRequest request) {
        InternalAccountResponse response = accountService.creditBalance(accountNumber, request.amount());
        return ResponseEntity.ok(response);
    }
}
