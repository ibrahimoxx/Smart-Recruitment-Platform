package com.recruitment.applications.dto;

import com.recruitment.common.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record ApplicationStatusRequest(
        @NotNull(message = "Status is required")
        ApplicationStatus status
) {}
