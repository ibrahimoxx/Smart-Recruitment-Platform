package com.recruitment.users.service;

import com.recruitment.auth.entity.User;
import com.recruitment.common.config.MinioProperties;
import com.recruitment.common.events.CvUploadedEvent;
import com.recruitment.common.exception.AppException;
import com.recruitment.storage.StorageService;
import com.recruitment.users.dto.CandidateProfileRequest;
import com.recruitment.users.dto.CandidateProfileResponse;
import com.recruitment.users.dto.CvUploadResponse;
import com.recruitment.users.entity.CandidateProfile;
import com.recruitment.users.repository.CandidateProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Transactional
public class CandidateProfileService {

    private static final long MAX_CV_SIZE_BYTES = 10L * 1024 * 1024;
    private static final String PDF_CONTENT_TYPE = "application/pdf";

    private final CandidateProfileRepository candidateProfileRepository;
    private final StorageService storageService;
    private final MinioProperties minioProperties;
    private final ApplicationEventPublisher eventPublisher;

    public CandidateProfileResponse getOrCreateMyProfile(User user) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> candidateProfileRepository.save(CandidateProfile.create(user)));
        return CandidateProfileResponse.from(profile);
    }

    public CandidateProfileResponse updateMyProfile(User user, CandidateProfileRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> CandidateProfile.create(user));
        profile.update(
                request.headline(), request.summary(), request.location(),
                request.yearsOfExperience(), request.experienceLevel(),
                request.skills(), request.linkedinUrl(), request.githubUrl(), request.portfolioUrl()
        );
        return CandidateProfileResponse.from(candidateProfileRepository.save(profile));
    }

    public CvUploadResponse uploadCv(User user, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "CV file is required");
        }
        if (file.getSize() > MAX_CV_SIZE_BYTES) {
            throw new AppException(HttpStatus.BAD_REQUEST, "CV file must not exceed 10 MB");
        }
        String contentType = file.getContentType();
        if (!PDF_CONTENT_TYPE.equals(contentType)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "CV must be a PDF file");
        }

        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> candidateProfileRepository.save(CandidateProfile.create(user)));

        String rawFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf";
        String originalFilename = java.nio.file.Paths.get(rawFilename).getFileName().toString();
        String objectKey = "cv/" + user.getId() + "/" + originalFilename;
        try {
            storageService.uploadFile(
                    minioProperties.getBucketCv(),
                    objectKey,
                    file.getInputStream(),
                    file.getSize(),
                    contentType
            );
        } catch (IOException e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read CV file");
        }

        profile.updateCv(objectKey, originalFilename);
        candidateProfileRepository.save(profile);

        eventPublisher.publishEvent(new CvUploadedEvent(profile.getId(), objectKey, originalFilename));

        return new CvUploadResponse(objectKey, originalFilename, Instant.now());
    }
}
