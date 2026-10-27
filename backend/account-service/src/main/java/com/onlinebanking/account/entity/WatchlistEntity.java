package com.onlinebanking.account.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "watchlist_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"username", "instrumentId"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WatchlistEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String instrumentId; // e.g. TATAMOTORS, HDFC_FLEXI, INFY, RELIANCE, TCS

    @Column(nullable = false)
    private String symbol; // e.g. TATAMOTORS.NS, 101881, INFY.NS

    @Column(nullable = false)
    private String instrumentName; // e.g. Tata Motors, HDFC Flexi Cap Fund

    @Column(nullable = false)
    private String instrumentType; // STOCK, MUTUAL_FUND, ETF

    @Column(nullable = false)
    private String exchange; // NSE, BSE, AMFI

    private String notes;

    private Integer displayOrder;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
