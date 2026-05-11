package com.recruitment.users.dto;

import com.recruitment.users.entity.Company;

import java.time.Instant;
import java.util.UUID;

public record CompanyResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String websiteUrl,
        String logoUrl,
        String industry,
        String companySize,
        String headquarters,
        Instant createdAt
) {
    public static CompanyResponse from(Company c) {
        return new CompanyResponse(
                c.getId(), c.getName(), c.getSlug(), c.getDescription(),
                c.getWebsiteUrl(), c.getLogoUrl(), c.getIndustry(),
                c.getCompanySize(), c.getHeadquarters(), c.getCreatedAt()
        );
    }
}
