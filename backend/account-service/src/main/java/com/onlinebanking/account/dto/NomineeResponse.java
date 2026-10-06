package com.onlinebanking.account.dto;

import com.onlinebanking.account.entity.NomineeRelationship;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record NomineeResponse(
        Long id,
        Long accountId,
        String nomineeName,
        NomineeRelationship relationship,
        String phoneNumber,
        BigDecimal sharePercentage,
        LocalDateTime addedAt
) {
}
