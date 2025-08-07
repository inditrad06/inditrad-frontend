package com.inditrad.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    private BigDecimal changeAmount;
    private String transactionType;
    private String remarks;
    private LocalDateTime timestamp = LocalDateTime.now();
}
