package com.onlinebanking.transaction.exception;

public class AccountInactiveException extends RuntimeException {
    public AccountInactiveException(String message) {
        super(message);
    }
}
