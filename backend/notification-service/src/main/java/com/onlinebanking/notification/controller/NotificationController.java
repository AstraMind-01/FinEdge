package com.onlinebanking.notification.controller;

import com.onlinebanking.notification.dto.NotificationResponse;
import com.onlinebanking.notification.service.NotificationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(@org.springframework.web.bind.annotation.RequestParam(required = false) String username, Authentication authentication) {
        String targetUsername = username != null ? username : (authentication != null ? authentication.getName() : null);
        if (targetUsername == null) {
            return ResponseEntity.badRequest().build();
        }
        List<NotificationResponse> notifications = notificationService.getUserNotifications(targetUsername);
        return ResponseEntity.ok(notifications);
    }

    @org.springframework.web.bind.annotation.GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@org.springframework.web.bind.annotation.RequestParam String username) {
        return ResponseEntity.ok(notificationService.getUnreadCount(username));
    }

    @org.springframework.web.bind.annotation.PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@org.springframework.web.bind.annotation.PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @org.springframework.web.bind.annotation.PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@org.springframework.web.bind.annotation.RequestParam String username) {
        notificationService.markAllAsRead(username);
        return ResponseEntity.ok().build();
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@org.springframework.web.bind.annotation.PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<NotificationResponse> createNotification(@org.springframework.web.bind.annotation.RequestBody com.onlinebanking.notification.dto.NotificationRequest request) {
        return ResponseEntity.ok(notificationService.createNotification(request));
    }
}
