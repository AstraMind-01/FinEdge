package com.onlinebanking.account.service;

import com.onlinebanking.account.dto.MarketDataDTO;
import com.onlinebanking.account.dto.WatchlistRequest;
import com.onlinebanking.account.dto.WatchlistResponse;
import com.onlinebanking.account.entity.WatchlistEntity;
import com.onlinebanking.account.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final MarketDataService marketDataService;

    @Transactional
    public List<WatchlistResponse> getUserWatchlist(String username) {
        String effectiveUsername = username != null ? username : "soumya";
        List<WatchlistEntity> items = watchlistRepository.findByUsernameOrderByDisplayOrderAscCreatedAtAsc(effectiveUsername);

        // Seed initial default watchlist items if user has no saved items yet
        if (items.isEmpty()) {
            log.info("Seeding default watchlist items for user: {}", effectiveUsername);
            seedDefaultWatchlist(effectiveUsername);
            items = watchlistRepository.findByUsernameOrderByDisplayOrderAscCreatedAtAsc(effectiveUsername);
        }

        return items.stream().map(item -> {
            MarketDataDTO marketData = marketDataService.getMarketData(item.getInstrumentId());
            return WatchlistResponse.builder()
                    .id(item.getId())
                    .username(item.getUsername())
                    .instrumentId(item.getInstrumentId())
                    .symbol(item.getSymbol())
                    .instrumentName(item.getInstrumentName())
                    .instrumentType(item.getInstrumentType())
                    .exchange(item.getExchange())
                    .notes(item.getNotes())
                    .displayOrder(item.getDisplayOrder())
                    .createdAt(item.getCreatedAt())
                    .updatedAt(item.getUpdatedAt())
                    .marketData(marketData)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public WatchlistResponse addToWatchlist(WatchlistRequest request, String username) {
        String effectiveUsername = username != null ? username : "soumya";
        String instId = request.getInstrumentId().toUpperCase();

        log.info("Adding instrument {} to watchlist for user {}", instId, effectiveUsername);

        if (watchlistRepository.existsByUsernameAndInstrumentId(effectiveUsername, instId)) {
            throw new IllegalArgumentException("Instrument " + request.getInstrumentName() + " is already in your watchlist.");
        }

        WatchlistEntity entity = WatchlistEntity.builder()
                .username(effectiveUsername)
                .instrumentId(instId)
                .symbol(request.getSymbol() != null ? request.getSymbol() : instId)
                .instrumentName(request.getInstrumentName())
                .instrumentType(request.getInstrumentType() != null ? request.getInstrumentType() : "STOCK")
                .exchange(request.getExchange() != null ? request.getExchange() : "NSE")
                .notes(request.getNotes())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();

        WatchlistEntity saved = watchlistRepository.save(entity);
        MarketDataDTO mData = marketDataService.getMarketData(saved.getInstrumentId());

        return WatchlistResponse.builder()
                .id(saved.getId())
                .username(saved.getUsername())
                .instrumentId(saved.getInstrumentId())
                .symbol(saved.getSymbol())
                .instrumentName(saved.getInstrumentName())
                .instrumentType(saved.getInstrumentType())
                .exchange(saved.getExchange())
                .notes(saved.getNotes())
                .displayOrder(saved.getDisplayOrder())
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .marketData(mData)
                .build();
    }

    @Transactional
    public void removeFromWatchlist(String instrumentId, String username) {
        String effectiveUsername = username != null ? username : "soumya";
        String instId = instrumentId.toUpperCase();

        log.info("Removing instrument {} from watchlist for user {}", instId, effectiveUsername);
        watchlistRepository.deleteByUsernameAndInstrumentId(effectiveUsername, instId);
    }

    @Transactional
    public WatchlistResponse updateWatchlist(String instrumentId, WatchlistRequest request, String username) {
        String effectiveUsername = username != null ? username : "soumya";
        String instId = instrumentId.toUpperCase();

        WatchlistEntity entity = watchlistRepository.findByUsernameAndInstrumentId(effectiveUsername, instId)
                .orElseThrow(() -> new IllegalArgumentException("Watchlist item not found: " + instrumentId));

        if (request.getNotes() != null) {
            entity.setNotes(request.getNotes());
        }
        if (request.getDisplayOrder() != null) {
            entity.setDisplayOrder(request.getDisplayOrder());
        }

        WatchlistEntity saved = watchlistRepository.save(entity);
        MarketDataDTO mData = marketDataService.getMarketData(saved.getInstrumentId());

        return WatchlistResponse.builder()
                .id(saved.getId())
                .username(saved.getUsername())
                .instrumentId(saved.getInstrumentId())
                .symbol(saved.getSymbol())
                .instrumentName(saved.getInstrumentName())
                .instrumentType(saved.getInstrumentType())
                .exchange(saved.getExchange())
                .notes(saved.getNotes())
                .displayOrder(saved.getDisplayOrder())
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .marketData(mData)
                .build();
    }

    private void seedDefaultWatchlist(String username) {
        List<WatchlistEntity> defaults = List.of(
                WatchlistEntity.builder().username(username).instrumentId("TATAMOTORS").symbol("TATAMOTORS.NS").instrumentName("Tata Motors").instrumentType("STOCK").exchange("NSE").displayOrder(1).build(),
                WatchlistEntity.builder().username(username).instrumentId("HDFC_FLEXI").symbol("101881").instrumentName("HDFC Flexi Cap Fund").instrumentType("MUTUAL_FUND").exchange("AMFI").displayOrder(2).build(),
                WatchlistEntity.builder().username(username).instrumentId("INFY").symbol("INFY.NS").instrumentName("Infosys").instrumentType("STOCK").exchange("NSE").displayOrder(3).build()
        );
        watchlistRepository.saveAll(defaults);
    }
}
