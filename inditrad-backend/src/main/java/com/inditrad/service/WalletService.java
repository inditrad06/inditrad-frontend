package com.inditrad.service;


import lombok.extern.slf4j.Slf4j;

import com.inditrad.entity.AppUser;
import com.inditrad.entity.WalletLog;
import com.inditrad.repository.AppUserRepository;
import com.inditrad.repository.WalletLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final AppUserRepository userRepository;
    private final WalletLogRepository walletLogRepository;

    public BigDecimal updateWallet(Long userId, BigDecimal amount, String operation) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal updatedBalance = user.getWalletBalance();

        if ("ADD".equalsIgnoreCase(operation)) {
            updatedBalance = updatedBalance.add(amount);
        } else if ("SUBTRACT".equalsIgnoreCase(operation)) {
            if (updatedBalance.compareTo(amount) < 0) throw new RuntimeException("Insufficient funds");
            updatedBalance = updatedBalance.subtract(amount);
        } else {
            throw new RuntimeException("Invalid operation");
        }

        user.setWalletBalance(updatedBalance);
        userRepository.save(user);
        
        String transactionType = "";
        String remarks = "";
        
        if ("ADD".equalsIgnoreCase(operation)) {
            transactionType = "CREDIT";
            remarks = "Amount added to wallet";
        } else if ("SUBTRACT".equalsIgnoreCase(operation)) {
            transactionType = "DEBIT";
            remarks = "Amount deducted from wallet";
        }

        WalletLog log = WalletLog.builder()
                .user(user)
                .changeAmount(amount)
                .transactionType(transactionType)
                .timestamp(LocalDateTime.now())
                .remarks(remarks)
                .build();
        walletLogRepository.save(log);

        return updatedBalance;
    }
}
