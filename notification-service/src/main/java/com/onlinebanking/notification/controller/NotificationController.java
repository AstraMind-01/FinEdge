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
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(Authentication authentication) {
        String username = authentication.getName();
        List<NotificationResponse> notifications = notificationService.getUserNotifications(username);
        return ResponseEntity.ok(notifications);
    }
}
