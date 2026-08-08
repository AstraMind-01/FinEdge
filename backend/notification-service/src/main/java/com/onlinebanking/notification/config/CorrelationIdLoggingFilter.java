package com.onlinebanking.notification.config;

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
 * Servlet filter that reads the X-Correlation-ID header and places it into SLF4J's MDC.
 *
 * <p>For notification-service, most traffic comes via Kafka (not HTTP), so this filter
 * primarily serves any future HTTP endpoints (e.g. GET /api/v1/notifications). The Kafka
 * consumer path gets its correlation ID from the TransactionEvent.correlationId field
 * instead (set in the Kafka listener method, not this filter).</p>
 *
 * <p><b>Honest scope boundary:</b> MDC is thread-local. This filter sets MDC for the
 * servlet thread handling the HTTP request. Kafka consumer threads are separate and do
 * NOT inherit this MDC. The Kafka listener manually sets/clears MDC from the event field.</p>
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
            response.setHeader(HEADER_NAME, correlationId);
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }
}
