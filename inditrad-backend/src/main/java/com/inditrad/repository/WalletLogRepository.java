package com.inditrad.repository;

import com.inditrad.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletLogRepository extends JpaRepository<WalletLog, Long> {
    List<WalletLog> findByUserId(Long userId);
}
