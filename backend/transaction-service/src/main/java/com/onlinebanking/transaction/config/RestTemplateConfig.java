package com.onlinebanking.transaction.config;

import java.time.Duration;
import org.slf4j.MDC;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;

/**
 * RestTemplate configuration with correlation ID propagation.
 *
 * <p>The interceptor reads the {@code correlationId} from SLF4J MDC (set by
 * {@link CorrelationIdLoggingFilter} on the inbound request) and sets it as
 * the {@code X-Correlation-ID} header on all outbound REST calls.</p>
 *
 * <p>This is the key mechanism that threads the same correlation ID through
 * the multi-hop synchronous path:
 * gateway → transaction-service → account-service / fraud-detection-service.</p>
 */
@Configuration
public class RestTemplateConfig {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String MDC_KEY = "correlationId";

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(3))
                .setReadTimeout(Duration.ofSeconds(3))
                .additionalInterceptors(correlationIdInterceptor())
                .build();
    }

    /**
     * Interceptor that propagates the correlation ID from the current request's
     * MDC context to all outbound RestTemplate calls.
     */
    private ClientHttpRequestInterceptor correlationIdInterceptor() {
        return (HttpRequest request, byte[] body, ClientHttpRequestExecution execution) -> {
            String correlationId = MDC.get(MDC_KEY);
            if (correlationId != null && !correlationId.isBlank()) {
                request.getHeaders().set(CORRELATION_ID_HEADER, correlationId);
            }
            return execution.execute(request, body);
        };
    }
}
