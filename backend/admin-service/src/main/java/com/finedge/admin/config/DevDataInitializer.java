package com.finedge.admin.config;

import com.finedge.admin.entity.AdminUser;
import com.finedge.admin.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("dev")
public class DevDataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DevDataInitializer.class);

    @Bean
    CommandLineRunner initAdminPassword(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            adminUserRepository.findByUsername("admin").ifPresent(admin -> {
                // Re-encode the password with BCrypt properly
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                adminUserRepository.save(admin);
                logger.info("✅ Dev admin password set to 'Admin@123'");
            });
        };
    }
}
