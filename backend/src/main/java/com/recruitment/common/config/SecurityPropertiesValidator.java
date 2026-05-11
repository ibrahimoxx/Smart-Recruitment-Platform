package com.recruitment.common.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SecurityPropertiesValidator {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @PostConstruct
    void validateJwtSecret() {
        if (jwtSecret.startsWith("CHANGE_ME") || jwtSecret.length() < 32) {
            throw new IllegalStateException(
                "JWT_SECRET env var is not set or too short (minimum 32 characters). " +
                "Set the JWT_SECRET environment variable before starting the application.");
        }
    }
}
