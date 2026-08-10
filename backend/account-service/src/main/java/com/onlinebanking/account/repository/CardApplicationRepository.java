package com.onlinebanking.account.repository;

import com.onlinebanking.account.entity.CardApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardApplicationRepository extends JpaRepository<CardApplication, Long> {
    List<CardApplication> findByUsernameOrderByCreatedAtDesc(String username);
    Optional<CardApplication> findByApplicationId(String applicationId);
    List<CardApplication> findByUsernameAndCardTypeAndAccountIdAndStatusIn(
            String username, String cardType, String accountId, List<String> statuses);
}
