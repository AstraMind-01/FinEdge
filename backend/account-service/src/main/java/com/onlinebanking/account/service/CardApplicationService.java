package com.onlinebanking.account.service;

import com.onlinebanking.account.dto.CardApplicationRequest;
import com.onlinebanking.account.dto.CardApplicationResponse;
import com.onlinebanking.account.entity.BankCardEntity;
import com.onlinebanking.account.entity.CardApplication;
import com.onlinebanking.account.repository.BankCardRepository;
import com.onlinebanking.account.repository.CardApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardApplicationService {

    private final CardApplicationRepository cardApplicationRepository;
    private final BankCardRepository bankCardRepository;

    @Transactional
    public CardApplicationResponse submitApplication(CardApplicationRequest request, String username) {
        String effectiveUsername = username != null ? username : "soumya";
        String cardType = request.getCardType().toUpperCase();
        String cardVariant = request.getCardVariant();
        String accountId = request.getAccountId();

        log.info("Processing card application for user: {}, type: {}, account: {}", effectiveUsername, cardType, accountId);

        // Security Authorization Check: Verify 4-digit PIN is present
        if (request.getSecurityPin() == null || request.getSecurityPin().trim().length() < 4) {
            log.error("Security PIN authorization failed for user: {}", effectiveUsername);
            throw new IllegalArgumentException("Security PIN verification failed. Please enter your valid 4-digit Security PIN.");
        }

        // 1. Duplicate Application Check
        List<CardApplication> existingPending = cardApplicationRepository
                .findByUsernameAndCardTypeAndAccountIdAndStatusIn(
                        effectiveUsername, cardType, accountId, List.of("PENDING", "UNDER_REVIEW"));

        if (!existingPending.isEmpty()) {
            CardApplication existing = existingPending.get(0);
            log.warn("Duplicate application detected for user: {}, applicationId: {}", effectiveUsername, existing.getApplicationId());
            throw new IllegalArgumentException("A card application (" + existing.getApplicationId() + ") for " + cardType + " on this account is already under review.");
        }

        // 2. Application ID Generation
        String applicationId = "CRD-APP-2026-" + (10000 + new Random().nextInt(90000));

        // 3. Determine Lifecycle Status
        String initialStatus = "PENDING";
        String rejectionReason = null;
        BankCardEntity issuedCard = null;

        BigDecimal income = request.getMonthlyIncome() != null ? request.getMonthlyIncome() : new BigDecimal("50000");

        if ("VIRTUAL".equalsIgnoreCase(cardType) || "DEBIT".equalsIgnoreCase(cardType)) {
            initialStatus = "APPROVED";
            issuedCard = issueNewBankCard(effectiveUsername, accountId, cardType, cardVariant);
        } else if ("CREDIT".equalsIgnoreCase(cardType)) {
            if (income.compareTo(new BigDecimal("25000")) >= 0) {
                initialStatus = "APPROVED";
                issuedCard = issueNewBankCard(effectiveUsername, accountId, cardType, cardVariant);
            } else if (income.compareTo(new BigDecimal("15000")) >= 0) {
                initialStatus = "UNDER_REVIEW";
            } else {
                initialStatus = "REJECTED";
                rejectionReason = "Monthly income below minimum required threshold (₹25,000/month).";
            }
        } else {
            initialStatus = "APPROVED";
            issuedCard = issueNewBankCard(effectiveUsername, accountId, cardType, cardVariant);
        }

        // 4. Save Application
        CardApplication app = CardApplication.builder()
                .applicationId(applicationId)
                .username(effectiveUsername)
                .accountId(accountId)
                .cardType(cardType)
                .cardVariant(cardVariant)
                .requestedLimit(request.getRequestedLimit())
                .monthlyIncome(income)
                .status(initialStatus)
                .rejectionReason(rejectionReason)
                .build();

        CardApplication savedApp = cardApplicationRepository.save(app);

        // 5. Build Response
        CardApplicationResponse.IssuedCardDetails issuedDetails = null;
        if (issuedCard != null) {
            issuedDetails = CardApplicationResponse.IssuedCardDetails.builder()
                    .cardId(issuedCard.getCardId())
                    .cardNumber(issuedCard.getCardNumber())
                    .cardHolderName(issuedCard.getCardHolderName())
                    .expiryMonth(issuedCard.getExpiryMonth())
                    .expiryYear(issuedCard.getExpiryYear())
                    .cvv(issuedCard.getCvv())
                    .cardType(issuedCard.getCardType())
                    .cardVariant(issuedCard.getCardVariant())
                    .status(issuedCard.getStatus())
                    .dailyLimit(issuedCard.getDailyLimit())
                    .build();
        }

        return CardApplicationResponse.builder()
                .applicationId(savedApp.getApplicationId())
                .username(savedApp.getUsername())
                .accountId(savedApp.getAccountId())
                .cardType(savedApp.getCardType())
                .cardVariant(savedApp.getCardVariant())
                .requestedLimit(savedApp.getRequestedLimit())
                .monthlyIncome(savedApp.getMonthlyIncome())
                .status(savedApp.getStatus())
                .rejectionReason(savedApp.getRejectionReason())
                .createdAt(savedApp.getCreatedAt())
                .updatedAt(savedApp.getUpdatedAt())
                .issuedCard(issuedDetails)
                .build();
    }

    public List<CardApplicationResponse> getUserApplications(String username) {
        String effectiveUsername = username != null ? username : "soumya";
        List<CardApplication> list = cardApplicationRepository.findByUsernameOrderByCreatedAtDesc(effectiveUsername);

        return list.stream().map(app -> CardApplicationResponse.builder()
                .applicationId(app.getApplicationId())
                .username(app.getUsername())
                .accountId(app.getAccountId())
                .cardType(app.getCardType())
                .cardVariant(app.getCardVariant())
                .requestedLimit(app.getRequestedLimit())
                .monthlyIncome(app.getMonthlyIncome())
                .status(app.getStatus())
                .rejectionReason(app.getRejectionReason())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build()).collect(Collectors.toList());
    }

    public CardApplicationResponse getApplicationById(String applicationId) {
        CardApplication app = cardApplicationRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Card application not found: " + applicationId));

        return CardApplicationResponse.builder()
                .applicationId(app.getApplicationId())
                .username(app.getUsername())
                .accountId(app.getAccountId())
                .cardType(app.getCardType())
                .cardVariant(app.getCardVariant())
                .requestedLimit(app.getRequestedLimit())
                .monthlyIncome(app.getMonthlyIncome())
                .status(app.getStatus())
                .rejectionReason(app.getRejectionReason())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }

    private BankCardEntity issueNewBankCard(String username, String accountId, String type, String variant) {
        String cardId = "crd_" + UUID.randomUUID().toString().substring(0, 8);
        String prefix = "CREDIT".equalsIgnoreCase(type) ? "5412" : "4532";
        String randomSuffix = String.format("%04d", new Random().nextInt(10000));
        String cardNumber = prefix + " •••• •••• " + randomSuffix;
        String cvv = String.format("%03d", new Random().nextInt(1000));
        int currentYear = Year.now().getValue() + 5;
        String expiryYear = String.valueOf(currentYear).substring(2);

        BankCardEntity card = BankCardEntity.builder()
                .cardId(cardId)
                .username(username)
                .accountId(accountId)
                .cardNumber(cardNumber)
                .cardHolderName(username.toUpperCase() + " RANJAN")
                .expiryMonth("08")
                .expiryYear(expiryYear)
                .cvv(cvv)
                .cardType(type)
                .cardVariant(variant)
                .status("ACTIVE")
                .dailyLimit(new BigDecimal("100000"))
                .build();

        return bankCardRepository.save(card);
    }
}
