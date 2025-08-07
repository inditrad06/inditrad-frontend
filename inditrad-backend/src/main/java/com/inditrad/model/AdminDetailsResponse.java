package com.inditrad.model;

import com.inditrad.entity.Admin;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminDetailsResponse {
    private Admin admin;
    private long userCount;
}
