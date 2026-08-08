package com.onlinebanking.transaction.exception;

import com.onlinebanking.transaction.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse response = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Error",
                "Invalid request payload",
                request.getRequestURI(),
                errors
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IdempotencyConflictException.class)
    public ResponseEntity<ErrorResponse> handleIdempotencyConflictException(
            IdempotencyConflictException ex, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                "IDEMPOTENCY_CONFLICT",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(FraudBlockedException.class)
    public ResponseEntity<ErrorResponse> handleFraudBlockedException(
            FraudBlockedException ex, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                "FRAUD_RISK_BLOCKED",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(FraudServiceUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleFraudServiceUnavailableException(
            FraudServiceUnavailableException ex, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "FRAUD_SERVICE_UNAVAILABLE",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler({InsufficientBalanceException.class, InvalidTransactionException.class, AccountInactiveException.class})
    public ResponseEntity<ErrorResponse> handleTransactionBusinessExceptions(
            RuntimeException ex, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TransactionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTransactionNotFoundException(
            TransactionNotFoundException ex, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(
            Exception ex, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
