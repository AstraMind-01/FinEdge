package com.onlinebanking.notification.dto;

import com.onlinebanking.notification.entity.NotificationType;

public record NotificationRequest(
        String recipientUsername,
        String message,
        NotificationType type,
        String transactionRef,
        String title,
        String category,
        String priority,
        String actionLink,
        String actionLabel,
        String sourceEvent,
        String metadata
) {
}
