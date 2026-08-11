package com.onlinebanking.account.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardApplicationResponse {
    private String applicationId;
    private String username;
    private String accountId;
    private String cardType;
    private String cardVariant;
    private BigDecimal requestedLimit;
    private BigDecimal monthlyIncome;
    private String status; // PENDING, UNDER_REVIEW, APPROVED, REJECTED
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Optional generated card info if approved instantly
    private IssuedCardDetails issuedCard;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IssuedCardDetails {
        private String cardId;
        private String cardNumber;
        private String cardHolderName;
        private String expiryMonth;
        private String expiryYear;
        private String cvv;
        private String cardType;
        private String cardVariant;
        private String status;
        private BigDecimal dailyLimit;
    }
}
