package com.recruitment.applications.controller;

import com.recruitment.applications.dto.ApplicationRequest;
import com.recruitment.applications.dto.ApplicationResponse;
import com.recruitment.applications.dto.ApplicationStatusRequest;
import com.recruitment.applications.service.ApplicationService;
import com.recruitment.auth.entity.User;
import com.recruitment.common.ApiResponse;
import com.recruitment.common.PagedResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply(
            @Valid @RequestBody ApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application submitted", applicationService.apply(currentUser(), request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CANDIDATE', 'RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<ApplicationResponse>>> listApplications(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.listApplications(currentUser(), pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplication(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getApplication(currentUser(), id)));
    }

    @GetMapping("/check")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Boolean>> hasApplied(@RequestParam UUID jobOfferId) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.hasApplied(currentUser(), jobOfferId)
        ));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ApplicationStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.changeStatus(currentUser(), id, request.status())
        ));
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
