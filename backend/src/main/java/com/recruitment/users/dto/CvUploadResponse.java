package com.recruitment.users.dto;

import java.time.Instant;

public record CvUploadResponse(String objectKey, String originalFilename, Instant uploadedAt) {}
