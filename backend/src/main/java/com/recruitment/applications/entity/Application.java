package com.recruitment.applications.entity;

import com.recruitment.common.BaseEntity;
import com.recruitment.common.enums.ApplicationStatus;
import com.recruitment.common.exception.AppException;
import com.recruitment.jobs.entity.JobOffer;
import com.recruitment.users.entity.CandidateProfile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Entity
@Table(name = "applications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Application extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private CandidateProfile candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_offer_id", nullable = false)
    private JobOffer jobOffer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ApplicationStatus status;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "applied_at", nullable = false)
    private Instant appliedAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    public static Application create(CandidateProfile candidate, JobOffer jobOffer, String coverLetter) {
        Application app = new Application();
        app.candidate = candidate;
        app.jobOffer = jobOffer;
        app.coverLetter = coverLetter;
        app.status = ApplicationStatus.PENDING;
        app.appliedAt = Instant.now();
        return app;
    }

    public void changeStatus(ApplicationStatus newStatus) {
        if (!isValidTransition(this.status, newStatus)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Invalid status transition: " + this.status + " -> " + newStatus);
        }
        this.status = newStatus;
        this.reviewedAt = Instant.now();
    }

    private static boolean isValidTransition(ApplicationStatus from, ApplicationStatus to) {
        return switch (from) {
            case PENDING -> to == ApplicationStatus.INTERVIEW || to == ApplicationStatus.REJECTED;
            case INTERVIEW -> to == ApplicationStatus.ACCEPTED || to == ApplicationStatus.REJECTED;
            default -> false;
        };
    }
}
