package com.recruitment.users.dto;

import com.recruitment.common.enums.ExperienceLevel;
import com.recruitment.users.entity.CandidateProfile;

import java.time.Instant;
import java.util.UUID;

public record CandidateProfileResponse(
        UUID id,
        UUID userId,
        String firstName,
        String lastName,
        String email,
        String headline,
        String summary,
        String location,
        Integer yearsOfExperience,
        ExperienceLevel experienceLevel,
        String skills,
        String linkedinUrl,
        String githubUrl,
        String portfolioUrl,
        boolean hasCv,
        Instant cvUploadedAt,
        Instant createdAt
) {
    public static CandidateProfileResponse from(CandidateProfile p) {
        return new CandidateProfileResponse(
                p.getId(),
                p.getUser().getId(),
                p.getUser().getFirstName(),
                p.getUser().getLastName(),
                p.getUser().getEmail(),
                p.getHeadline(),
                p.getSummary(),
                p.getLocation(),
                p.getYearsOfExperience(),
                p.getExperienceLevel(),
                p.getSkills(),
                p.getLinkedinUrl(),
                p.getGithubUrl(),
                p.getPortfolioUrl(),
                p.getCvObjectKey() != null,
                p.getCvUploadedAt(),
                p.getCreatedAt()
        );
    }
}
