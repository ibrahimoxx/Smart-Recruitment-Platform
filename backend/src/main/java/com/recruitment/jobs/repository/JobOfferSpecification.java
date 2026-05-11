package com.recruitment.jobs.repository;

import com.recruitment.common.enums.ContractType;
import com.recruitment.common.enums.ExperienceLevel;
import com.recruitment.common.enums.JobOfferStatus;
import com.recruitment.jobs.entity.JobOffer;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class JobOfferSpecification {

    private JobOfferSpecification() {
    }

    public static Specification<JobOffer> hasTitle(String title) {
        if (title == null || title.isBlank()) {
            return null;
        }
        return (root, query, cb) -> cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<JobOffer> hasStatus(JobOfferStatus status) {
        if (status == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<JobOffer> hasContractType(ContractType contractType) {
        if (contractType == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("contractType"), contractType);
    }

    public static Specification<JobOffer> hasExperienceLevel(ExperienceLevel experienceLevel) {
        if (experienceLevel == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("experienceLevel"), experienceLevel);
    }

    public static Specification<JobOffer> hasLocation(String location) {
        if (location == null || location.isBlank()) {
            return null;
        }
        return (root, query, cb) -> cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%");
    }

    public static Specification<JobOffer> isRemoteAllowed(Boolean remoteAllowed) {
        if (remoteAllowed == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("remoteAllowed"), remoteAllowed);
    }

    public static Specification<JobOffer> hasCompanyId(UUID companyId) {
        if (companyId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("company").get("id"), companyId);
    }

    public static Specification<JobOffer> hasRecruiterId(UUID recruiterId) {
        if (recruiterId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("recruiter").get("id"), recruiterId);
    }

    public static Specification<JobOffer> buildFilter(
            String title,
            JobOfferStatus status,
            ContractType contractType,
            ExperienceLevel experienceLevel,
            String location,
            Boolean remoteAllowed,
            UUID companyId,
            UUID recruiterId
    ) {
        return Specification.where(hasTitle(title))
                .and(hasStatus(status))
                .and(hasContractType(contractType))
                .and(hasExperienceLevel(experienceLevel))
                .and(hasLocation(location))
                .and(isRemoteAllowed(remoteAllowed))
                .and(hasCompanyId(companyId))
                .and(hasRecruiterId(recruiterId));
    }
}
