package com.onlinebanking.apigateway.config;

import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

/**
 * Centralized CORS configuration for the API Gateway.
 *
 * <p><b>Why centralize CORS at the gateway?</b></p>
 * <ul>
 *   <li>The gateway is the single entry point for all external clients (browsers, mobile apps).</li>
 *   <li>Configuring CORS per-service is duplicative and error-prone — one service's misconfiguration
 *       can break the entire frontend.</li>
 *   <li>Centralizing here means downstream services don't need to know about CORS at all.</li>
 * </ul>
 *
 * <p><b>Reactive CorsWebFilter (not WebMvcConfigurer)</b></p>
 * Spring Cloud Gateway runs on Netty (reactive stack), not Servlet.
 * {@code WebMvcConfigurer} is for servlet-based Spring MVC and will not work here.
 * We use {@link CorsWebFilter} from the reactive web package instead.
 */
@Configuration
public class CorsConfig {

    private static final Logger logger = LoggerFactory.getLogger(CorsConfig.class);

    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String allowedOriginsRaw;

    @Bean
    public CorsWebFilter corsWebFilter() {
        List<String> origins = Arrays.stream(allowedOriginsRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        logger.info("[CORS] Allowed origins: {}", origins);

        CorsConfiguration corsConfig = new CorsConfiguration();
        origins.forEach(corsConfig::addAllowedOrigin);

        // Standard methods for a REST API
        corsConfig.addAllowedMethod(HttpMethod.GET);
        corsConfig.addAllowedMethod(HttpMethod.POST);
        corsConfig.addAllowedMethod(HttpMethod.PUT);
        corsConfig.addAllowedMethod(HttpMethod.DELETE);
        corsConfig.addAllowedMethod(HttpMethod.PATCH);
        corsConfig.addAllowedMethod(HttpMethod.OPTIONS);

        // Headers the frontend is allowed to send
        corsConfig.addAllowedHeader(HttpHeaders.AUTHORIZATION);
        corsConfig.addAllowedHeader(HttpHeaders.CONTENT_TYPE);
        corsConfig.addAllowedHeader(HttpHeaders.ACCEPT);
        corsConfig.addAllowedHeader("X-Correlation-ID");
        corsConfig.addAllowedHeader("X-Requested-With");

        // Headers the frontend is allowed to read from responses
        corsConfig.addExposedHeader("X-Correlation-ID");

        // Allow credentials (cookies, Authorization header)
        corsConfig.setAllowCredentials(true);

        // Preflight cache duration (seconds) — browsers cache OPTIONS responses
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
