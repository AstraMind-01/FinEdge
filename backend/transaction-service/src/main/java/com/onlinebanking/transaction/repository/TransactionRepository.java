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

    List<Transaction> findTop10ByOrderByCreatedAtDesc();

    boolean existsByTransactionRef(String transactionRef);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.fromAccountNumber = :fromAccountNumber AND t.status IN (com.onlinebanking.transaction.entity.TransactionStatus.SUCCESS, com.onlinebanking.transaction.entity.TransactionStatus.PENDING) AND t.createdAt >= :startOfDay AND t.createdAt <= :endOfDay")
    java.math.BigDecimal calculateDailyOutgoingTotal(@org.springframework.data.repository.query.Param("fromAccountNumber") String fromAccountNumber, @org.springframework.data.repository.query.Param("startOfDay") java.time.LocalDateTime startOfDay, @org.springframework.data.repository.query.Param("endOfDay") java.time.LocalDateTime endOfDay);
}
