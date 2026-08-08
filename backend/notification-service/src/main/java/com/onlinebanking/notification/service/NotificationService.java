package com.onlinebanking.notification.service;

import com.onlinebanking.notification.dto.NotificationResponse;
import com.onlinebanking.notification.entity.Notification;
import com.onlinebanking.notification.entity.NotificationType;
import com.onlinebanking.notification.event.TransactionEvent;
import com.onlinebanking.notification.repository.NotificationRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    public void processTransactionEvent(TransactionEvent event) {
        log.info("Processing Kafka TransactionEvent [{}] for user: {}", event.transactionRef(), event.initiatedByUsername());

        boolean isSuccess = "SUCCESS".equalsIgnoreCase(event.status());
        NotificationType notificationType = isSuccess ? NotificationType.TRANSACTION_SUCCESS : NotificationType.TRANSACTION_FAILED;

        String message = buildNotificationMessage(event);

        Notification notification = Notification.builder()
                .recipientUsername(event.initiatedByUsername())
                .message(message)
                .type(notificationType)
                .transactionRef(event.transactionRef())
                .read(false)
                .build();

        notificationRepository.save(notification);
        log.info("Saved notification ID {} for recipient {}", notification.getId(), event.initiatedByUsername());
    }

    public List<NotificationResponse> getUserNotifications(String username) {
        return notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(n -> new NotificationResponse(
                        n.getId(),
                        n.getRecipientUsername(),
                        n.getMessage(),
                        n.getType(),
                        n.getTransactionRef(),
                        n.getCreatedAt(),
                        n.isRead()
                ))
                .toList();
    }

    private String buildNotificationMessage(TransactionEvent event) {
        boolean isSuccess = "SUCCESS".equalsIgnoreCase(event.status());
        String statusText = isSuccess ? "successful" : "failed";

        return switch (event.type().toUpperCase()) {
            case "DEPOSIT" -> String.format("Your deposit of $%s to account %s was %s.",
                    event.amount(), event.toAccountNumber(), statusText);
            case "WITHDRAWAL" -> String.format("Your withdrawal of $%s from account %s was %s.",
                    event.amount(), event.fromAccountNumber(), statusText);
            case "TRANSFER" -> String.format("Your transfer of $%s from account %s to account %s was %s.",
                    event.amount(), event.fromAccountNumber(), event.toAccountNumber(), statusText);
            default -> String.format("Transaction %s (%s) of $%s was %s.",
                    event.transactionRef(), event.type(), event.amount(), statusText);
        };
    }
}
