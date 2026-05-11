package com.recruitment.ai.service;

import com.recruitment.ai.dto.CvParsedDataResponse;
import com.recruitment.ai.dto.EmailDraftResponse;
import com.recruitment.ai.dto.MatchScoreResponse;
import com.recruitment.ai.entity.CvParsedData;
import com.recruitment.ai.entity.EmailDraft;
import com.recruitment.ai.entity.MatchScore;
import com.recruitment.ai.repository.CvParsedDataRepository;
import com.recruitment.ai.repository.EmailDraftRepository;
import com.recruitment.ai.repository.MatchScoreRepository;
import com.recruitment.applications.repository.ApplicationRepository;
import com.recruitment.auth.entity.User;
import com.recruitment.common.enums.Role;
import com.recruitment.common.exception.AppException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiService {

    private final MatchScoreRepository matchScoreRepository;
    private final EmailDraftRepository emailDraftRepository;
    private final CvParsedDataRepository cvParsedDataRepository;
    private final ApplicationRepository applicationRepository;

    public MatchScoreResponse getMatchScore(User user, UUID applicationId) {
        assertApplicationAccess(user, applicationId);
        MatchScore ms = matchScoreRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Match score not yet computed for this application"));
        return MatchScoreResponse.from(ms);
    }

    public EmailDraftResponse getLatestEmailDraft(User user, UUID applicationId) {
        assertApplicationAccess(user, applicationId);
        EmailDraft draft = emailDraftRepository.findTopByApplicationIdOrderByCreatedAtDesc(applicationId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "No email draft found for this application"));
        return EmailDraftResponse.from(draft);
    }

    public CvParsedDataResponse getCvData(UUID candidateProfileId) {
        CvParsedData data = cvParsedDataRepository
                .findTopByCandidateIdOrderByParsedAtDesc(candidateProfileId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "No parsed CV data found for this candidate"));
        return CvParsedDataResponse.from(data);
    }

    private void assertApplicationAccess(User user, UUID applicationId) {
        if (user.getRole() == Role.ADMIN) return;
        applicationRepository.findByIdAndRecruiterUserId(applicationId, user.getId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Application not found"));
    }
}
