package com.inditrad.api;


import lombok.extern.slf4j.Slf4j;

import com.inditrad.entity.Admin;
import com.inditrad.entity.AppUser;
import com.inditrad.model.CreateAdminRequest;
import com.inditrad.model.CreateUserRequest;
import com.inditrad.repository.AppUserRepository;
import com.inditrad.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class AdminController {

    private final AdminService adminService;
    private final AppUserRepository appUserRepository;


    @Operation(summary = "Create user", description = "Admin creates a new user with initial wallet balance.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping("/admin/{adminId}/create-user")
    public AppUser createUser(@PathVariable Long adminId, @RequestBody CreateUserRequest request) {
        return adminService.createUser(request, adminId);
    }

    @Operation(summary = "Get details", description = "Retrieve relevant data from the system.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @GetMapping("/admin/{adminId}/users")
    public List<AppUser> getUsersByAdmin(@PathVariable Long adminId) {
        return appUserRepository.findByAdminId(adminId);
    }
    
    @Operation(summary = "Get all users", description = "Retrieve all users for admin view.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @GetMapping("/users")
    public List<AppUser> getAllUsers() {
        return appUserRepository.findAll();
    }
    
    @Operation(summary = "Update user status", description = "Enable or disable a user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PutMapping("/users/{userId}/status")
    public AppUser updateUserStatus(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        if (!"ACTIVE".equals(status) && !"INACTIVE".equals(status)) {
            throw new IllegalArgumentException("Status must be either ACTIVE or INACTIVE");
        }
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        return appUserRepository.save(user);
    }
    
    @Operation(summary = "Update user information", description = "Update user details.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PutMapping("/users/{userId}")
    public AppUser updateUserInfo(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.containsKey("name")) user.setName((String) request.get("name"));
        if (request.containsKey("email")) user.setEmail((String) request.get("email"));
        if (request.containsKey("mobile")) user.setMobile((String) request.get("mobile"));
        
        return appUserRepository.save(user);
    }
}
