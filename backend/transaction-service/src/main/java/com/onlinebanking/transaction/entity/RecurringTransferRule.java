package com.onlinebanking.transaction.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "recurring_transfer_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringTransferRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fromAccountNumber;

    @Column(nullable = false)
    private String toAccountNumber;

    @Column(nullable = false)
    private BigDecimal amount;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecurringFrequency frequency;

    @Column(nullable = false)
    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Integer maxOccurrences;

    @Column(nullable = false)
    private Integer completedOccurrences;

    @Column(nullable = false)
    private Integer consecutiveFailures;

    @Column(nullable = false)
    private LocalDateTime nextRunAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecurringRuleStatus status;

    @Column(nullable = false)
    private String initiatedByUsername;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.completedOccurrences == null) {
            this.completedOccurrences = 0;
        }
        if (this.consecutiveFailures == null) {
            this.consecutiveFailures = 0;
        }
        if (this.status == null) {
            this.status = RecurringRuleStatus.ACTIVE;
        }
    }
}
