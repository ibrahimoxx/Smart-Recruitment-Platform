package com.recruitment.jobs.dto;

import com.recruitment.common.enums.ContractType;
import com.recruitment.common.enums.ExperienceLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record JobOfferRequest(
        @NotBlank String title,
        @NotBlank String description,
        String requirements,
        String responsibilities,
        String location,
        boolean remoteAllowed,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String currency,
        @NotNull ContractType contractType,
        @NotNull ExperienceLevel experienceLevel,
        Instant closesAt,
        @NotNull UUID companyId
) {
}
