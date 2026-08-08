package com.onlinebanking.apigateway.config;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import reactor.core.publisher.Mono;

/**
 * Route-level filter that blocks external access to internal-only endpoints
 * through the API Gateway.
 *
 * <p>Applied to the {@code /api/v1/accounts/internal/**} route in application.yml,
 * placed BEFORE the broader {@code /api/v1/accounts/**} route so Spring Cloud Gateway's
 * first-match-wins evaluation blocks the internal path before the general route can match.</p>
 *
 * <p>Returns a 404 Not Found JSON response to make internal endpoints appear as if
 * they don't exist from the gateway's perspective.</p>
 *
 * <p><b>Honest limitation (for viva):</b> This only blocks access through the gateway
 * (port 8080). Direct access to account-service (port 8082) is still possible on the
 * same Docker/host network. True service-to-service isolation would require:
 * <ul>
 *   <li>Kubernetes NetworkPolicy restricting ingress to internal endpoints</li>
 *   <li>Docker network segmentation (separate networks for internal vs external traffic)</li>
 *   <li>Mutual TLS (mTLS) between services</li>
 * </ul>
 * These are out of scope for this college project.</p>
 */
@Component
public class InternalBlockFilter extends AbstractGatewayFilterFactory<InternalBlockFilter.Config> {

    private static final Logger logger = LoggerFactory.getLogger(InternalBlockFilter.class);

    public InternalBlockFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getPath().value();
            logger.warn("[InternalBlock] Blocked external access to internal endpoint: {}", path);

            exchange.getResponse().setStatusCode(HttpStatus.NOT_FOUND);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

            String body = String.format(
                    "{\"timestamp\":\"%s\",\"status\":404,\"error\":\"Not Found\","
                            + "\"message\":\"The requested resource is not available through the API Gateway. "
                            + "Internal endpoints are restricted to service-to-service communication.\","
                            + "\"path\":\"%s\",\"errors\":null}",
                    LocalDateTime.now(), path
            );

            DataBuffer buffer = exchange.getResponse().bufferFactory()
                    .wrap(body.getBytes(StandardCharsets.UTF_8));
            return exchange.getResponse().writeWith(Mono.just(buffer));
        };
    }

    public static class Config {
        // Intentionally empty — no per-route configuration needed.
    }
}
