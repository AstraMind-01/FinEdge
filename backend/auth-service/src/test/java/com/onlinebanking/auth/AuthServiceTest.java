package com.onlinebanking.auth;

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
import com.onlinebanking.auth.service.AuthService;
import com.onlinebanking.auth.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private com.onlinebanking.auth.repository.CustomerProfileRepository customerProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@finedge.io")
                .password("encoded_pass")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Register: Success path creates new user & session tokens")
    void register_Success() {
        RegisterRequest req = new RegisterRequest("testuser", "test@finedge.io", "password123");

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@finedge.io")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtService.generateToken(anyString(), anyString(), anyString())).thenReturn("access_token_xyz");
        when(jwtService.generateRefreshToken(anyString())).thenReturn("refresh_token_xyz");
        when(jwtService.getJwtExpiration()).thenReturn(86400000L);

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals("access_token_xyz", resp.accessToken());
        assertEquals("refresh_token_xyz", resp.refreshToken());
        verify(userRepository, times(1)).save(any(User.class));
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Register: Rejects duplicate username with 409 UserAlreadyExistsException")
    void register_DuplicateUsername_ThrowsConflict() {
        RegisterRequest req = new RegisterRequest("existinguser", "new@finedge.io", "password123");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login: Success path returns valid AuthResponse")
    void login_Success() {
        LoginRequest req = new LoginRequest("testuser", "password123");

        when(userRepository.findByUsernameOrEmail("testuser", "testuser")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", "encoded_pass")).thenReturn(true);
        when(jwtService.generateToken(eq("testuser"), eq("CUSTOMER"), anyString())).thenReturn("access_token_xyz");
        when(jwtService.generateRefreshToken("testuser")).thenReturn("refresh_token_xyz");

        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("access_token_xyz", resp.accessToken());
    }

    @Test
    @DisplayName("Login: Rejects invalid password")
    void login_WrongPassword_ThrowsInvalidCredentials() {
        LoginRequest req = new LoginRequest("testuser", "wrong_pass");

        when(userRepository.findByUsernameOrEmail("testuser", "testuser")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrong_pass", "encoded_pass")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(req));
    }

    @Test
    @DisplayName("Login: Rejects LOCKED user account")
    void login_LockedUser_ThrowsInvalidCredentials() {
        sampleUser.setStatus(UserStatus.LOCKED);
        LoginRequest req = new LoginRequest("testuser", "password123");

        when(userRepository.findByUsernameOrEmail("testuser", "testuser")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", "encoded_pass")).thenReturn(true);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(req));
    }

    @Test
    @DisplayName("Refresh: Token reuse triggers family revocation alert")
    void refresh_ReuseDetected_RevokesFamily() {
        RefreshTokenRequest req = new RefreshTokenRequest("revoked_refresh_token");

        RefreshToken tokenRecord = RefreshToken.builder()
                .id(10L)
                .user(sampleUser)
                .familyId("family-uuid-123")
                .revoked(true) // Already used / revoked
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        when(jwtService.isTokenValid("revoked_refresh_token")).thenReturn(true);
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(tokenRecord));

        assertThrows(InvalidTokenException.class, () -> authService.refresh(req));
        verify(refreshTokenRepository, times(1)).revokeFamily("family-uuid-123");
    }

    @Test
    @DisplayName("Logout: Revokes token family on valid token")
    void logout_RevokesFamily() {
        RefreshTokenRequest req = new RefreshTokenRequest("active_refresh_token");

        RefreshToken tokenRecord = RefreshToken.builder()
                .familyId("family-uuid-999")
                .build();

        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(tokenRecord));

        authService.logout(req);

        verify(refreshTokenRepository, times(1)).revokeFamily("family-uuid-999");
    }
}
