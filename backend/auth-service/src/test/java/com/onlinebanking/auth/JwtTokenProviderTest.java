package com.onlinebanking.auth;

import com.onlinebanking.auth.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtService jwtService;
    private final String secretKey = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 604800000L);
    }

    @Test
    @DisplayName("JWT: Generates valid access token containing username and role")
    void generateToken_ValidClaims() {
        String token = jwtService.generateToken("john_doe", "CUSTOMER");
        assertNotNull(token);
        assertFalse(token.isBlank());

        assertTrue(jwtService.isTokenValid(token));
        assertEquals("john_doe", jwtService.extractUsername(token));
        assertEquals("CUSTOMER", jwtService.extractRole(token));
    }

    @Test
    @DisplayName("JWT: Invalid or tampered token returns false for isTokenValid")
    void isTokenValid_TamperedToken_ReturnsFalse() {
        String token = jwtService.generateToken("john_doe", "CUSTOMER");
        String tamperedToken = token + "corrupted";

        assertFalse(jwtService.isTokenValid(tamperedToken));
    }
}
