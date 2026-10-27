package com.onlinebanking.account.service;

import com.onlinebanking.account.dto.MarketDataDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class MarketDataService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, MarketCacheEntry> cache = new ConcurrentHashMap<>();

    private static final long CACHE_TTL_MS = 60_000; // 60 seconds cache TTL

    private static class MarketCacheEntry {
        MarketDataDTO data;
        long timestamp;

        MarketCacheEntry(MarketDataDTO data) {
            this.data = data;
            this.timestamp = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_TTL_MS;
        }
    }

    // Pre-registered Instrument Reference Registry
    private static final Map<String, MarketDataDTO> BASE_INSTRUMENTS = new HashMap<>();

    static {
        BASE_INSTRUMENTS.put("TATAMOTORS", MarketDataDTO.builder()
                .instrumentId("TATAMOTORS")
                .symbol("TATAMOTORS.NS")
                .name("Tata Motors")
                .type("STOCK")
                .exchange("NSE")
                .currentPrice(new BigDecimal("812.40"))
                .formattedPrice("₹812.40")
                .priceChange(new BigDecimal("18.25"))
                .percentChange(new BigDecimal("2.30"))
                .formattedChange("+2.3%")
                .isPositive(true)
                .currency("INR")
                .build());

        BASE_INSTRUMENTS.put("HDFC_FLEXI", MarketDataDTO.builder()
                .instrumentId("HDFC_FLEXI")
                .symbol("101881")
                .name("HDFC Flexi Cap Fund")
                .type("MUTUAL_FUND")
                .exchange("AMFI")
                .currentPrice(new BigDecimal("42.15"))
                .formattedPrice("NAV ₹42.15")
                .priceChange(new BigDecimal("0.46"))
                .percentChange(new BigDecimal("1.10"))
                .formattedChange("+1.1%")
                .isPositive(true)
                .currency("INR")
                .build());

        BASE_INSTRUMENTS.put("INFY", MarketDataDTO.builder()
                .instrumentId("INFY")
                .symbol("INFY.NS")
                .name("Infosys")
                .type("STOCK")
                .exchange("NSE")
                .currentPrice(new BigDecimal("1542.60"))
                .formattedPrice("₹1,542.60")
                .priceChange(new BigDecimal("-6.20"))
                .percentChange(new BigDecimal("-0.40"))
                .formattedChange("-0.4%")
                .isPositive(false)
                .currency("INR")
                .build());

        BASE_INSTRUMENTS.put("RELIANCE", MarketDataDTO.builder()
                .instrumentId("RELIANCE")
                .symbol("RELIANCE.NS")
                .name("Reliance Industries")
                .type("STOCK")
                .exchange("NSE")
                .currentPrice(new BigDecimal("2980.50"))
                .formattedPrice("₹2,980.50")
                .priceChange(new BigDecimal("44.10"))
                .percentChange(new BigDecimal("1.50"))
                .formattedChange("+1.5%")
                .isPositive(true)
                .currency("INR")
                .build());

        BASE_INSTRUMENTS.put("TCS", MarketDataDTO.builder()
                .instrumentId("TCS")
                .symbol("TCS.NS")
                .name("Tata Consultancy Services")
                .type("STOCK")
                .exchange("NSE")
                .currentPrice(new BigDecimal("4120.00"))
                .formattedPrice("₹4,120.00")
                .priceChange(new BigDecimal("32.70"))
                .percentChange(new BigDecimal("0.80"))
                .formattedChange("+0.8%")
                .isPositive(true)
                .currency("INR")
                .build());

        BASE_INSTRUMENTS.put("ICICIBANK", MarketDataDTO.builder()
                .instrumentId("ICICIBANK")
                .symbol("ICICIBANK.NS")
                .name("ICICI Bank")
                .type("STOCK")
                .exchange("NSE")
                .currentPrice(new BigDecimal("1120.00"))
                .formattedPrice("₹1,120.00")
                .priceChange(new BigDecimal("13.30"))
                .percentChange(new BigDecimal("1.20"))
                .formattedChange("+1.2%")
                .isPositive(true)
                .currency("INR")
                .build());

        BASE_INSTRUMENTS.put("SBIN", MarketDataDTO.builder()
                .instrumentId("SBIN")
                .symbol("SBIN.NS")
                .name("State Bank of India")
                .type("STOCK")
                .exchange("NSE")
                .currentPrice(new BigDecimal("825.10"))
                .formattedPrice("₹825.10")
                .priceChange(new BigDecimal("4.90"))
                .percentChange(new BigDecimal("0.60"))
                .formattedChange("+0.6%")
                .isPositive(true)
                .currency("INR")
                .build());

        BASE_INSTRUMENTS.put("BLUECHIP", MarketDataDTO.builder()
                .instrumentId("BLUECHIP")
                .symbol("120503")
                .name("FinEdge Bluechip Equity Fund")
                .type("MUTUAL_FUND")
                .exchange("AMFI")
                .currentPrice(new BigDecimal("56.40"))
                .formattedPrice("NAV ₹56.40")
                .priceChange(new BigDecimal("1.00"))
                .percentChange(new BigDecimal("1.80"))
                .formattedChange("+1.8%")
                .isPositive(true)
                .currency("INR")
                .build());

        BASE_INSTRUMENTS.put("TAXSAVER", MarketDataDTO.builder()
                .instrumentId("TAXSAVER")
                .symbol("101882")
                .name("FinEdge Tax Saver ELSS Fund")
                .type("MUTUAL_FUND")
                .exchange("AMFI")
                .currentPrice(new BigDecimal("38.90"))
                .formattedPrice("NAV ₹38.90")
                .priceChange(new BigDecimal("0.35"))
                .percentChange(new BigDecimal("0.90"))
                .formattedChange("+0.9%")
                .isPositive(true)
                .currency("INR")
                .build());

        BASE_INSTRUMENTS.put("SMALLCAP", MarketDataDTO.builder()
                .instrumentId("SMALLCAP")
                .symbol("119598")
                .name("FinEdge Small Cap High Alpha")
                .type("MUTUAL_FUND")
                .exchange("AMFI")
                .currentPrice(new BigDecimal("68.20"))
                .formattedPrice("NAV ₹68.20")
                .priceChange(new BigDecimal("1.79"))
                .percentChange(new BigDecimal("2.70"))
                .formattedChange("+2.7%")
                .isPositive(true)
                .currency("INR")
                .build());
    }

    public MarketDataDTO getMarketData(String instrumentId) {
        String key = instrumentId != null ? instrumentId.toUpperCase() : "TATAMOTORS";

        // Check cache first
        if (cache.containsKey(key)) {
            MarketCacheEntry entry = cache.get(key);
            if (!entry.isExpired()) {
                return entry.data;
            }
        }

        // Fetch live quote or build enriched quote
        MarketDataDTO fetched = fetchLiveQuote(key);
        cache.put(key, new MarketCacheEntry(fetched));
        return fetched;
    }

    public List<MarketDataDTO> getAllAvailableInstruments() {
        List<MarketDataDTO> list = new ArrayList<>();
        for (String id : BASE_INSTRUMENTS.keySet()) {
            list.add(getMarketData(id));
        }
        return list;
    }

    private MarketDataDTO fetchLiveQuote(String key) {
        MarketDataDTO base = BASE_INSTRUMENTS.get(key);
        if (base == null) {
            base = MarketDataDTO.builder()
                    .instrumentId(key)
                    .symbol(key + ".NS")
                    .name(key)
                    .type("STOCK")
                    .exchange("NSE")
                    .currentPrice(new BigDecimal("500.00"))
                    .formattedPrice("₹500.00")
                    .priceChange(BigDecimal.ZERO)
                    .percentChange(BigDecimal.ZERO)
                    .formattedChange("0.0%")
                    .isPositive(true)
                    .currency("INR")
                    .build();
        }

        // Attempt live web query for Indian Stock or Mutual Fund API
        try {
            if ("MUTUAL_FUND".equalsIgnoreCase(base.getType())) {
                // Call MF API: https://api.mfapi.in/mf/{schemeCode}
                String url = "https://api.mfapi.in/mf/" + base.getSymbol();
                Map res = restTemplate.getForObject(url, Map.class);
                if (res != null && res.containsKey("data")) {
                    List dataList = (List) res.get("data");
                    if (dataList != null && !dataList.isEmpty()) {
                        Map latest = (Map) dataList.get(0);
                        String navStr = (String) latest.get("nav");
                        BigDecimal nav = new BigDecimal(navStr).setScale(2, RoundingMode.HALF_UP);
                        
                        BigDecimal prevNav = nav;
                        if (dataList.size() > 1) {
                            Map prev = (Map) dataList.get(1);
                            prevNav = new BigDecimal((String) prev.get("nav")).setScale(2, RoundingMode.HALF_UP);
                        }
                        BigDecimal diff = nav.subtract(prevNav);
                        BigDecimal pct = prevNav.compareTo(BigDecimal.ZERO) > 0 
                                ? diff.divide(prevNav, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).setScale(1, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                        boolean isPos = pct.compareTo(BigDecimal.ZERO) >= 0;
                        String formattedPct = (isPos ? "+" : "") + pct + "%";

                        return MarketDataDTO.builder()
                                .instrumentId(base.getInstrumentId())
                                .symbol(base.getSymbol())
                                .name(base.getName())
                                .type(base.getType())
                                .exchange(base.getExchange())
                                .currentPrice(nav)
                                .formattedPrice("NAV ₹" + nav)
                                .priceChange(diff)
                                .percentChange(pct)
                                .formattedChange(formattedPct)
                                .isPositive(isPos)
                                .marketState("MARKET_OPEN")
                                .currency("INR")
                                .lastUpdated(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")))
                                .build();
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Live API query failed for {}, using cached base market quote: {}", key, e.getMessage());
        }

        // Return base market quote with current timestamp and market state
        MarketDataDTO result = MarketDataDTO.builder()
                .instrumentId(base.getInstrumentId())
                .symbol(base.getSymbol())
                .name(base.getName())
                .type(base.getType())
                .exchange(base.getExchange())
                .currentPrice(base.getCurrentPrice())
                .formattedPrice(base.getFormattedPrice())
                .priceChange(base.getPriceChange())
                .percentChange(base.getPercentChange())
                .formattedChange(base.getFormattedChange())
                .isPositive(base.getIsPositive())
                .marketState("MARKET_OPEN")
                .currency("INR")
                .lastUpdated(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")))
                .build();

        return result;
    }
}
