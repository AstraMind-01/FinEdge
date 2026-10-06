package com.onlinebanking.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * CustomerProfile Entity (KYC & Identity Data)
 * 
 * ARCHITECTURAL DECISION:
 * Why a separate CustomerProfile entity instead of adding fields directly to User?
 * 1. Separation of Concerns: User entity handles authentication credentials, session security, 
 *    and access control roles. CustomerProfile handles personal identity, compliance, and KYC state.
 * 2. Enterprise Alignment: Mirrors real banking architecture where the Auth/IdP service (Keycloak/OAuth) 
 *    is decoupled from the Customer Master System / Core KYC Engine.
 */
@Entity
@Table(name = "customer_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GovernmentIdType governmentIdType;

    /**
     * NOTE ON DEMO SIMPLIFICATION:
     * In a production enterprise system, government ID numbers (Aadhaar, PAN, SSN) must be encrypted at rest 
     * or tokenized/masked for PCI-DSS/GDPR/DPDP compliance. For this college project demo, storing as plain text 
     * is an explicit simplification.
     */
    @Column(nullable = false)
    private String governmentIdNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KycStatus kycStatus;

    private LocalDateTime kycSubmittedAt;

    private LocalDateTime kycVerifiedAt;

    private String kycRejectionReason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        this.updatedAt = now;
        if (this.kycStatus == null) {
            this.kycStatus = KycStatus.NOT_SUBMITTED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
