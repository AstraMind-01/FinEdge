package com.onlinebanking.account.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardApplicationRequest {

    @NotBlank(message = "Card type is required")
    private String cardType; // CREDIT, DEBIT, VIRTUAL, FOREX

    @NotBlank(message = "Card variant is required")
    private String cardVariant;

    @NotBlank(message = "Linked Account ID is required")
    private String accountId;

    private BigDecimal requestedLimit;

    private BigDecimal monthlyIncome;

    private String securityPin;
}
