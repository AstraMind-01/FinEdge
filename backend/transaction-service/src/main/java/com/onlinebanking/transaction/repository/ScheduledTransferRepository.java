package com.onlinebanking.transaction.repository;

import com.onlinebanking.transaction.entity.ScheduledTransfer;
import com.onlinebanking.transaction.entity.ScheduledTransferStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScheduledTransferRepository extends JpaRepository<ScheduledTransfer, Long> {

    List<ScheduledTransfer> findByStatusAndScheduledAtLessThanEqual(ScheduledTransferStatus status, LocalDateTime now);

    List<ScheduledTransfer> findByInitiatedByUsernameOrderByScheduledAtDesc(String username);
}
