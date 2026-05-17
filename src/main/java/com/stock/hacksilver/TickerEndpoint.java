package com.stock.hacksilver;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TickerEndpoint {

    private final TickerRepository tickerRepository;

    public TickerEndpoint(TickerRepository tickerRepository) {
        this.tickerRepository = tickerRepository;
    }

    @GetMapping("/tickers")
    public List<Ticker> getTickers() {
        return tickerRepository.findAll();
    }

    @PostMapping("/tickers/{symbol}")
    public Ticker addTicker(@PathVariable String symbol) {
        return tickerRepository.save(new Ticker(symbol.toUpperCase()));
    }

    @DeleteMapping("/tickers/{symbol}")
    public void deleteTicker(@PathVariable String symbol) {
        tickerRepository.deleteById(symbol.toUpperCase());
    }
}
