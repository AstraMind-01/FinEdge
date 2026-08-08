package com.onlinebanking.transaction.repository;

import com.onlinebanking.transaction.entity.Transaction;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByIdempotencyKeyAndInitiatedByUsername(String idempotencyKey, String initiatedByUsername);

    List<Transaction> findByInitiatedByUsernameOrderByCreatedAtDesc(String initiatedByUsername);

    boolean existsByTransactionRef(String transactionRef);
}
