package com.finedge.admin.service;

import com.finedge.admin.entity.Transaction;
import com.finedge.admin.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public Page<Transaction> getTransactions(Specification<Transaction> spec, Pageable pageable) {
        return transactionRepository.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public Transaction getTransactionById(UUID id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
    }

    @Transactional
    public Transaction flagTransaction(UUID id) {
        Transaction transaction = getTransactionById(id);
        transaction.setStatus("FLAGGED");
        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction blockTransaction(UUID id) {
        Transaction transaction = getTransactionById(id);
        // Requires dual approval check in a real scenario
        transaction.setStatus("BLOCKED");
        return transactionRepository.save(transaction);
    }
}
