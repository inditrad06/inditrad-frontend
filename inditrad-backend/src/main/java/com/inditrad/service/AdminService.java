package com.inditrad.service;


import lombok.extern.slf4j.Slf4j;

import com.inditrad.entity.Admin;
import com.inditrad.entity.AppUser;
import com.inditrad.model.CreateAdminRequest;
import com.inditrad.model.CreateUserRequest;
import com.inditrad.repository.AdminRepository;
import com.inditrad.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final AppUserRepository appUserRepository;

    public Admin createAdmin(CreateAdminRequest request) {
        Admin admin = new Admin();
        admin.setUsername(request.getUsername());
        admin.setPassword(request.getPassword());
        admin.setName(request.getName());
        admin.setMobile(request.getMobile());
        return adminRepository.save(admin);
    }

    public AppUser createUser(CreateUserRequest request, Long adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + adminId));

        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setName(request.getName());
        user.setMobile(request.getMobile());
        user.setWalletBalance(request.getInitialWalletBalance());
        user.setAdmin(admin); // ✅ Correct way

        return appUserRepository.save(user);
    }
}