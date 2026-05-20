package com.recruitment.jobs.service;

import com.recruitment.auth.entity.User;
import com.recruitment.common.PagedResponse;
import com.recruitment.common.enums.ContractType;
import com.recruitment.common.enums.ExperienceLevel;
import com.recruitment.common.enums.JobOfferStatus;
import com.recruitment.common.enums.Role;
import com.recruitment.common.enums.WorkMode;
import com.recruitment.common.exception.AppException;
import com.recruitment.jobs.dto.JobOfferRequest;
import com.recruitment.jobs.dto.JobOfferResponse;
import com.recruitment.jobs.entity.JobOffer;
import com.recruitment.applications.repository.ApplicationRepository;
import com.recruitment.jobs.repository.JobOfferRepository;
import com.recruitment.jobs.repository.JobOfferSpecification;
import com.recruitment.users.entity.Company;
import com.recruitment.users.entity.RecruiterProfile;
import com.recruitment.users.repository.CompanyRepository;
import com.recruitment.users.repository.RecruiterProfileRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class JobOfferService {

    private final JobOfferRepository jobOfferRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;

    public JobOfferResponse createJobOffer(User user, JobOfferRequest request) {
        RecruiterProfile recruiter = recruiterProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Recruiter profile not found"));
        Company company = request.companyId() != null
                ? findCompanyOrThrow(request.companyId())
                : recruiter.getCompany();

        JobOffer offer = JobOffer.create(
                recruiter,
                company,
                request.title(),
                request.description(),
                request.requirements(),
                request.responsibilities(),
                request.location(),
                request.remoteAllowed(),
                request.workMode(),
                request.salaryMin(),
                request.salaryMax(),
                request.currency(),
                request.contractType(),
                request.experienceLevel(),
                request.closesAt()
        );

        return JobOfferResponse.from(jobOfferRepository.save(offer));
    }

    @Transactional(readOnly = true)
    public JobOfferResponse getJobOffer(UUID id) {
        JobOffer offer = findOfferOrThrow(id);
        return JobOfferResponse.from(offer, applicationRepository.countByJobOfferId(offer.getId()));
    }

    @Transactional(readOnly = true)
    public PagedResponse<JobOfferResponse> listJobOffers(
            String title,
            JobOfferStatus status,
            ContractType contractType,
            ExperienceLevel experienceLevel,
            String location,
            Boolean remoteAllowed,
            WorkMode workMode,
            UUID companyId,
            UUID recruiterId,
            BigDecimal salaryMin,
            Pageable pageable
    ) {
        return PagedResponse.of(
                jobOfferRepository.findAll(
                        JobOfferSpecification.buildFilter(
                                title,
                                status,
                                contractType,
                                experienceLevel,
                                location,
                                remoteAllowed,
                                workMode,
                                companyId,
                                recruiterId,
                                salaryMin
                        ),
                        pageable
                ).map(offer -> JobOfferResponse.from(offer, applicationRepository.countByJobOfferId(offer.getId())))
        );
    }

    public JobOfferResponse updateJobOffer(UUID id, User user, JobOfferRequest request) {
        JobOffer offer = findOfferOrThrow(id);
        validateOwnership(user, offer);

        if (request.companyId() != null && !offer.getCompany().getId().equals(request.companyId())) {
            offer.changeCompany(findCompanyOrThrow(request.companyId()));
        }

        offer.update(
                request.title(),
                request.description(),
                request.requirements(),
                request.responsibilities(),
                request.location(),
                request.remoteAllowed(),
                request.workMode(),
                request.salaryMin(),
                request.salaryMax(),
                request.currency(),
                request.contractType(),
                request.experienceLevel(),
                request.closesAt()
        );

        JobOffer saved = jobOfferRepository.save(offer);
        return JobOfferResponse.from(saved, applicationRepository.countByJobOfferId(saved.getId()));
    }

    public void deleteJobOffer(UUID id, User user) {
        JobOffer offer = findOfferOrThrow(id);
        validateOwnership(user, offer);
        jobOfferRepository.delete(offer);
    }

    public JobOfferResponse changeStatus(UUID id, User user, JobOfferStatus newStatus) {
        JobOffer offer = findOfferOrThrow(id);
        validateOwnership(user, offer);

        if (newStatus == JobOfferStatus.PUBLISHED) {
            offer.publish();
        } else if (newStatus == JobOfferStatus.CLOSED) {
            offer.close();
        } else {
            throw new AppException(HttpStatus.BAD_REQUEST, "Unsupported status transition");
        }

        JobOffer saved = jobOfferRepository.save(offer);
        return JobOfferResponse.from(saved, applicationRepository.countByJobOfferId(saved.getId()));
    }

    @Transactional(readOnly = true)
    public List<JobOfferResponse> getSimilarJobs(UUID id) {
        JobOffer offer = findOfferOrThrow(id);
        return jobOfferRepository.findSimilar(id, offer.getContractType(), offer.getExperienceLevel())
                .stream()
                .map(JobOfferResponse::from)
                .toList();
    }

    private JobOffer findOfferOrThrow(UUID id) {
        return jobOfferRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Job offer not found"));
    }

    private Company findCompanyOrThrow(UUID companyId) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Company not found"));
    }

    private void validateOwnership(User user, JobOffer offer) {
        if (user.getRole() != Role.ADMIN && !offer.getRecruiter().getUser().getId().equals(user.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "You are not allowed to modify this job offer");
        }
    }
}
