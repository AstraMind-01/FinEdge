package com.onlinebanking.auth.otp.controller;

import com.onlinebanking.auth.otp.dto.*;
import com.onlinebanking.auth.otp.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/generate")
    public ResponseEntity<OtpResponse> generateOtp(
            @Valid @RequestBody OtpGenerateRequest request,
            Authentication authentication) {
        String username = (authentication != null) ? authentication.getName() : null;
        OtpResponse response = otpService.generateOtp(request, username);
        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<OtpResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        OtpResponse response = otpService.verifyOtp(request);
        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend")
    public ResponseEntity<OtpResponse> resendOtp(
            @Valid @RequestBody OtpResendRequest request,
            Authentication authentication) {
        String username = (authentication != null) ? authentication.getName() : null;
        OtpResponse response = otpService.resendOtp(request, username);
        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
        }
        return ResponseEntity.ok(response);
    }
}
