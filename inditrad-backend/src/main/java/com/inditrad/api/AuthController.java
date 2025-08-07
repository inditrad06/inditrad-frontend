package com.inditrad.api;


import lombok.extern.slf4j.Slf4j;

import com.inditrad.entity.Admin;
import com.inditrad.entity.AppUser;
import com.inditrad.entity.SuperAdmin;
import com.inditrad.model.LoginRequest;
import com.inditrad.model.LoginResponse;
import com.inditrad.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "User login", description = "Authenticate a user and return a token if credentials are valid.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<?> user = authService.login(request.getUsername(), request.getPassword());
        if (user.isPresent()) {
            Object result = user.get();
            String role;
            Long userId;
            if (result instanceof AppUser) {
                role = "user";
                userId = ((AppUser) result).getId();
            } else if (result instanceof Admin) {
                role = "admin";
                userId = ((Admin) result).getId();
            } else if (result instanceof SuperAdmin) {
                role = "super_admin";
                userId = ((SuperAdmin) result).getId();
            } else {
                role = "unknown";
                userId = null;
            }

            String token = authService.generateToken(request.getUsername(), role, userId);
            return ResponseEntity.ok(new LoginResponse(token, "bearer", result));
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                com.inditrad.config.JwtUtil jwtUtil = new com.inditrad.config.JwtUtil();
                String username = jwtUtil.getUsernameFromToken(token);
                Object user = authService.getCurrentUser(username);
                if (user != null) {
                    return ResponseEntity.ok(user);
                }
            } catch (Exception e) {
                log.error("Error validating token", e);
            }
        }
        return ResponseEntity.status(401).body("Unauthorized");
    }
}
