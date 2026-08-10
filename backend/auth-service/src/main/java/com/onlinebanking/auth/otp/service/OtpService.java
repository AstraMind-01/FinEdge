package com.onlinebanking.auth.otp.service;

import com.onlinebanking.auth.otp.*;
import com.onlinebanking.auth.otp.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int EXPIRATION_MINUTES = 5;
    private static final int COOLDOWN_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 3;

    private final OtpVerificationRepository otpRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public OtpResponse generateOtp(OtpGenerateRequest request, String authenticatedUsername) {
        String username = (authenticatedUsername != null && !authenticatedUsername.isBlank())
                ? authenticatedUsername
                : (request.getUsername() != null ? request.getUsername() : "GUEST_USER");

        Instant now = Instant.now();

        // 1. Check rate limiting / resend cooldown for active pending OTPs
        List<OtpVerification> existingPending = otpRepository.findByUsernameAndPurposeAndStatus(
                username, request.getPurpose(), OtpStatus.PENDING);

        for (OtpVerification existing : existingPending) {
            if (existing.getResendCooldownUntil() != null && now.isBefore(existing.getResendCooldownUntil())) {
                long remainingSec = Duration.between(now, existing.getResendCooldownUntil()).getSeconds();
                log.warn("[OTP_COOLDOWN_ACTIVE] Cooldown active for user {} purpose {}. Remaining: {}s",
                        username, request.getPurpose(), remainingSec);
                return OtpResponse.builder()
                        .success(false)
                        .verificationToken(existing.getVerificationToken())
                        .purpose(request.getPurpose())
                        .status(OtpStatus.PENDING)
                        .resendCooldownSeconds((int) remainingSec)
                        .expiresInSeconds((int) Duration.between(now, existing.getExpiresAt()).getSeconds())
                        .error("Please wait " + remainingSec + " seconds before requesting a new OTP.")
                        .build();
            }
        }

        // 2. Invalidate all previous active OTPs for this (user, purpose)
        otpRepository.invalidatePreviousOtps(username, request.getPurpose());

        // 3. Cryptographically secure 6-digit OTP generation
        int rawOtpNumber = 100000 + secureRandom.nextInt(900000);
        String plaintextOtp = String.valueOf(rawOtpNumber);

        // 4. Generate salt and hash OTP (SHA-256) — Plaintext NEVER stored
        String salt = UUID.randomUUID().toString().substring(0, 16);
        String otpHash = hashOtp(plaintextOtp, salt);

        String verificationToken = "FE-OTP-SESS-" + UUID.randomUUID().toString();
        Instant expiresAt = now.plus(Duration.ofMinutes(EXPIRATION_MINUTES));
        Instant cooldownUntil = now.plus(Duration.ofSeconds(COOLDOWN_SECONDS));

        OtpVerification entity = OtpVerification.builder()
                .verificationToken(verificationToken)
                .username(username)
                .purpose(request.getPurpose())
                .otpHash(otpHash)
                .salt(salt)
                .targetIdentifier(request.getTargetIdentifier())
                .status(OtpStatus.PENDING)
                .failedAttempts(0)
                .expiresAt(expiresAt)
                .resendCooldownUntil(cooldownUntil)
                .createdAt(now)
                .build();

        otpRepository.save(entity);

        // Audit Logging & Internal Dispatch Signal (Simulated SMS/Email/Kafka dispatch)
        log.info("[AUDIT_OTP_GENERATED] VerificationToken: {} | User: {} | Purpose: {} | ExpiresAt: {}",
                verificationToken, username, request.getPurpose(), expiresAt);
        log.info("[OTP_NOTIFICATION_DISPATCH] Dispatching secure OTP to user {} for purpose {} (SMS/Email dispatched)",
                username, request.getPurpose());

        return OtpResponse.builder()
                .success(true)
                .verificationToken(verificationToken)
                .purpose(request.getPurpose())
                .status(OtpStatus.PENDING)
                .expiresInSeconds(EXPIRATION_MINUTES * 60)
                .resendCooldownSeconds(COOLDOWN_SECONDS)
                .remainingAttempts(MAX_ATTEMPTS)
                .message("Verification OTP dispatched to your registered device/mobile.")
                .build();
    }

    @Transactional
    public OtpResponse verifyOtp(OtpVerifyRequest request) {
        Instant now = Instant.now();

        OtpVerification entity = otpRepository.findByVerificationToken(request.getVerificationToken())
                .orElse(null);

        if (entity == null) {
            log.warn("[AUDIT_OTP_VERIFY_INVALID_TOKEN] Verification token not found: {}", request.getVerificationToken());
            return OtpResponse.builder()
                    .success(false)
                    .error("Invalid or non-existent verification session.")
                    .build();
        }

        if (entity.getStatus() != OtpStatus.PENDING) {
            log.warn("[AUDIT_OTP_VERIFY_FAILED_STATUS] OTP session token {} has status: {}",
                    request.getVerificationToken(), entity.getStatus());
            return OtpResponse.builder()
                    .success(false)
                    .status(entity.getStatus())
                    .error("OTP session is no longer active (Status: " + entity.getStatus() + "). Please request a new OTP.")
                    .build();
        }

        if (now.isAfter(entity.getExpiresAt())) {
            entity.setStatus(OtpStatus.EXPIRED);
            otpRepository.save(entity);
            log.warn("[AUDIT_OTP_EXPIRED] OTP expired for token {}", request.getVerificationToken());
            return OtpResponse.builder()
                    .success(false)
                    .status(OtpStatus.EXPIRED)
                    .error("OTP has expired. Please request a new OTP code.")
                    .build();
        }

        if (entity.getFailedAttempts() >= MAX_ATTEMPTS) {
            entity.setStatus(OtpStatus.EXHAUSTED);
            otpRepository.save(entity);
            log.warn("[AUDIT_OTP_EXHAUSTED] Max attempts exceeded for token {}", request.getVerificationToken());
            return OtpResponse.builder()
                    .success(false)
                    .status(OtpStatus.EXHAUSTED)
                    .remainingAttempts(0)
                    .error("Maximum failed attempts (3/3) exceeded. OTP session locked. Please request a new OTP.")
                    .build();
        }

        // Compare Hashed OTP
        String inputHash = hashOtp(request.getOtp(), entity.getSalt());

        if (MessageDigest.isEqual(inputHash.getBytes(StandardCharsets.UTF_8), entity.getOtpHash().getBytes(StandardCharsets.UTF_8))) {
            entity.setStatus(OtpStatus.VERIFIED);
            entity.setVerifiedAt(now);
            otpRepository.save(entity);

            String proofToken = "FE-PROOF-" + UUID.randomUUID().toString() + "-" + now.toEpochMilli();

            log.info("[AUDIT_OTP_VERIFIED_SUCCESS] Verified successfully! User: {} | Purpose: {} | ProofToken: {}",
                    entity.getUsername(), entity.getPurpose(), proofToken);

            return OtpResponse.builder()
                    .success(true)
                    .verificationToken(entity.getVerificationToken())
                    .purpose(entity.getPurpose())
                    .status(OtpStatus.VERIFIED)
                    .proofToken(proofToken)
                    .message("OTP verified successfully. Operation authorized.")
                    .build();
        } else {
            int newFailedCount = entity.getFailedAttempts() + 1;
            entity.setFailedAttempts(newFailedCount);
            if (newFailedCount >= MAX_ATTEMPTS) {
                entity.setStatus(OtpStatus.EXHAUSTED);
            }
            otpRepository.save(entity);

            int remaining = Math.max(0, MAX_ATTEMPTS - newFailedCount);
            log.warn("[AUDIT_OTP_VERIFY_MISMATCH] Incorrect OTP attempt {}/{} for token {}",
                    newFailedCount, MAX_ATTEMPTS, request.getVerificationToken());

            return OtpResponse.builder()
                    .success(false)
                    .verificationToken(entity.getVerificationToken())
                    .purpose(entity.getPurpose())
                    .status(entity.getStatus())
                    .remainingAttempts(remaining)
                    .error(remaining > 0
                            ? "Invalid OTP code. " + remaining + " attempt(s) remaining."
                            : "Maximum failed attempts (3/3) exceeded. OTP session locked.")
                    .build();
        }
    }

    @Transactional
    public OtpResponse resendOtp(OtpResendRequest request, String authenticatedUsername) {
        OtpVerification entity = otpRepository.findByVerificationToken(request.getVerificationToken())
                .orElse(null);

        if (entity == null) {
            return OtpResponse.builder()
                    .success(false)
                    .error("Invalid verification session token.")
                    .build();
        }

        OtpGenerateRequest generateRequest = OtpGenerateRequest.builder()
                .username(entity.getUsername())
                .purpose(entity.getPurpose())
                .targetIdentifier(entity.getTargetIdentifier())
                .build();

        return generateOtp(generateRequest, authenticatedUsername);
    }

    private String hashOtp(String otp, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((salt + ":" + otp).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
