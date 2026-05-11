package com.recruitment.users.dto;

import com.recruitment.users.entity.RecruiterProfile;

import java.time.Instant;
import java.util.UUID;

public record RecruiterProfileResponse(
        UUID id,
        UUID userId,
        String firstName,
        String lastName,
        String email,
        UUID companyId,
        String companyName,
        String jobTitle,
        String department,
        String bio,
        Instant createdAt
) {
    public static RecruiterProfileResponse from(RecruiterProfile p) {
        return new RecruiterProfileResponse(
                p.getId(),
                p.getUser().getId(),
                p.getUser().getFirstName(),
                p.getUser().getLastName(),
                p.getUser().getEmail(),
                p.getCompany().getId(),
                p.getCompany().getName(),
                p.getJobTitle(),
                p.getDepartment(),
                p.getBio(),
                p.getCreatedAt()
        );
    }
}
