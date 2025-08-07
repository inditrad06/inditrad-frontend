package com.inditrad.service;

import com.inditrad.entity.Admin;
import com.inditrad.entity.AppUser;
import com.inditrad.entity.Commodity;
import com.inditrad.entity.SuperAdmin;
import com.inditrad.repository.AdminRepository;
import com.inditrad.repository.AppUserRepository;
import com.inditrad.repository.CommodityRepository;
import com.inditrad.repository.SuperAdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataInitializer {

    private final SuperAdminRepository superAdminRepository;
    private final AdminRepository adminRepository;
    private final AppUserRepository appUserRepository;
    private final CommodityRepository commodityRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initializeData() {
        log.info("Initializing application data...");
        
        initializeSuperAdmin();
        initializeCommodities();
        initializeSampleData();
        
        log.info("Data initialization completed.");
    }

    private void initializeSuperAdmin() {
        if (superAdminRepository.findByUsername("superadmin").isEmpty()) {
            SuperAdmin superAdmin = SuperAdmin.builder()
                    .username("superadmin")
                    .password(passwordEncoder.encode("admin123"))
                    .name("Super Administrator")
                    .email("superadmin@inditrad.com")
                    .mobile("9999999999")
                    .status("ACTIVE")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            
            superAdminRepository.save(superAdmin);
            log.info("Super Admin created: superadmin/admin123");
        }
    }

    private void initializeCommodities() {
        if (commodityRepository.count() == 0) {
            Commodity[] commodities = {
                Commodity.builder().name("Gold").unit("oz").currentPrice(new BigDecimal("2000.00")).lastUpdated(LocalDateTime.now()).build(),
                Commodity.builder().name("Silver").unit("oz").currentPrice(new BigDecimal("25.50")).lastUpdated(LocalDateTime.now()).build(),
                Commodity.builder().name("Wheat").unit("bushel").currentPrice(new BigDecimal("7.25")).lastUpdated(LocalDateTime.now()).build(),
                Commodity.builder().name("Rice").unit("cwt").currentPrice(new BigDecimal("15.80")).lastUpdated(LocalDateTime.now()).build(),
                Commodity.builder().name("Crude Oil").unit("barrel").currentPrice(new BigDecimal("75.30")).lastUpdated(LocalDateTime.now()).build(),
                Commodity.builder().name("Copper").unit("lb").currentPrice(new BigDecimal("4.15")).lastUpdated(LocalDateTime.now()).build(),
                Commodity.builder().name("Cotton").unit("lb").currentPrice(new BigDecimal("0.72")).lastUpdated(LocalDateTime.now()).build()
            };
            
            for (Commodity commodity : commodities) {
                commodityRepository.save(commodity);
            }
            log.info("Commodities initialized: {} items", commodities.length);
        }
    }

    private void initializeSampleData() {
        SuperAdmin superAdmin = superAdminRepository.findByUsername("superadmin").orElse(null);
        if (superAdmin != null && adminRepository.count() == 0) {
            Admin admin = Admin.builder()
                    .username("admin1")
                    .password(passwordEncoder.encode("admin123"))
                    .name("Sample Admin")
                    .email("admin1@inditrad.com")
                    .mobile("8888888888")
                    .status("ACTIVE")
                    .createdBy(superAdmin)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            
            adminRepository.save(admin);
            
            AppUser user = AppUser.builder()
                    .username("user1")
                    .password(passwordEncoder.encode("user123"))
                    .name("Sample User")
                    .email("user1@inditrad.com")
                    .mobile("7777777777")
                    .walletBalance(new BigDecimal("10000.00"))
                    .admin(admin)
                    .status("ACTIVE")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            
            appUserRepository.save(user);
            log.info("Sample admin and user created");
        }
    }
}
