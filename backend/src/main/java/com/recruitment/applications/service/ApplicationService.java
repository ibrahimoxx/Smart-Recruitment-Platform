package com.recruitment.applications.service;

import com.recruitment.applications.dto.ApplicationRequest;
import com.recruitment.applications.dto.ApplicationResponse;
import com.recruitment.applications.entity.Application;
import com.recruitment.applications.repository.ApplicationRepository;
import com.recruitment.auth.entity.User;
import com.recruitment.common.PagedResponse;
import com.recruitment.common.enums.ApplicationStatus;
import com.recruitment.common.enums.JobOfferStatus;
import com.recruitment.common.enums.Role;
import com.recruitment.common.events.ApplicationStatusChangedEvent;
import com.recruitment.common.events.ApplicationSubmittedEvent;
import com.recruitment.common.exception.AppException;
import com.recruitment.jobs.entity.JobOffer;
import com.recruitment.jobs.repository.JobOfferRepository;
import com.recruitment.users.entity.CandidateProfile;
import com.recruitment.users.entity.RecruiterProfile;
import com.recruitment.users.repository.CandidateProfileRepository;
import com.recruitment.users.repository.RecruiterProfileRepository;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobOfferRepository jobOfferRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ApplicationResponse apply(User user, ApplicationRequest request) {
        CandidateProfile candidate = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> candidateProfileRepository.save(CandidateProfile.create(user)));

        JobOffer jobOffer = jobOfferRepository.findById(request.jobOfferId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Job offer not found"));

        if (jobOffer.getStatus() != JobOfferStatus.PUBLISHED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Job offer is not open for applications");
        }
        if (jobOffer.getClosesAt() != null && jobOffer.getClosesAt().isBefore(Instant.now())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Job offer application deadline has passed");
        }
        if (applicationRepository.existsByCandidateIdAndJobOfferId(candidate.getId(), jobOffer.getId())) {
            throw new AppException(HttpStatus.CONFLICT, "You have already applied to this job offer");
        }

        Application application = applicationRepository.save(
                Application.create(candidate, jobOffer, request.coverLetter())
        );

        eventPublisher.publishEvent(
                new ApplicationSubmittedEvent(application.getId(), candidate.getId(), jobOffer.getId())
        );

        return ApplicationResponse.from(application);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ApplicationResponse> listApplications(User user, Pageable pageable) {
        return switch (user.getRole()) {
            case CANDIDATE -> PagedResponse.of(
                    applicationRepository.findByCandidateUserId(user.getId(), pageable)
                            .map(ApplicationResponse::from)
            );
            case RECRUITER -> PagedResponse.of(
                    applicationRepository.findByRecruiterUserId(user.getId(), pageable)
                            .map(ApplicationResponse::from)
            );
            case ADMIN -> PagedResponse.of(
                    applicationRepository.findAll(pageable).map(ApplicationResponse::from)
            );
        };
    }

    @Transactional(readOnly = true)
    public PagedResponse<ApplicationResponse> listByJobOffer(User user, UUID jobOfferId, Pageable pageable) {
        jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Job offer not found"));
        if (user.getRole() == Role.ADMIN) {
            return PagedResponse.of(
                    applicationRepository.findByJobOfferId(jobOfferId, pageable).map(ApplicationResponse::from)
            );
        }
        return PagedResponse.of(
                applicationRepository.findByJobOfferIdAndRecruiterUserId(jobOfferId, user.getId(), pageable)
                        .map(ApplicationResponse::from)
        );
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplication(User user, UUID id) {
        return ApplicationResponse.from(findApplicationForUser(user, id));
    }

    public ApplicationResponse changeStatus(User user, UUID id, ApplicationStatus newStatus) {
        Application application = switch (user.getRole()) {
            case ADMIN -> applicationRepository.findById(id)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Application not found"));
            case RECRUITER -> applicationRepository.findByIdAndRecruiterUserId(id, user.getId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Application not found"));
            default -> throw new AppException(HttpStatus.FORBIDDEN, "Access denied");
        };

        ApplicationStatus previousStatus = application.getStatus();
        application.changeStatus(newStatus);
        applicationRepository.save(application);

        RecruiterProfile recruiter = application.getJobOffer().getRecruiter();
        eventPublisher.publishEvent(
                new ApplicationStatusChangedEvent(application.getId(), recruiter.getId(), previousStatus, newStatus)
        );

        return ApplicationResponse.from(application);
    }

    private Application findApplicationForUser(User user, UUID id) {
        return switch (user.getRole()) {
            case CANDIDATE -> applicationRepository.findByIdAndCandidateUserId(id, user.getId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Application not found"));
            case RECRUITER -> applicationRepository.findByIdAndRecruiterUserId(id, user.getId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Application not found"));
            case ADMIN -> applicationRepository.findById(id)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Application not found"));
        };
    }
}
