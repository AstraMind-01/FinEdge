package com.onlinebanking.account.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "card_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String applicationId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String accountId;

    @Column(nullable = false)
    private String cardType; // CREDIT, DEBIT, VIRTUAL, FOREX

    @Column(nullable = false)
    private String cardVariant;

    private BigDecimal requestedLimit;

    private BigDecimal monthlyIncome;

    @Column(nullable = false)
    private String status; // PENDING, UNDER_REVIEW, APPROVED, REJECTED

    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
