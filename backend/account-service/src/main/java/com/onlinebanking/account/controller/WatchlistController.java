package com.onlinebanking.account.controller;

import com.onlinebanking.account.dto.WatchlistRequest;
import com.onlinebanking.account.dto.WatchlistResponse;
import com.onlinebanking.account.service.WatchlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    public ResponseEntity<List<WatchlistResponse>> getUserWatchlist(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "soumya";
        List<WatchlistResponse> list = watchlistService.getUserWatchlist(username);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> addToWatchlist(
            @Valid @RequestBody WatchlistRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "soumya";
        try {
            WatchlistResponse response = watchlistService.addToWatchlist(request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @DeleteMapping("/{instrumentId}")
    public ResponseEntity<?> removeFromWatchlist(
            @PathVariable String instrumentId,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "soumya";
        watchlistService.removeFromWatchlist(instrumentId, username);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{instrumentId}")
    public ResponseEntity<WatchlistResponse> updateWatchlist(
            @PathVariable String instrumentId,
            @RequestBody WatchlistRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "soumya";
        WatchlistResponse response = watchlistService.updateWatchlist(instrumentId, request, username);
        return ResponseEntity.ok(response);
    }
}
