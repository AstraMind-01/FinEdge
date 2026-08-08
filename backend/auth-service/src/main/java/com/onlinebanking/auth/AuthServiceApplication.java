package com.onlinebanking.auth;

import com.onlinebanking.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AuthServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner verifyDatabaseConnection(UserRepository userRepository) {
        return args -> {
            long count = userRepository.count();
            log.info(">>> Database Connection Verified for auth-service (auth_db). Total User records: {}", count);
        };
    }
}
