package com.inditrad.service;

import com.inditrad.entity.Commodity;
import com.inditrad.repository.CommodityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommodityPriceService {

    private final CommodityRepository commodityRepository;
    private final Random random = new Random();

    @Scheduled(fixedRate = 30000)
    public void updateCommodityPrices() {
        List<Commodity> commodities = commodityRepository.findAll();
        
        for (Commodity commodity : commodities) {
            BigDecimal currentPrice = commodity.getCurrentPrice();
            
            double changePercent = (random.nextDouble() - 0.5) * 0.04;
            BigDecimal newPrice = currentPrice.multiply(BigDecimal.valueOf(1 + changePercent))
                .setScale(2, RoundingMode.HALF_UP);
            
            if (newPrice.compareTo(BigDecimal.valueOf(0.01)) < 0) {
                newPrice = BigDecimal.valueOf(0.01);
            }
            
            commodity.setCurrentPrice(newPrice);
            commodity.setLastUpdated(LocalDateTime.now());
            commodityRepository.save(commodity);
        }
        
        log.info("Updated prices for {} commodities", commodities.size());
    }
}
