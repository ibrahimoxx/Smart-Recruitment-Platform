package com.recruitment.applications.dto;

import com.recruitment.applications.entity.Application;
import com.recruitment.common.enums.ApplicationStatus;
import java.time.Instant;
import java.util.UUID;

public record ApplicationResponse(
        UUID id,
        UUID candidateId,
        String candidateFirstName,
        String candidateLastName,
        UUID jobOfferId,
        String jobTitle,
        UUID companyId,
        String companyName,
        ApplicationStatus status,
        String coverLetter,
        Instant appliedAt,
        Instant reviewedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static ApplicationResponse from(Application app) {
        return new ApplicationResponse(
                app.getId(),
                app.getCandidate().getId(),
                app.getCandidate().getUser().getFirstName(),
                app.getCandidate().getUser().getLastName(),
                app.getJobOffer().getId(),
                app.getJobOffer().getTitle(),
                app.getJobOffer().getCompany().getId(),
                app.getJobOffer().getCompany().getName(),
                app.getStatus(),
                app.getCoverLetter(),
                app.getAppliedAt(),
                app.getReviewedAt(),
                app.getCreatedAt(),
                app.getUpdatedAt()
        );
    }
}
