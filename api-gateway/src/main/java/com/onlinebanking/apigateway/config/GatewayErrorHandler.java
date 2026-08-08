package com.onlinebanking.apigateway.config;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

/**
 * Global error handler for the API Gateway.
 *
 * <p>Catches exceptions thrown during request routing — most commonly when a
 * downstream service is unreachable (connection refused, timeout) — and returns
 * a clean JSON error response instead of the default Spring Cloud Gateway HTML
 * error page or raw stack trace.</p>
 *
 * <p>The response shape matches the {@code ErrorResponse} record used across all
 * Java services in this project:
 * <pre>
 * {
 *   "timestamp": "2024-01-01T12:00:00",
 *   "status": 502,
 *   "error": "Bad Gateway",
 *   "message": "Downstream service is unreachable...",
 *   "path": "/api/v1/auth/login",
 *   "errors": null
 * }
 * </pre></p>
 *
 * <p>{@code @Order(-1)} ensures this handler runs before Spring Boot's default
 * {@code DefaultErrorWebExceptionHandler}.</p>
 */
@Component
@Order(-1)
public class GatewayErrorHandler implements ErrorWebExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GatewayErrorHandler.class);

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        // Don't override if response is already committed
        if (exchange.getResponse().isCommitted()) {
            return Mono.error(ex);
        }

        String path = exchange.getRequest().getPath().value();
        HttpStatus status;
        String error;
        String message;

        if (ex instanceof ResponseStatusException rse) {
            // Spring-originated status exceptions (e.g., 404 no route matched)
            status = HttpStatus.valueOf(rse.getStatusCode().value());
            error = status.getReasonPhrase();
            message = rse.getReason() != null ? rse.getReason() : status.getReasonPhrase();
        } else if (isConnectionRefused(ex)) {
            // Downstream service is not running / unreachable
            status = HttpStatus.BAD_GATEWAY;
            error = "Bad Gateway";
            message = "Downstream service is unreachable. Please ensure the target service is running. "
                    + "If you are running locally, start the required service first.";
            logger.error("[GatewayError] Connection refused for path={}: {}", path, ex.getMessage());
        } else if (isTimeout(ex)) {
            // Downstream service timed out
            status = HttpStatus.GATEWAY_TIMEOUT;
            error = "Gateway Timeout";
            message = "Downstream service did not respond within the allowed time.";
            logger.error("[GatewayError] Timeout for path={}: {}", path, ex.getMessage());
        } else {
            // Catch-all for unexpected errors
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            error = "Internal Server Error";
            message = "An unexpected error occurred at the API Gateway.";
            logger.error("[GatewayError] Unexpected error for path={}", path, ex);
        }

        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\","
                        + "\"message\":\"%s\",\"path\":\"%s\",\"errors\":null}",
                LocalDateTime.now(), status.value(), error,
                escapeJson(message), path
        );

        DataBuffer buffer = exchange.getResponse().bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    /**
     * Checks if the exception chain indicates a connection refused error.
     */
    private boolean isConnectionRefused(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof java.net.ConnectException) {
                return true;
            }
            String msg = current.getMessage();
            if (msg != null && (msg.contains("Connection refused") || msg.contains("connection refused"))) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    /**
     * Checks if the exception chain indicates a timeout error.
     */
    private boolean isTimeout(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof java.util.concurrent.TimeoutException
                    || current instanceof io.netty.handler.timeout.ReadTimeoutException) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    /**
     * Basic JSON string escaping for the message field.
     */
    private String escapeJson(String value) {
        if (value == null) return "";
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
