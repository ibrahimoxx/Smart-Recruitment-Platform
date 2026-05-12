package com.recruitment.ai.controller;

import com.recruitment.ai.dto.CvParsedDataResponse;
import com.recruitment.ai.dto.EmailDraftResponse;
import com.recruitment.ai.dto.MatchScoreResponse;
import com.recruitment.ai.service.AiService;
import com.recruitment.ai.service.CvParsingService;
import com.recruitment.auth.entity.User;
import com.recruitment.common.ApiResponse;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final CvParsingService cvParsingService;

    @GetMapping("/applications/{id}/score")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<MatchScoreResponse>> getMatchScore(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(
                "Match score retrieved", aiService.getMatchScore(user, id)));
    }

    @GetMapping("/applications/{id}/email-draft")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<EmailDraftResponse>> getEmailDraft(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(
                "Email draft retrieved", aiService.getLatestEmailDraft(user, id)));
    }

    @GetMapping("/candidates/{id}/cv-data")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<CvParsedDataResponse>> getCvData(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                "CV data retrieved", aiService.getCvData(id)));
    }

    // TEMP: diagnostic endpoint — remove in Phase 8
    @GetMapping("/ai/debug/cv-text")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> debugCvText(
            @RequestParam String objectKey) {
        try {
            String text = cvParsingService.extractTextFromCv(objectKey);
            return ResponseEntity.ok(ApiResponse.success("CV text extracted", Map.of(
                    "objectKey", objectKey,
                    "textLength", text.length(),
                    "hasText", !text.isBlank(),
                    "preview", text.length() > 500 ? text.substring(0, 500) : text
            )));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("CV text extraction failed", Map.of(
                    "objectKey", objectKey,
                    "error", e.getMessage()
            )));
        }
    }
}
