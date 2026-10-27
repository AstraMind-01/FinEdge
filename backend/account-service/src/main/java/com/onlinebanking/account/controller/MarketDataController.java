package com.onlinebanking.account.controller;

import com.onlinebanking.account.dto.MarketDataDTO;
import com.onlinebanking.account.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/market-data")
@RequiredArgsConstructor
public class MarketDataController {

    private final MarketDataService marketDataService;

    @GetMapping("/{instrumentId}")
    public ResponseEntity<MarketDataDTO> getMarketData(@PathVariable String instrumentId) {
        MarketDataDTO dto = marketDataService.getMarketData(instrumentId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<MarketDataDTO>> getAllAvailableMarketData() {
        List<MarketDataDTO> list = marketDataService.getAllAvailableInstruments();
        return ResponseEntity.ok(list);
    }
}
