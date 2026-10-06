package com.onlinebanking.account.repository;

import com.onlinebanking.account.entity.Nominee;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NomineeRepository extends JpaRepository<Nominee, Long> {

    List<Nominee> findByAccountId(Long accountId);
}
