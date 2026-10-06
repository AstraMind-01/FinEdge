package com.onlinebanking.auth.dto;

import com.onlinebanking.auth.entity.GovernmentIdType;
import com.onlinebanking.auth.entity.KycStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record KycResponse(
        Long profileId,
        Long userId,
        String username,
        String fullName,
        LocalDate dateOfBirth,
        String phoneNumber,
        String address,
        GovernmentIdType governmentIdType,
        String governmentIdNumber,
        KycStatus kycStatus,
        LocalDateTime kycSubmittedAt,
        LocalDateTime kycVerifiedAt,
        String kycRejectionReason,
        String simulationNote
) {
}
