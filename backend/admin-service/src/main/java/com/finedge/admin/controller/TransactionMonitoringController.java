package com.finedge.admin.controller;

import com.finedge.admin.entity.Transaction;
import com.finedge.admin.service.TransactionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/transactions")
public class TransactionMonitoringController {

    private final TransactionService transactionService;

    public TransactionMonitoringController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('TRANSACTION_READ')")
    public ResponseEntity<Page<Transaction>> getTransactions(Pageable pageable) {
        return ResponseEntity.ok(transactionService.getTransactions(null, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('TRANSACTION_READ')")
    public ResponseEntity<Transaction> getTransaction(@PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    @PostMapping("/{id}/flag")
    @PreAuthorize("hasAuthority('TRANSACTION_BLOCK') or hasRole('FRAUD_ANALYST')")
    public ResponseEntity<Transaction> flagTransaction(@PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.flagTransaction(id));
    }

    @PostMapping("/{id}/block")
    @PreAuthorize("hasAuthority('TRANSACTION_BLOCK')")
    public ResponseEntity<Transaction> blockTransaction(@PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.blockTransaction(id));
    }
}
