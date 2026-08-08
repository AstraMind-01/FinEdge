package com.onlinebanking.apigateway.config;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Deque;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

/**
 * In-memory sliding-window rate limiter for API Gateway routes.
 *
 * <p><b>Applied to:</b> Auth endpoints only ({@code /api/v1/auth/**}) to prevent
 * brute-force login/register attempts.</p>
 *
 * <p><b>Algorithm:</b> Sliding window per client IP address.
 * <ul>
 *   <li>Window size: 10 seconds</li>
 *   <li>Max requests per window: 10</li>
 * </ul>
 * When exceeded, returns HTTP 429 Too Many Requests with a JSON body matching
 * the project's {@code ErrorResponse} shape.</p>
 *
 * <p><b>Limitations (honest, for viva):</b></p>
 * <ul>
 *   <li>In-memory only — state lost on gateway restart.</li>
 *   <li>Not distributed-safe — if running multiple gateway instances behind a load
 *       balancer, each instance has its own counter (use Redis-backed
 *       {@code RequestRateLimiter} for distributed rate limiting).</li>
 *   <li>Fine for a single-gateway-instance college project.</li>
 * </ul>
 *
 * <p>Configured as a named filter in {@code application.yml}:
 * <pre>
 * filters:
 *   - name: RateLimitFilter
 * </pre></p>
 */
@Component
public class RateLimitFilter extends AbstractGatewayFilterFactory<RateLimitFilter.Config> {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);

    /** Max requests allowed per sliding window. */
    private static final int MAX_REQUESTS = 10;

    /** Sliding window duration in milliseconds. */
    private static final long WINDOW_MS = 10_000L;

    /**
     * Per-IP request timestamp history.
     * Each deque stores timestamps (epoch millis) of recent requests within the window.
     */
    private final ConcurrentHashMap<String, Deque<Long>> requestLog = new ConcurrentHashMap<>();

    public RateLimitFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String clientIp = extractClientIp(exchange);
            long now = Instant.now().toEpochMilli();
            long windowStart = now - WINDOW_MS;

            // Get or create the request deque for this IP
            Deque<Long> timestamps = requestLog.computeIfAbsent(clientIp,
                    k -> new ConcurrentLinkedDeque<>());

            // Evict timestamps outside the sliding window
            while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= MAX_REQUESTS) {
                logger.warn("[RateLimit] IP {} exceeded {} requests in {}s window — returning 429",
                        clientIp, MAX_REQUESTS, WINDOW_MS / 1000);
                return writeRateLimitResponse(exchange);
            }

            // Record this request
            timestamps.addLast(now);
            return chain.filter(exchange);
        };
    }

    /**
     * Extracts client IP from the request, falling back to "unknown" if not available.
     */
    private String extractClientIp(ServerWebExchange exchange) {
        // Check X-Forwarded-For first (for proxied requests)
        List<String> forwarded = exchange.getRequest().getHeaders().get("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            // X-Forwarded-For can be "client, proxy1, proxy2" — take the first
            String first = forwarded.get(0).split(",")[0].trim();
            if (!first.isEmpty()) {
                return first;
            }
        }

        InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
        if (remoteAddress != null) {
            InetAddress address = remoteAddress.getAddress();
            return address != null ? address.getHostAddress() : "unknown";
        }
        return "unknown";
    }

    /**
     * Writes a 429 Too Many Requests JSON response matching the project's ErrorResponse shape.
     */
    private Mono<Void> writeRateLimitResponse(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String path = exchange.getRequest().getPath().value();
        String body = String.format(
                "{\"timestamp\":\"%s\",\"status\":429,\"error\":\"Too Many Requests\","
                        + "\"message\":\"Rate limit exceeded. Maximum %d requests per %d seconds. Please try again shortly.\","
                        + "\"path\":\"%s\",\"errors\":null}",
                LocalDateTime.now(), MAX_REQUESTS, WINDOW_MS / 1000, path
        );

        DataBuffer buffer = exchange.getResponse().bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    /**
     * Empty config class — required by AbstractGatewayFilterFactory.
     * Could be extended to make MAX_REQUESTS/WINDOW_MS configurable per-route.
     */
    public static class Config {
        // Intentionally empty. Could add configurable fields in the future:
        // private int maxRequests = 10;
        // private long windowSeconds = 10;
    }
}
