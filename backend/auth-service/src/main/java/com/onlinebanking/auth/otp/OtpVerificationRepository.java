package com.onlinebanking.auth.otp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findByVerificationToken(String verificationToken);

    List<OtpVerification> findByUsernameAndPurposeAndStatus(String username, OtpPurpose purpose, OtpStatus status);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.status = 'INVALIDATED' WHERE o.username = :username AND o.purpose = :purpose AND o.status = 'PENDING'")
    void invalidatePreviousOtps(String username, OtpPurpose purpose);
}
