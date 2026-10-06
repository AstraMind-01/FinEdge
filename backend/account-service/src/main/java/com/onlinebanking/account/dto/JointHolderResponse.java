package com.onlinebanking.account.dto;

import java.time.LocalDateTime;

public record JointHolderResponse(
        Long id,
        Long accountId,
        String username,
        LocalDateTime addedAt
) {
}
