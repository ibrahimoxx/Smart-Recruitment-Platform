package com.recruitment.jobs.controller;

import com.recruitment.applications.dto.ApplicationResponse;
import com.recruitment.applications.service.ApplicationService;
import com.recruitment.auth.entity.User;
import com.recruitment.common.ApiResponse;
import com.recruitment.common.PagedResponse;
import com.recruitment.common.enums.ContractType;
import com.recruitment.common.enums.ExperienceLevel;
import com.recruitment.common.enums.JobOfferStatus;
import com.recruitment.jobs.dto.JobOfferRequest;
import com.recruitment.jobs.dto.JobOfferResponse;
import com.recruitment.jobs.dto.JobOfferStatusRequest;
import com.recruitment.jobs.service.JobOfferService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobOfferController {

    private final JobOfferService jobOfferService;
    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<JobOfferResponse>> createJobOffer(
            @Valid @RequestBody JobOfferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job offer created", jobOfferService.createJobOffer(currentUser(), request)));
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<PagedResponse<JobOfferResponse>>> listJobOffers(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) JobOfferStatus status,
            @RequestParam(required = false) ContractType contractType,
            @RequestParam(required = false) ExperienceLevel experienceLevel,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean remoteAllowed,
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) UUID recruiterId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(jobOfferService.listJobOffers(
                title,
                status,
                contractType,
                experienceLevel,
                location,
                remoteAllowed,
                companyId,
                recruiterId,
                pageable
        )));
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<JobOfferResponse>> getJobOffer(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobOfferService.getJobOffer(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<JobOfferResponse>> updateJobOffer(
            @PathVariable UUID id,
            @Valid @RequestBody JobOfferRequest request) {
        return ResponseEntity.ok(ApiResponse.success(jobOfferService.updateJobOffer(id, currentUser(), request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteJobOffer(@PathVariable UUID id) {
        jobOfferService.deleteJobOffer(id, currentUser());
        return ResponseEntity.ok(ApiResponse.success("Job offer deleted", null));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<JobOfferResponse>> changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody JobOfferStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                jobOfferService.changeStatus(id, currentUser(), request.status())
        ));
    }

    @GetMapping("/{jobId}/applications")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<ApplicationResponse>>> listApplicationsForJob(
            @PathVariable UUID jobId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.listByJobOffer(currentUser(), jobId, pageable)
        ));
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
