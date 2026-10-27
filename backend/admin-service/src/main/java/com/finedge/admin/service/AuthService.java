package com.finedge.admin.service;

import com.finedge.admin.dto.auth.LoginRequest;
import com.finedge.admin.dto.auth.LoginResponse;
import com.finedge.admin.entity.AdminUser;
import com.finedge.admin.repository.AdminUserRepository;
import com.finedge.admin.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public LoginResponse login(LoginRequest loginRequest) {
        AdminUser user = adminUserRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        if (!user.isActive()) {
            throw new RuntimeException("User account is disabled");
        }

        user.setLastLoginAt(OffsetDateTime.now());
        adminUserRepository.save(user);

        List<String> roles = user.getRoles().stream()
                .map(role -> "ROLE_" + role.getName())
                .collect(Collectors.toList());

        String accessToken = tokenProvider.generateToken(user.getUsername(), roles);
        String refreshToken = tokenProvider.generateRefreshToken(user.getUsername());

        return new LoginResponse(accessToken, refreshToken, user.getUsername(), roles, user.isTotpEnabled());
    }
}
