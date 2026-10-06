package com.onlinebanking.transaction.service;

import com.onlinebanking.transaction.dto.FraudCheckRequest;
import com.onlinebanking.transaction.dto.FraudCheckResponse;
import com.onlinebanking.transaction.entity.Transaction;
import com.onlinebanking.transaction.entity.TransactionStatus;
import com.onlinebanking.transaction.event.TransactionProducer;
import com.onlinebanking.transaction.exception.FraudBlockedException;
import com.onlinebanking.transaction.exception.FraudServiceUnavailableException;
import com.onlinebanking.transaction.repository.TransactionRepository;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

public final class TransactionFraudHelper {

    private static final Logger log = LoggerFactory.getLogger(TransactionFraudHelper.class);

    private TransactionFraudHelper() {}

    public static void evaluateFraudRisk(
            Transaction transaction,
            String bearerToken,
            RestTemplate restTemplate,
            String fraudServiceUrl,
            JwtService jwtService,
            TransactionRepository transactionRepository,
            TransactionProducer transactionProducer
    ) {
        FraudCheckResponse response = checkFraudRisk(transaction, bearerToken, restTemplate, fraudServiceUrl, jwtService);

        transaction.setRiskScore(response.riskScore());
        transaction.setRiskDecision(response.decision());
        transaction.setRiskIndicators(response.indicators() != null ? String.join(", ", response.indicators()) : "");
        transaction.setFraudCheckedAt(LocalDateTime.now());

        if ("HIGH_RISK".equalsIgnoreCase(response.decision())) {
            log.warn("BLOCKING TRANSACTION [{}]: High risk fraud decision (Score: {})",
                    transaction.getTransactionRef(), response.riskScore());
            transaction.setStatus(TransactionStatus.FAILED);
            Transaction failed = transactionRepository.save(transaction);
            transactionProducer.publishEvent(failed);
            throw new FraudBlockedException("Transaction blocked: High risk fraud detected (Risk Score: " + response.riskScore() + ")");
        }

        if ("REVIEW".equalsIgnoreCase(response.decision())) {
            log.warn("FLAGGING TRANSACTION [{}] FOR MANUAL REVIEW (Risk Score: {})",
                    transaction.getTransactionRef(), response.riskScore());
        }

        transactionRepository.save(transaction);
    }

    public static FraudCheckResponse checkFraudRisk(
            Transaction transaction,
            String bearerToken,
            RestTemplate restTemplate,
            String fraudServiceUrl,
            JwtService jwtService
    ) {
        try {
            String url = fraudServiceUrl + "/api/v1/fraud/check";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String token = (bearerToken != null && !bearerToken.isBlank())
                    ? bearerToken
                    : "Bearer " + jwtService.generateSystemToken(transaction.getInitiatedByUsername());
            headers.set("Authorization", token.startsWith("Bearer ") ? token : "Bearer " + token);

            FraudCheckRequest payload = new FraudCheckRequest(
                    transaction.getTransactionRef(),
                    transaction.getType().name(),
                    transaction.getFromAccountNumber(),
                    transaction.getToAccountNumber(),
                    transaction.getAmount(),
                    transaction.getInitiatedByUsername(),
                    transaction.getCreatedAt().toString()
            );

            HttpEntity<FraudCheckRequest> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<FraudCheckResponse> response = restTemplate.postForEntity(url, entity, FraudCheckResponse.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Fail-Closed Policy: Fraud detection service unreachable or timed out for transaction [{}]: {}",
                    transaction.getTransactionRef(), e.getMessage());
            throw new FraudServiceUnavailableException("Transaction failed: Fraud detection service is unavailable or timed out.");
        }
    }
}
