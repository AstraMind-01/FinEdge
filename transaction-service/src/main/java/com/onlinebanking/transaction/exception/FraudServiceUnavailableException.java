package com.onlinebanking.transaction.exception;

public class FraudServiceUnavailableException extends RuntimeException {
    public FraudServiceUnavailableException(String message) {
        super(message);
    }
}
