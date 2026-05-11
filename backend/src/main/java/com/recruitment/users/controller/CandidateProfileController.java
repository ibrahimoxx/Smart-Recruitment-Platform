package com.recruitment.users.controller;

import com.recruitment.auth.entity.User;
import com.recruitment.common.ApiResponse;
import com.recruitment.users.dto.CandidateProfileRequest;
import com.recruitment.users.dto.CandidateProfileResponse;
import com.recruitment.users.dto.CvUploadResponse;
import com.recruitment.users.service.CandidateProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/candidate-profiles")
@RequiredArgsConstructor
public class CandidateProfileController {

    private final CandidateProfileService candidateProfileService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.success(candidateProfileService.getOrCreateMyProfile(currentUser())));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateMyProfile(
            @Valid @RequestBody CandidateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(candidateProfileService.updateMyProfile(currentUser(), request)));
    }

    @PostMapping("/me/cv")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CvUploadResponse>> uploadCv(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("CV uploaded successfully",
                candidateProfileService.uploadCv(currentUser(), file)));
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
