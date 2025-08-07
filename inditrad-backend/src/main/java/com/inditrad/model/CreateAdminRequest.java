package com.inditrad.model;

import lombok.Data;

@Data
public class CreateAdminRequest {
    private String username;
    private String password;
    private String name;
    private String mobile;
}