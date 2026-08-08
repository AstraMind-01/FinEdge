package com.onlinebanking.transaction.dto;

import java.util.List;

public record FraudCheckResponse(
        String transactionRef,
        Double riskScore,
        String decision,
        List<String> indicators,
        String modelVersion,
        String evaluatedAt
) {
}
