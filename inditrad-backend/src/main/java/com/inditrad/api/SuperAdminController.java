
package com.inditrad.api;

import lombok.extern.slf4j.Slf4j;

import com.inditrad.entity.Admin;
import com.inditrad.entity.AppUser;
import com.inditrad.model.AdminDetailsResponse;
import com.inditrad.model.CreateAdminRequest;
import com.inditrad.model.CreateUserRequest;
import com.inditrad.repository.AdminRepository;
import com.inditrad.repository.AppUserRepository;
import com.inditrad.service.AdminService;
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
    private final AdminService adminService;

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

    @Operation(summary = "Create admin", description = "Super admin creates a new admin account.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping("/create-admin")
    public Admin createAdmin(@RequestBody CreateAdminRequest request) {
        return adminService.createAdmin(request);
    }

    @Operation(summary = "Create user", description = "Super admin creates a new user directly.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping("/create-user")
    public AppUser createUser(@RequestBody CreateUserRequest request) {
        return adminService.createUser(request, null);
    }

    @Operation(summary = "Get admin with user count", description = "Get admin details with user count.")
    @GetMapping("/admins/{adminId}/details")
    public AdminDetailsResponse getAdminDetails(@PathVariable Long adminId) {
        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));
        long userCount = appUserRepository.countByAdminId(adminId);
        return new AdminDetailsResponse(admin, userCount);
    }
}
