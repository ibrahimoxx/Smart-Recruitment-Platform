package com.recruitment.jobs.entity;

import com.recruitment.common.BaseEntity;
import com.recruitment.common.enums.ContractType;
import com.recruitment.common.enums.ExperienceLevel;
import com.recruitment.common.enums.JobOfferStatus;
import com.recruitment.common.enums.WorkMode;
import com.recruitment.common.exception.AppException;
import com.recruitment.users.entity.Company;
import com.recruitment.users.entity.RecruiterProfile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Entity
@Table(name = "job_offers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobOffer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private RecruiterProfile recruiter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    @Column(length = 255)
    private String location;

    @Column(name = "remote_allowed", nullable = false)
    private boolean remoteAllowed;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_mode", nullable = false, length = 32)
    private WorkMode workMode;

    @Column(name = "salary_min", precision = 12, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 12, scale = 2)
    private BigDecimal salaryMax;

    @Column(length = 8)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", nullable = false, length = 32)
    private ContractType contractType;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", nullable = false, length = 32)
    private ExperienceLevel experienceLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private JobOfferStatus status;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "closes_at")
    private Instant closesAt;

    public static JobOffer create(
            RecruiterProfile recruiter,
            Company company,
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
            Instant closesAt
    ) {
        JobOffer offer = new JobOffer();
        offer.recruiter = recruiter;
        offer.company = company;
        offer.title = title;
        offer.description = description;
        offer.requirements = requirements;
        offer.responsibilities = responsibilities;
        offer.location = location;
        offer.remoteAllowed = remoteAllowed;
        offer.workMode = workMode != null ? workMode : WorkMode.ON_SITE;
        offer.salaryMin = salaryMin;
        offer.salaryMax = salaryMax;
        offer.currency = currency;
        offer.contractType = contractType;
        offer.experienceLevel = experienceLevel;
        offer.closesAt = closesAt;
        offer.status = JobOfferStatus.DRAFT;
        return offer;
    }

    public void update(
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
            Instant closesAt
    ) {
        this.title = title;
        this.description = description;
        this.requirements = requirements;
        this.responsibilities = responsibilities;
        this.location = location;
        this.remoteAllowed = remoteAllowed;
        this.workMode = workMode != null ? workMode : WorkMode.ON_SITE;
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        this.currency = currency;
        this.contractType = contractType;
        this.experienceLevel = experienceLevel;
        this.closesAt = closesAt;
    }

    public void changeCompany(Company company) {
        this.company = company;
    }

    public void publish() {
        if (status == JobOfferStatus.PUBLISHED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Job offer is already published");
        }
        if (status == JobOfferStatus.CLOSED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Closed job offer cannot be published");
        }
        this.status = JobOfferStatus.PUBLISHED;
        this.publishedAt = Instant.now();
    }

    public void close() {
        if (status == JobOfferStatus.CLOSED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Job offer is already closed");
        }
        this.status = JobOfferStatus.CLOSED;
    }
}
