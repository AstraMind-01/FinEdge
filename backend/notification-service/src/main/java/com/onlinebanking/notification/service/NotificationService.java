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
                        n.isRead(),
                        n.getTitle(),
                        n.getCategory(),
                        n.getPriority(),
                        n.getActionLink(),
                        n.getActionLabel(),
                        n.getSourceEvent()
                ))
                .toList();
    }

    @org.springframework.transaction.annotation.Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @org.springframework.transaction.annotation.Transactional
    public void markAllAsRead(String username) {
        notificationRepository.markAllAsReadByUsername(username);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    public long getUnreadCount(String username) {
        return notificationRepository.countByRecipientUsernameAndReadFalse(username);
    }

    @org.springframework.transaction.annotation.Transactional
    public NotificationResponse createNotification(com.onlinebanking.notification.dto.NotificationRequest request) {
        Notification notification = Notification.builder()
                .recipientUsername(request.recipientUsername())
                .message(request.message())
                .type(request.type())
                .transactionRef(request.transactionRef())
                .title(request.title())
                .category(request.category())
                .priority(request.priority())
                .actionLink(request.actionLink())
                .actionLabel(request.actionLabel())
                .sourceEvent(request.sourceEvent())
                .metadata(request.metadata())
                .read(false)
                .build();
        
        Notification saved = notificationRepository.save(notification);
        return new NotificationResponse(
                saved.getId(),
                saved.getRecipientUsername(),
                saved.getMessage(),
                saved.getType(),
                saved.getTransactionRef(),
                saved.getCreatedAt(),
                saved.isRead(),
                saved.getTitle(),
                saved.getCategory(),
                saved.getPriority(),
                saved.getActionLink(),
                saved.getActionLabel(),
                saved.getSourceEvent()
        );
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
