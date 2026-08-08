package com.onlinebanking.auth.dto;

import com.onlinebanking.auth.entity.Role;

public record UserResponse(
        Long id,
        String username,
        String email,
        Role role
) {
}
