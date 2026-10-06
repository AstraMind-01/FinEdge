package com.onlinebanking.auth.service;

import com.onlinebanking.auth.dto.KycResponse;
import com.onlinebanking.auth.dto.KycReviewRequest;
import com.onlinebanking.auth.dto.KycSubmissionRequest;
import com.onlinebanking.auth.entity.CustomerProfile;
import com.onlinebanking.auth.entity.KycStatus;
import com.onlinebanking.auth.entity.User;
import com.onlinebanking.auth.exception.InvalidCredentialsException;
import com.onlinebanking.auth.repository.CustomerProfileRepository;
import com.onlinebanking.auth.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CustomerService — Handles Customer Profile & KYC Simulation Flow.
 * 
 * SIMULATION NOTE FOR VIVA DEMO:
 * This service implements a deterministic instant auto-decision rule for KYC verification:
 * - Real KYC systems are inherently asynchronous (OCR, document checks, third-party APIs).
 * - For this project demo, we use an instant deterministic rule:
 *   1. Government ID starting with "00000" or equal to "0000000000" -> Automatically REJECTED.
 *   2. Otherwise -> Automatically VERIFIED.
 */
@Service
@RequiredArgsConstructor
public class CustomerService {

    private static final Logger log = LoggerFactory.getLogger(CustomerService.class);

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;

    @Transactional
    public KycResponse submitKyc(String username, KycSubmissionRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("User '" + username + "' not found"));

        Optional<CustomerProfile> existingOpt = customerProfileRepository.findByUserId(user.getId());

        CustomerProfile profile;
        if (existingOpt.isPresent()) {
            profile = existingOpt.get();
            log.info("Updating existing CustomerProfile for user [{}]", username);
        } else {
            profile = CustomerProfile.builder()
                    .user(user)
                    .build();
            log.info("Creating new CustomerProfile for user [{}]", username);
        }

        profile.setFullName(request.fullName());
        profile.setDateOfBirth(request.dateOfBirth());
        profile.setPhoneNumber(request.phoneNumber());
        profile.setAddress(request.address());
        profile.setGovernmentIdType(request.governmentIdType());
        profile.setGovernmentIdNumber(request.governmentIdNumber());
        profile.setKycSubmittedAt(LocalDateTime.now());

        // Deterministic Verification Rule for Viva Simulation
        String simulationNote;
        String idNum = request.governmentIdNumber().trim();
        boolean isTestRejectionPattern = idNum.equals("0000000000") 
                || idNum.startsWith("00000") 
                || request.fullName().toUpperCase().contains("REJECT");

        if (isTestRejectionPattern) {
            profile.setKycStatus(KycStatus.REJECTED);
            profile.setKycRejectionReason("Flagged test government ID pattern or invalid identification format.");
            profile.setKycVerifiedAt(null);
            simulationNote = "SIMULATED DECISION: Automatically REJECTED based on deterministic test pattern rule (ID '00000...').";
            log.warn("KYC REJECTED for user [{}] due to flagged ID number pattern [{}]", username, idNum);
        } else {
            profile.setKycStatus(KycStatus.VERIFIED);
            profile.setKycVerifiedAt(LocalDateTime.now());
            profile.setKycRejectionReason(null);
            simulationNote = "SIMULATED DECISION: Instant auto-verification rule applied for viva demo.";
            log.info("KYC VERIFIED for user [{}]", username);
        }

        CustomerProfile savedProfile = customerProfileRepository.save(profile);
        return mapToKycResponse(savedProfile, simulationNote);
    }

    @Transactional(readOnly = true)
    public KycResponse getKycProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("User '" + username + "' not found"));

        Optional<CustomerProfile> profileOpt = customerProfileRepository.findByUserId(user.getId());

        if (profileOpt.isEmpty()) {
            return new KycResponse(
                    null,
                    user.getId(),
                    user.getUsername(),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    KycStatus.NOT_SUBMITTED,
                    null,
                    null,
                    null,
                    "No CustomerProfile found. KYC has not been submitted yet."
            );
        }

        return mapToKycResponse(profileOpt.get(), "Current KYC profile retrieved.");
    }

    @Transactional(readOnly = true)
    public List<KycResponse> getPendingKycProfiles() {
        List<CustomerProfile> pendingProfiles = customerProfileRepository.findByKycStatus(KycStatus.PENDING);
        if (pendingProfiles.isEmpty()) {
            // Return all profiles if no pending ones, for admin convenience
            pendingProfiles = customerProfileRepository.findAll();
        }
        return pendingProfiles.stream()
                .map(p -> mapToKycResponse(p, "Admin list retrieval"))
                .toList();
    }

    @Transactional
    public KycResponse reviewKyc(Long targetUserId, KycReviewRequest request) {
        CustomerProfile profile = customerProfileRepository.findByUserId(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Customer profile not found for user ID: " + targetUserId));

        if (Boolean.TRUE.equals(request.approved())) {
            profile.setKycStatus(KycStatus.VERIFIED);
            profile.setKycVerifiedAt(LocalDateTime.now());
            profile.setKycRejectionReason(null);
            log.info("Admin APPROVED KYC for user ID [{}]", targetUserId);
        } else {
            profile.setKycStatus(KycStatus.REJECTED);
            profile.setKycRejectionReason(
                    request.rejectionReason() != null ? request.rejectionReason() : "Rejected by Administrator review."
            );
            profile.setKycVerifiedAt(null);
            log.warn("Admin REJECTED KYC for user ID [{}]. Reason: {}", targetUserId, profile.getKycRejectionReason());
        }

        CustomerProfile saved = customerProfileRepository.save(profile);
        return mapToKycResponse(saved, "Manual Admin Review decision recorded.");
    }

    private KycResponse mapToKycResponse(CustomerProfile p, String note) {
        return new KycResponse(
                p.getId(),
                p.getUser().getId(),
                p.getUser().getUsername(),
                p.getFullName(),
                p.getDateOfBirth(),
                p.getPhoneNumber(),
                p.getAddress(),
                p.getGovernmentIdType(),
                p.getGovernmentIdNumber(),
                p.getKycStatus(),
                p.getKycSubmittedAt(),
                p.getKycVerifiedAt(),
                p.getKycRejectionReason(),
                note
        );
    }
}
