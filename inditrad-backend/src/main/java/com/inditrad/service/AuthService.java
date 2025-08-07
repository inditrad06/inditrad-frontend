package com.inditrad.service;

import lombok.extern.slf4j.Slf4j;

import com.inditrad.config.JwtUtil;
import com.inditrad.entity.Admin;
import com.inditrad.entity.AppUser;
import com.inditrad.entity.SuperAdmin;
import com.inditrad.repository.AdminRepository;
import com.inditrad.repository.AppUserRepository;
import com.inditrad.repository.SuperAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final AdminRepository adminRepository;
    private final SuperAdminRepository superAdminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public Optional<?> login(String username, String password) {
        Optional<AppUser> user = appUserRepository.findByUsername(username);
        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            return Optional.of(user.get());
        }

        Optional<Admin> admin = adminRepository.findByUsername(username);
        if (admin.isPresent() && passwordEncoder.matches(password, admin.get().getPassword())) {
            return Optional.of(admin.get());
        }

        Optional<SuperAdmin> superAdmin = superAdminRepository.findByUsername(username);
        if (superAdmin.isPresent() && passwordEncoder.matches(password, superAdmin.get().getPassword())) {
            return Optional.of(superAdmin.get());
        }

        return Optional.empty();
    }

    public String generateToken(String username, String role, Long userId) {
        return jwtUtil.generateToken(username, role, userId);
    }

    public Object getCurrentUser(String username) {
        Optional<AppUser> user = appUserRepository.findByUsername(username);
        if (user.isPresent()) {
            return user.get();
        }

        Optional<Admin> admin = adminRepository.findByUsername(username);
        if (admin.isPresent()) {
            return admin.get();
        }

        Optional<SuperAdmin> superAdmin = superAdminRepository.findByUsername(username);
        if (superAdmin.isPresent()) {
            return superAdmin.get();
        }

        return null;
    }
}
