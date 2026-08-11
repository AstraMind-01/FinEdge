package com.onlinebanking.account.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WatchlistRequest {

    @NotBlank(message = "Instrument ID is required")
    private String instrumentId;

    @NotBlank(message = "Symbol is required")
    private String symbol;

    @NotBlank(message = "Instrument Name is required")
    private String instrumentName;

    private String instrumentType; // STOCK, MUTUAL_FUND, ETF

    private String exchange; // NSE, BSE, AMFI

    private String notes;

    private Integer displayOrder;
}
