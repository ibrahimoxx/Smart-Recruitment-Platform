package com.recruitment.users.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RecruiterProfileRequest(
        @NotNull UUID companyId,
        String jobTitle,
        String department,
        String bio
) {}
