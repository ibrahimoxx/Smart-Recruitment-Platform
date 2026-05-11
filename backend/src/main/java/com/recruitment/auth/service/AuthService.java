package com.recruitment.auth.service;

import com.recruitment.auth.dto.AuthResponse;
import com.recruitment.auth.dto.LoginRequest;
import com.recruitment.auth.dto.RefreshRequest;
import com.recruitment.auth.dto.RegisterRequest;
import com.recruitment.auth.entity.RefreshToken;
import com.recruitment.auth.entity.User;
import com.recruitment.auth.repository.RefreshTokenRepository;
import com.recruitment.auth.repository.UserRepository;
import com.recruitment.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new AppException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = User.create(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.role(),
                request.firstName(),
                request.lastName(),
                request.phone()
        );
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        if (!user.isEnabled()) {
            throw new AppException(HttpStatus.FORBIDDEN, "Account is disabled");
        }
        user.updateLastLogin();
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
        if (!refreshToken.isValid()) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Refresh token expired or revoked");
        }
        User user = refreshToken.getUser();
        refreshToken.revoke();
        refreshTokenRepository.save(refreshToken);
        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue).ifPresent(rt -> {
            rt.revoke();
            refreshTokenRepository.save(rt);
        });
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = issueRefreshToken(user);
        return new AuthResponse(
                accessToken,
                refreshTokenValue,
                "Bearer",
                jwtService.getAccessTokenExpirationMs(),
                user.getEmail(),
                user.getRole()
        );
    }

    private String issueRefreshToken(User user) {
        String tokenValue = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusMillis(refreshTokenExpirationMs);
        refreshTokenRepository.save(RefreshToken.create(user, tokenValue, expiresAt));
        return tokenValue;
    }
}
