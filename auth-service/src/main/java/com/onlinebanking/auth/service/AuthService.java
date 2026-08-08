package com.onlinebanking.auth.service;

import com.onlinebanking.auth.dto.AuthResponse;
import com.onlinebanking.auth.dto.LoginRequest;
import com.onlinebanking.auth.dto.RefreshTokenRequest;
import com.onlinebanking.auth.dto.RegisterRequest;
import com.onlinebanking.auth.dto.UserResponse;
import com.onlinebanking.auth.entity.RefreshToken;
import com.onlinebanking.auth.entity.Role;
import com.onlinebanking.auth.entity.User;
import com.onlinebanking.auth.entity.UserStatus;
import com.onlinebanking.auth.exception.InvalidCredentialsException;
import com.onlinebanking.auth.exception.InvalidTokenException;
import com.onlinebanking.auth.exception.UserAlreadyExistsException;
import com.onlinebanking.auth.repository.RefreshTokenRepository;
import com.onlinebanking.auth.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username '" + request.username() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email '" + request.email() + "' is already registered");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        return createNewSession(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.usernameOrEmail(), request.usernameOrEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username/email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username/email or password");
        }

        // Fix 4: Independent User Status Check
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidCredentialsException("User account is " + user.getStatus() + ". Authentication rejected.");
        }

        return createNewSession(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String rawToken = request.refreshToken();

        if (!jwtService.isTokenValid(rawToken)) {
            throw new InvalidTokenException("Refresh token is invalid or expired");
        }

        String tokenHash = hashToken(rawToken);
        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByTokenHash(tokenHash);

        if (tokenOpt.isEmpty()) {
            throw new InvalidTokenException("Refresh token record not found");
        }

        RefreshToken storedToken = tokenOpt.get();

        // Fix 3: Reuse Detection & Security Event
        if (storedToken.isRevoked()) {
            log.warn("SECURITY ALERT: Refresh token reuse detected for family [{}]. Revoking all tokens in family!", storedToken.getFamilyId());
            refreshTokenRepository.revokeFamily(storedToken.getFamilyId());
            throw new InvalidTokenException("Security alert: Refresh token reuse detected. All sessions revoked.");
        }

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new InvalidTokenException("Refresh token has expired");
        }

        // Rotate token: invalidate current token
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        // Issue new token pair under SAME familyId
        User user = storedToken.getUser();
        String newAccessToken = jwtService.generateToken(user.getUsername(), user.getRole().name());
        String newRefreshTokenStr = jwtService.generateRefreshToken(user.getUsername());

        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(newRefreshTokenStr))
                .familyId(storedToken.getFamilyId())
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusWeeks(1))
                .revoked(false)
                .build();

        refreshTokenRepository.save(newRefreshToken);

        return new AuthResponse(newAccessToken, newRefreshTokenStr, jwtService.getJwtExpiration());
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        String rawToken = request.refreshToken();
        String tokenHash = hashToken(rawToken);

        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            log.info("Logging out user and revoking token family [{}]", token.getFamilyId());
            refreshTokenRepository.revokeFamily(token.getFamilyId());
        });
    }

    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    private AuthResponse createNewSession(User user) {
        String familyId = UUID.randomUUID().toString();
        String accessToken = jwtService.generateToken(user.getUsername(), user.getRole().name());
        String refreshTokenStr = jwtService.generateRefreshToken(user.getUsername());

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(refreshTokenStr))
                .familyId(familyId)
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusWeeks(1))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return new AuthResponse(accessToken, refreshTokenStr, jwtService.getJwtExpiration());
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
