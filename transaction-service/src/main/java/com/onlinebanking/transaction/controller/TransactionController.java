package com.onlinebanking.transaction.controller;

import com.onlinebanking.transaction.dto.DepositRequest;
import com.onlinebanking.transaction.dto.TransactionResponse;
import com.onlinebanking.transaction.dto.TransferRequest;
import com.onlinebanking.transaction.dto.WithdrawRequest;
import com.onlinebanking.transaction.service.TransactionService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transactions/deposit")
    public ResponseEntity<TransactionResponse> deposit(
            @Valid @RequestBody DepositRequest request,
            @RequestHeader(value = "Authorization", required = false) String bearerToken,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.deposit(request, username, bearerToken));
    }

    @PostMapping("/transactions/withdraw")
    public ResponseEntity<TransactionResponse> withdraw(
            @Valid @RequestBody WithdrawRequest request,
            @RequestHeader(value = "Authorization", required = false) String bearerToken,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.withdraw(request, username, bearerToken));
    }

    @PostMapping("/transactions/transfer")
    public ResponseEntity<TransactionResponse> transfer(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader(value = "Authorization", required = false) String bearerToken,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.transfer(request, username, bearerToken));
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(transactionService.getTransactionById(id, username));
    }

    @GetMapping("/me/transactions")
    public ResponseEntity<List<TransactionResponse>> getMyTransactions(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(transactionService.getUserTransactionHistory(username));
    }

    @Deprecated
    @GetMapping("/transactions/history")
    public ResponseEntity<List<TransactionResponse>> getTransactionHistory(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(transactionService.getUserTransactionHistory(username));
    }
}
