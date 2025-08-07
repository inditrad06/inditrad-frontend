package com.inditrad.model;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateUserRequest {
    private String username;
    private String password;
    private String name;
    private String mobile;
    private BigDecimal initialWalletBalance;
}