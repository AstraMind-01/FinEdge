package com.onlinebanking.account.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankCardEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String cardId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String accountId;

    @Column(nullable = false)
    private String cardNumber;

    @Column(nullable = false)
    private String cardHolderName;

    @Column(nullable = false)
    private String expiryMonth;

    @Column(nullable = false)
    private String expiryYear;

    @Column(nullable = false)
    private String cvv;

    @Column(nullable = false)
    private String cardType; // CREDIT, DEBIT, VIRTUAL, FOREX

    @Column(nullable = false)
    private String cardVariant;

    @Column(nullable = false)
    private String status; // ACTIVE, FROZEN, BLOCKED

    private BigDecimal dailyLimit;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
