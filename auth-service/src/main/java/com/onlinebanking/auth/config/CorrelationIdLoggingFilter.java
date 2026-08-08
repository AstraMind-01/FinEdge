package com.onlinebanking.auth.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Servlet filter that reads the X-Correlation-ID header (set by the API Gateway's
 * CorrelationIdFilter in Step 14) and places it into SLF4J's MDC so every log line
 * for this request automatically includes the correlation ID.
 *
 * <p>If the header is missing (e.g. direct call bypassing the gateway during local
 * dev/testing), a new UUID is generated so the service still functions standalone.</p>
 *
 * <p>The MDC is cleared in a finally block to prevent leaking into subsequent requests
 * on the same thread (servlet container thread pools reuse threads).</p>
 *
 * <p>Order: runs BEFORE JwtAuthenticationFilter so correlation ID is available in
 * log lines even for auth failures.</p>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(CorrelationIdLoggingFilter.class);
    private static final String HEADER_NAME = "X-Correlation-ID";
    private static final String MDC_KEY = "correlationId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String correlationId = request.getHeader(HEADER_NAME);

        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
            log.debug("No {} header found — generated: {}", HEADER_NAME, correlationId);
        }

        try {
            MDC.put(MDC_KEY, correlationId);

            // Also set on response for direct-to-service calls (gateway already does
            // this for routed requests, but this is a defensive measure)
            response.setHeader(HEADER_NAME, correlationId);

            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }
}
