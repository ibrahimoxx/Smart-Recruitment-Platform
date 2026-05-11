package com.recruitment.auth.dto;

import com.recruitment.common.enums.Role;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        String email,
        Role role
) {}
