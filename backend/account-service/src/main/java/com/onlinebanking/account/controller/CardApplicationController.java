package com.onlinebanking.account.controller;

import com.onlinebanking.account.dto.CardApplicationRequest;
import com.onlinebanking.account.dto.CardApplicationResponse;
import com.onlinebanking.account.service.CardApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts/cards/applications")
@RequiredArgsConstructor
public class CardApplicationController {

    private final CardApplicationService cardApplicationService;

    @PostMapping
    public ResponseEntity<?> submitApplication(
            @Valid @RequestBody CardApplicationRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "soumya";
        try {
            CardApplicationResponse response = cardApplicationService.submitApplication(request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<CardApplicationResponse>> getUserApplications(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "soumya";
        List<CardApplicationResponse> list = cardApplicationService.getUserApplications(username);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<CardApplicationResponse> getApplicationById(@PathVariable String applicationId) {
        CardApplicationResponse response = cardApplicationService.getApplicationById(applicationId);
        return ResponseEntity.ok(response);
    }
}
