package com.onlinebanking.account.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class KycNotVerifiedException extends RuntimeException {
    public KycNotVerifiedException(String message) {
        super(message);
    }
}
