package com.inditrad.api;

import lombok.extern.slf4j.Slf4j;

import com.inditrad.entity.Commodity;
import com.inditrad.repository.CommodityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/commodities")
public class CommodityController {

    private final CommodityRepository commodityRepository;

    @Operation(summary = "Get all commodities", description = "Retrieve all commodities with current prices.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @GetMapping
    public List<Commodity> getAllCommodities() {
        return commodityRepository.findAll();
    }

    @Operation(summary = "Update commodity price", description = "Update the price of a specific commodity.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "404", description = "Commodity not found"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PutMapping("/{id}/price")
    public ResponseEntity<Commodity> updateCommodityPrice(@PathVariable Long id, @RequestBody Map<String, BigDecimal> request) {
        Commodity commodity = commodityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commodity not found"));
        
        commodity.setCurrentPrice(request.get("price"));
        commodity.setLastUpdated(LocalDateTime.now());
        
        return ResponseEntity.ok(commodityRepository.save(commodity));
    }
}
