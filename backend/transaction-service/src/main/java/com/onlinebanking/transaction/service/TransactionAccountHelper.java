package com.onlinebanking.transaction.service;

import com.onlinebanking.transaction.dto.AmountRequest;
import com.onlinebanking.transaction.dto.InternalAccountResponse;
import com.onlinebanking.transaction.exception.AccountInactiveException;
import com.onlinebanking.transaction.exception.InvalidTransactionException;
import java.math.BigDecimal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

public final class TransactionAccountHelper {

    private TransactionAccountHelper() {}

    public static InternalAccountResponse fetchInternalAccount(RestTemplate restTemplate, String accountServiceUrl, String accountNumber) {
        try {
            String url = accountServiceUrl + "/api/v1/accounts/internal/" + accountNumber;
            ResponseEntity<InternalAccountResponse> response = restTemplate.getForEntity(url, InternalAccountResponse.class);
            return response.getBody();
        } catch (Exception e) {
            throw new InvalidTransactionException("Account not found or inaccessible: " + accountNumber);
        }
    }

    public static void debitAccount(RestTemplate restTemplate, String accountServiceUrl, String accountNumber, BigDecimal amount) {
        String url = accountServiceUrl + "/api/v1/accounts/internal/" + accountNumber + "/debit";
        restTemplate.postForEntity(url, new AmountRequest(amount), InternalAccountResponse.class);
    }

    public static void creditAccount(RestTemplate restTemplate, String accountServiceUrl, String accountNumber, BigDecimal amount) {
        String url = accountServiceUrl + "/api/v1/accounts/internal/" + accountNumber + "/credit";
        restTemplate.postForEntity(url, new AmountRequest(amount), InternalAccountResponse.class);
    }

    public static void validateOwnership(InternalAccountResponse account, String username) {
        if (!account.ownerUsername().equalsIgnoreCase(username)) {
            throw new InvalidTransactionException("Access denied: You do not own account " + account.accountNumber());
        }
    }

    public static void validateAccountActive(InternalAccountResponse account) {
        if (!"ACTIVE".equalsIgnoreCase(account.status())) {
            throw new AccountInactiveException("Account " + account.accountNumber() + " is currently " + account.status());
        }
    }
}
