package com.finedge.admin.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "approval_requests")
@Getter
@Setter
public class ApprovalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Type type;

    @Column(name = "reference_id", nullable = false, length = 100)
    private String referenceId;

    @Column(name = "requested_amount", precision = 15, scale = 2)
    private BigDecimal requestedAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "first_approver_id")
    private AdminUser firstApprover;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "second_approver_id")
    private AdminUser secondApprover;

    @Column(name = "sla_deadline")
    private OffsetDateTime slaDeadline;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    public enum Type { HIGH_VALUE_TRANSFER, LOAN, BENEFICIARY, ACCOUNT_CHANGE }
    public enum Status { PENDING, PARTIALLY_APPROVED, APPROVED, REJECTED }
}
