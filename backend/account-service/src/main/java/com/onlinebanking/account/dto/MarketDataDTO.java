package com.onlinebanking.account.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketDataDTO {
    private String instrumentId;
    private String symbol;
    private String name;
    private String type; // STOCK, MUTUAL_FUND, ETF
    private String exchange;
    private BigDecimal currentPrice;
    private String formattedPrice; // e.g. "₹812.40" or "NAV ₹42.15"
    private BigDecimal priceChange;
    private BigDecimal percentChange;
    private String formattedChange; // e.g. "+2.3%" or "-0.4%"
    private Boolean isPositive;
    private String marketState; // MARKET_OPEN, MARKET_CLOSED, DELAYED, API_UNAVAILABLE
    private String currency; // INR
    private String lastUpdated;
}
