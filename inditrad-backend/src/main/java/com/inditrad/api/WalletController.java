package com.inditrad.api;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;

import com.inditrad.model.WalletUpdateRequest;
import com.inditrad.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    @Operation(summary = "Update wallet", description = "Update a user's wallet balance.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PutMapping("/{userId}/update")
    public BigDecimal updateWallet(@PathVariable Long userId, @RequestBody WalletUpdateRequest request) {
        return walletService.updateWallet(userId, request.getAmount(), request.getOperation());
    }
}