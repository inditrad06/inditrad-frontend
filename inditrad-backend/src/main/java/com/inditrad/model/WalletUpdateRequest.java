package com.inditrad.model;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WalletUpdateRequest {
    private BigDecimal amount;
    private String operation; // "ADD" or "SUBTRACT"
}