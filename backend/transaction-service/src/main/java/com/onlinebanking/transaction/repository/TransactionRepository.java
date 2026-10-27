package com.onlinebanking.transaction.repository;

import com.onlinebanking.transaction.entity.Transaction;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByIdempotencyKeyAndInitiatedByUsername(String idempotencyKey, String initiatedByUsername);

    List<Transaction> findByInitiatedByUsernameOrderByCreatedAtDesc(String initiatedByUsername);

    boolean existsByTransactionRef(String transactionRef);

    List<Transaction> findByFromAccountNumberOrToAccountNumberOrderByCreatedAtDesc(
            String fromAccountNumber, String toAccountNumber);

    List<Transaction> findTop10ByOrderByCreatedAtDesc();

    @Query("""
            select coalesce(sum(t.amount), 0) from Transaction t
            where t.fromAccountNumber = :accountNumber
              and t.status = com.onlinebanking.transaction.entity.TransactionStatus.SUCCESS
              and t.createdAt between :start and :end
            """)
    BigDecimal calculateDailyOutgoingTotal(
            @Param("accountNumber") String accountNumber,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
