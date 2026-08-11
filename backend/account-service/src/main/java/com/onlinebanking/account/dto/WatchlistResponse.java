package com.onlinebanking.account.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WatchlistResponse {
    private Long id;
    private String username;
    private String instrumentId;
    private String symbol;
    private String instrumentName;
    private String instrumentType;
    private String exchange;
    private String notes;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Enriched real-time market data
    private MarketDataDTO marketData;
}
