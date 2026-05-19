package com.recruitment.jobs.dto;

import com.recruitment.common.enums.ContractType;
import com.recruitment.common.enums.ExperienceLevel;
import com.recruitment.common.enums.JobOfferStatus;
import com.recruitment.common.enums.WorkMode;
import com.recruitment.jobs.entity.JobOffer;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record JobOfferResponse(
        UUID id,
        UUID recruiterId,
        String recruiterFirstName,
        String recruiterLastName,
        UUID companyId,
        String companyName,
        String title,
        String description,
        String requirements,
        String responsibilities,
        String location,
        boolean remoteAllowed,
        WorkMode workMode,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String currency,
        ContractType contractType,
        ExperienceLevel experienceLevel,
        JobOfferStatus status,
        Instant publishedAt,
        Instant closesAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static JobOfferResponse from(JobOffer offer) {
        return new JobOfferResponse(
                offer.getId(),
                offer.getRecruiter().getId(),
                offer.getRecruiter().getUser().getFirstName(),
                offer.getRecruiter().getUser().getLastName(),
                offer.getCompany().getId(),
                offer.getCompany().getName(),
                offer.getTitle(),
                offer.getDescription(),
                offer.getRequirements(),
                offer.getResponsibilities(),
                offer.getLocation(),
                offer.isRemoteAllowed(),
                offer.getSalaryMin(),
                offer.getSalaryMax(),
                offer.getCurrency(),
                offer.getContractType(),
                offer.getExperienceLevel(),
                offer.getStatus(),
                offer.getPublishedAt(),
                offer.getClosesAt(),
                offer.getCreatedAt(),
                offer.getUpdatedAt()
        );
    }
}
