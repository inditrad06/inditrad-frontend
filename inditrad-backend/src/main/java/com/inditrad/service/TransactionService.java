
package com.inditrad.service;


import lombok.extern.slf4j.Slf4j;

import com.inditrad.entity.*;
import com.inditrad.model.TransactionRequest;
import com.inditrad.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final AppUserRepository userRepository;
    private final CommodityRepository commodityRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;

    public Transaction placeTransaction(TransactionRequest request) {
        AppUser user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Commodity commodity = commodityRepository.findById(request.getCommodityId())
                .orElseThrow(() -> new RuntimeException("Commodity not found"));

        Transaction txn = Transaction.builder()
                .user(user)
                .commodity(commodity)
                .quantity(request.getQuantity())
                .type(request.getTransactionType())
                .price(commodity.getCurrentPrice())
                .status("PENDING")
                .timestamp(LocalDateTime.now())
                .admin(user.getAdmin())
                .build();
        transactionRepository.save(txn);

        Notification note = new Notification();
        note.setAdmin(user.getAdmin());
        note.setMessage("New " + request.getTransactionType() + " request by user: " + user.getUsername());
        note.setReadStatus(false);
        note.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(note);

        return txn;
    }

    public List<Transaction> getAllOrders() {
        return transactionRepository.findAll();
    }

    public Transaction processOrder(Long orderId, String action) {
        Transaction transaction = transactionRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if ("approve".equals(action)) {
            transaction.setStatus("APPROVED");
            AppUser user = transaction.getUser();
            BigDecimal amount = transaction.getPrice().multiply(transaction.getQuantity());
            
            if ("BUY".equals(transaction.getType())) {
                user.setWalletBalance(user.getWalletBalance().subtract(amount));
            } else if ("SELL".equals(transaction.getType())) {
                user.setWalletBalance(user.getWalletBalance().add(amount));
            }
            userRepository.save(user);
        } else if ("reject".equals(action)) {
            transaction.setStatus("REJECTED");
        }
        
        return transactionRepository.save(transaction);
    }
}
