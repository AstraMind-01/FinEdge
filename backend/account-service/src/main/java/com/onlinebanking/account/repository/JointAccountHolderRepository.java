package com.onlinebanking.account.repository;

import com.onlinebanking.account.entity.JointAccountHolder;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JointAccountHolderRepository extends JpaRepository<JointAccountHolder, Long> {

    List<JointAccountHolder> findByAccountId(Long accountId);

    Optional<JointAccountHolder> findByAccountIdAndUsername(Long accountId, String username);

    boolean existsByAccountIdAndUsername(Long accountId, String username);

    List<JointAccountHolder> findByUsername(String username);

    void deleteByAccountIdAndUsername(Long accountId, String username);
}
