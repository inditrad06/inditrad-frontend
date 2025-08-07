
package com.inditrad.api;


import lombok.extern.slf4j.Slf4j;

import com.inditrad.entity.Transaction;
import com.inditrad.model.TransactionRequest;
import com.inditrad.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/transaction")
public class TransactionController {

    private final TransactionService transactionService;

    @Operation(summary = "Place transaction", description = "Submit a buy or sell commodity transaction request.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping("/place")
    public Transaction placeTransaction(@RequestBody TransactionRequest request) {
        return transactionService.placeTransaction(request);
    }

    @Operation(summary = "Get all orders", description = "Retrieve all transaction orders.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @GetMapping("/orders")
    public List<Transaction> getAllOrders() {
        return transactionService.getAllOrders();
    }

    @Operation(summary = "Process order", description = "Approve or reject a transaction order.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "404", description = "Order not found"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PutMapping("/orders/{id}/process")
    public Transaction processOrder(@PathVariable Long id, @RequestBody java.util.Map<String, String> request) {
        return transactionService.processOrder(id, request.get("action"));
    }
}
