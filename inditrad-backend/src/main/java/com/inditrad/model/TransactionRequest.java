
package com.inditrad.model;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransactionRequest {
    private Long userId;
    private Long commodityId;
    private BigDecimal quantity;
    private String transactionType; // BUY or SELL
}
