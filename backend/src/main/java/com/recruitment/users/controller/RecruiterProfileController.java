package com.recruitment.users.controller;

import com.recruitment.auth.entity.User;
import com.recruitment.common.ApiResponse;
import com.recruitment.users.dto.RecruiterProfileRequest;
import com.recruitment.users.dto.RecruiterProfileResponse;
import com.recruitment.users.service.RecruiterProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recruiter-profiles")
@RequiredArgsConstructor
public class RecruiterProfileController {

    private final RecruiterProfileService recruiterProfileService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<RecruiterProfileResponse>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.success(recruiterProfileService.getMyProfile(currentUser())));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<RecruiterProfileResponse>> upsertMyProfile(
            @Valid @RequestBody RecruiterProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(recruiterProfileService.upsertMyProfile(currentUser(), request)));
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
