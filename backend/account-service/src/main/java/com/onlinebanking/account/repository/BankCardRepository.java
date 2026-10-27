package com.onlinebanking.account.repository;

import com.onlinebanking.account.entity.BankCardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankCardRepository extends JpaRepository<BankCardEntity, Long> {
    List<BankCardEntity> findByUsernameOrderByCreatedAtDesc(String username);
    Optional<BankCardEntity> findByCardId(String cardId);
}
