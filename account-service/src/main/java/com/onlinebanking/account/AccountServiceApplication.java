package com.onlinebanking.account;

import com.onlinebanking.account.repository.AccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AccountServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(AccountServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(AccountServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner verifyDatabaseConnection(AccountRepository accountRepository) {
        return args -> {
            long count = accountRepository.count();
            log.info(">>> Database Connection Verified for account-service (account_db). Total Account records: {}", count);
        };
    }
}
