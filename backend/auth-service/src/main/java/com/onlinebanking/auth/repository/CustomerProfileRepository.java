package com.onlinebanking.auth.repository;

import com.onlinebanking.auth.entity.CustomerProfile;
import com.onlinebanking.auth.entity.KycStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Long> {

    Optional<CustomerProfile> findByUserId(Long userId);

    Optional<CustomerProfile> findByUserUsername(String username);

    List<CustomerProfile> findByKycStatus(KycStatus kycStatus);
}
