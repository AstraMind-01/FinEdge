package com.onlinebanking.auth.controller;

import com.onlinebanking.auth.dto.KycResponse;
import com.onlinebanking.auth.dto.KycReviewRequest;
import com.onlinebanking.auth.dto.KycSubmissionRequest;
import com.onlinebanking.auth.service.CustomerService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping("/kyc")
    public ResponseEntity<KycResponse> submitKyc(
            @Valid @RequestBody KycSubmissionRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        KycResponse response = customerService.submitKyc(username, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me/kyc")
    public ResponseEntity<KycResponse> getMyKycStatus(Authentication authentication) {
        String username = authentication.getName();
        KycResponse response = customerService.getKycProfile(username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/kyc/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<KycResponse>> getPendingKycProfiles() {
        List<KycResponse> response = customerService.getPendingKycProfiles();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/{userId}/kyc/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<KycResponse> reviewKyc(
            @PathVariable Long userId,
            @Valid @RequestBody KycReviewRequest request) {
        KycResponse response = customerService.reviewKyc(userId, request);
        return ResponseEntity.ok(response);
    }
}
