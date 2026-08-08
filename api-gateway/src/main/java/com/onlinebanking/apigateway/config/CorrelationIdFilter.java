package com.onlinebanking.apigateway.config;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

/**
 * Global filter that ensures every request flowing through the gateway carries
 * a unique {@code X-Correlation-ID} header for request tracing.
 *
 * <p><b>Behavior:</b></p>
 * <ul>
 *   <li>If the incoming request already has {@code X-Correlation-ID}, it is preserved.</li>
 *   <li>If absent, a new UUID is generated and added to both the request (forwarded to
 *       downstream services) and the response (returned to the client).</li>
 *   <li>The correlation ID is also set in SLF4J MDC so the gateway's own log lines
 *       include it (Step 15 enhancement).</li>
 * </ul>
 *
 * <p><b>Scope:</b> This is forward-looking scaffolding. Downstream services consume
 * this header via their own CorrelationIdLoggingFilter (Step 15).</p>
 */
@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(CorrelationIdFilter.class);
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String MDC_KEY = "correlationId";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String correlationId = request.getHeaders().getFirst(CORRELATION_ID_HEADER);

        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
            logger.debug("[CorrelationId] Generated new ID: {} for {}", correlationId, request.getPath());
        } else {
            logger.debug("[CorrelationId] Using existing ID: {} for {}", correlationId, request.getPath());
        }

        // Set MDC for the gateway's own log lines (Step 15)
        MDC.put(MDC_KEY, correlationId);

        // Add to request headers (forwarded to downstream service)
        final String finalCorrelationId = correlationId;
        ServerHttpRequest mutatedRequest = request.mutate()
                .header(CORRELATION_ID_HEADER, finalCorrelationId)
                .build();

        // Add to response headers (returned to client)
        exchange.getResponse().getHeaders().set(CORRELATION_ID_HEADER, finalCorrelationId);

        return chain.filter(exchange.mutate().request(mutatedRequest).build())
                .doFinally(signalType -> MDC.remove(MDC_KEY));
    }

    @Override
    public int getOrder() {
        // Run early — before route-specific filters, so all downstream calls get the ID.
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }
}
