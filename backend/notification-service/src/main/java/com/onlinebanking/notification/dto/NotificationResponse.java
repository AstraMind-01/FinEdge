package com.onlinebanking.notification.dto;

import com.onlinebanking.notification.entity.NotificationType;
import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String recipientUsername,
        String message,
        NotificationType type,
        String transactionRef,
        LocalDateTime createdAt,
        boolean read
) {
}
