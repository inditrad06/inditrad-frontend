
package com.inditrad.api;

import lombok.extern.slf4j.Slf4j;

import com.inditrad.entity.Admin;
import com.inditrad.entity.AppUser;
import com.inditrad.repository.AdminRepository;
import com.inditrad.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/superadmin")
public class SuperAdminController {

    private final AdminRepository adminRepository;
    private final AppUserRepository appUserRepository;

    @Operation(summary = "Get details", description = "Retrieve relevant data from the system.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @GetMapping("/admins")
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    @Operation(summary = "Get all users", description = "Retrieve all users in the system.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @GetMapping("/users")
    public List<AppUser> getAllUsers() {
        return appUserRepository.findAll();
    }
}
