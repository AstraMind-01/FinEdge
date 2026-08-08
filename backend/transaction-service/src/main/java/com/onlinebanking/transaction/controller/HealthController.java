package com.onlinebanking.transaction.controller;

import com.onlinebanking.transaction.dto.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @Value("${spring.application.name}")
    private String serviceName;

    @GetMapping("/health")
    public HealthResponse getHealthStatus() {
        return new HealthResponse(serviceName, "UP");
    }
}
