package com.onlinebanking.transaction;

import com.onlinebanking.transaction.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class TransactionServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(TransactionServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(TransactionServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner verifyDatabaseConnection(TransactionRepository transactionRepository) {
        return args -> {
            long count = transactionRepository.count();
            log.info(">>> Database Connection Verified for transaction-service (transaction_db). Total Transaction records: {}", count);
        };
    }
}
