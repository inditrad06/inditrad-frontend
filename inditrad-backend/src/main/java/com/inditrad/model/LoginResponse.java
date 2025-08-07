package com.inditrad.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String access_token;
    private String token_type;
    private Object user;
}
