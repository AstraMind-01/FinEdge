package com.onlinebanking.transaction.repository;

import com.onlinebanking.transaction.entity.RecurringRuleStatus;
import com.onlinebanking.transaction.entity.RecurringTransferRule;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecurringTransferRuleRepository extends JpaRepository<RecurringTransferRule, Long> {

    List<RecurringTransferRule> findByStatusAndNextRunAtLessThanEqual(RecurringRuleStatus status, LocalDateTime now);

    List<RecurringTransferRule> findByInitiatedByUsernameOrderByCreatedAtDesc(String username);
}
