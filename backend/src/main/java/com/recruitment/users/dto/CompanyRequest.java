package com.recruitment.users.dto;

import jakarta.validation.constraints.NotBlank;

public record CompanyRequest(
        @NotBlank String name,
        @NotBlank String slug,
        String description,
        String websiteUrl,
        String industry,
        String companySize,
        String headquarters
) {}
