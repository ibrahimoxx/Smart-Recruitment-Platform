package com.recruitment.applications.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ApplicationRequest(
        @NotNull(message = "Job offer ID is required")
        UUID jobOfferId,
        String coverLetter
) {}
