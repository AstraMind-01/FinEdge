package com.onlinebanking.transaction.exception;

public class FraudBlockedException extends RuntimeException {
    public FraudBlockedException(String message) {
        super(message);
    }
}
