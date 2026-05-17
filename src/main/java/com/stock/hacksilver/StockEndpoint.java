package com.stock.hacksilver;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
public class StockEndpoint {

    private final RestClient restClient = RestClient.create();

    @Value("${finnhub.api.key}")
    private String apiKey;

    @GetMapping("/stocks")
    public List<StockPrice> getStocks(@RequestParam String symbols) {
        return Arrays.stream(symbols.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .map(this::getStockPrice)
                .toList();
    }

    @GetMapping("/symbols/search")
    public List<SymbolSearchResult> searchSymbols(@RequestParam String query) {
        FinnhubSymbolSearchResponse response = restClient.get()
            .uri("https://finnhub.io/api/v1/search?q=" + query + "&token=" + apiKey)
            .retrieve()
            .body(FinnhubSymbolSearchResponse.class);

        if (response == null || response.result() == null) {
        return List.of();
        }

        return response.result()
            .stream()
            .limit(10)
            .toList();
    }

    private StockPrice getStockPrice(String symbol) {
        try {
            FinnhubQuote quote = restClient.get()
                    .uri("https://finnhub.io/api/v1/quote?symbol=" + symbol + "&token=" + apiKey)
                    .retrieve()
                    .body(FinnhubQuote.class);

            if (quote == null || quote.c() == 0) {
                return StockPrice.error(symbol, "No data");
            }

            double change = quote.c() - quote.pc();
            double changePercent = quote.pc() == 0 ? 0 : (change / quote.pc()) * 100;

            return new StockPrice(
                    symbol,
                    quote.c(),
                    quote.pc(),
                    change,
                    changePercent,
                    quote.h(),
                    quote.l(),
                    quote.o(),
                    "OK"
            );

        } catch (Exception e) {
            e.printStackTrace();
            return StockPrice.error(symbol, "Error");
        }
    }

    public record FinnhubQuote(
            double c,
            double h,
            double l,
            double o,
            double pc
    ) {}

    public record StockPrice(
            String symbol,
            double currentPrice,
            double previousClose,
            double change,
            double changePercent,
            double high,
            double low,
            double open,
            String status
    ) {
        public static StockPrice error(String symbol, String status) {
            return new StockPrice(symbol, 0, 0, 0, 0, 0, 0, 0, status);
        }
    }

    public record FinnhubSymbolSearchResponse(
        int count,
        List<SymbolSearchResult> result
    ) {}

    public record SymbolSearchResult(
        String description,
        String displaySymbol,
        String symbol,
        String type
    ) {}
}