package com.recruitment.jobs.dto;

import com.recruitment.common.enums.JobOfferStatus;
import jakarta.validation.constraints.NotNull;

public record JobOfferStatusRequest(
        @NotNull JobOfferStatus status
) {
}
