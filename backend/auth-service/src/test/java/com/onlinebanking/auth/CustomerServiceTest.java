package com.onlinebanking.auth;

import com.onlinebanking.auth.dto.KycResponse;
import com.onlinebanking.auth.dto.KycReviewRequest;
import com.onlinebanking.auth.dto.KycSubmissionRequest;
import com.onlinebanking.auth.entity.CustomerProfile;
import com.onlinebanking.auth.entity.GovernmentIdType;
import com.onlinebanking.auth.entity.KycStatus;
import com.onlinebanking.auth.entity.Role;
import com.onlinebanking.auth.entity.User;
import com.onlinebanking.auth.entity.UserStatus;
import com.onlinebanking.auth.repository.CustomerProfileRepository;
import com.onlinebanking.auth.repository.UserRepository;
import com.onlinebanking.auth.service.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CustomerProfileRepository customerProfileRepository;

    @InjectMocks
    private CustomerService customerService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("john_doe")
                .email("john@example.com")
                .password("encoded_pass")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Submit KYC: Valid details auto-verifies KYC profile")
    void submitKyc_Approved_WhenValidDetailsProvided() {
        KycSubmissionRequest req = new KycSubmissionRequest(
                "John Doe",
                LocalDate.of(1990, 5, 15),
                "9876543210",
                "123 Banking Street, Financial City",
                GovernmentIdType.AADHAAR,
                "123456789012"
        );

        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.of(sampleUser));
        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(customerProfileRepository.save(any(CustomerProfile.class))).thenAnswer(i -> {
            CustomerProfile cp = i.getArgument(0);
            cp.setId(10L);
            return cp;
        });

        KycResponse resp = customerService.submitKyc("john_doe", req);

        assertNotNull(resp);
        assertEquals(KycStatus.VERIFIED, resp.kycStatus());
        assertNotNull(resp.kycVerifiedAt());
        assertNull(resp.kycRejectionReason());
        verify(customerProfileRepository, times(1)).save(any(CustomerProfile.class));
    }

    @Test
    @DisplayName("Submit KYC: Flagged test pattern ID (0000000000) auto-rejects profile")
    void submitKyc_Rejected_WhenTestPatternGovernmentIdProvided() {
        KycSubmissionRequest req = new KycSubmissionRequest(
                "John Fake",
                LocalDate.of(1995, 8, 20),
                "9876543210",
                "456 Test Lane",
                GovernmentIdType.PAN,
                "0000000000"
        );

        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.of(sampleUser));
        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(customerProfileRepository.save(any(CustomerProfile.class))).thenAnswer(i -> i.getArgument(0));

        KycResponse resp = customerService.submitKyc("john_doe", req);

        assertNotNull(resp);
        assertEquals(KycStatus.REJECTED, resp.kycStatus());
        assertNull(resp.kycVerifiedAt());
        assertNotNull(resp.kycRejectionReason());
    }

    @Test
    @DisplayName("Get KYC Profile: Returns NOT_SUBMITTED when profile does not exist")
    void getKycProfile_ReturnsNotSubmitted_WhenNoProfileExists() {
        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.of(sampleUser));
        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        KycResponse resp = customerService.getKycProfile("john_doe");

        assertNotNull(resp);
        assertEquals(KycStatus.NOT_SUBMITTED, resp.kycStatus());
        assertNull(resp.fullName());
    }

    @Test
    @DisplayName("Admin Review: Approve manual KYC review")
    void reviewKyc_AdminApprovesProfile() {
        CustomerProfile profile = CustomerProfile.builder()
                .id(10L)
                .user(sampleUser)
                .fullName("John Pending")
                .dateOfBirth(LocalDate.of(1992, 1, 1))
                .phoneNumber("9999999999")
                .address("789 Admin Way")
                .governmentIdType(GovernmentIdType.PASSPORT)
                .governmentIdNumber("Z1234567")
                .kycStatus(KycStatus.PENDING)
                .build();

        when(customerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(customerProfileRepository.save(any(CustomerProfile.class))).thenAnswer(i -> i.getArgument(0));

        KycReviewRequest reviewReq = new KycReviewRequest(true, null);
        KycResponse resp = customerService.reviewKyc(1L, reviewReq);

        assertNotNull(resp);
        assertEquals(KycStatus.VERIFIED, resp.kycStatus());
        assertNotNull(resp.kycVerifiedAt());
    }
}
