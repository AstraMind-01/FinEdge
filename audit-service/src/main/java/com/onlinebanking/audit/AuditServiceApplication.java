package com.onlinebanking.audit;

import com.onlinebanking.audit.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AuditServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(AuditServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(AuditServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner verifyDatabaseConnection(AuditLogRepository auditLogRepository) {
        return args -> {
            long count = auditLogRepository.count();
            log.info(">>> Database Connection Verified for audit-service (audit_db). Total AuditLog records: {}", count);
        };
    }
}
