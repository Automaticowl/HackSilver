package com.stock.hacksilver;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("tickers")
public class Ticker {

    @Id
    private String symbol;

    private double buyInPrice;
    private String buyInCurrency;
    private double positionSize;
    private String type;

    public Ticker() {
    }

    public Ticker(String symbol) {
        this.symbol = symbol;
        this.buyInPrice = 0;
        this.buyInCurrency = "USD";
        this.positionSize = 0;
        this.type = "long";
    }

    public String getSymbol() {
        return symbol;
    }

    public double getBuyInPrice() {
        return buyInPrice;
    }

    public void setBuyInPrice(double buyInPrice) {
        this.buyInPrice = buyInPrice;
    }

    public String getBuyInCurrency() {
        return buyInCurrency;
    }

    public void setBuyInCurrency(String buyInCurrency) {
        this.buyInCurrency = buyInCurrency;
    }

    public double getPositionSize() {
        return positionSize;
    }

    public void setPositionSize(double positionSize) {
        this.positionSize = positionSize;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}