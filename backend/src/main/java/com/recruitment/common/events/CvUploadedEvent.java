package com.recruitment.common.events;

import java.util.UUID;

public record CvUploadedEvent(UUID candidateProfileId, String objectKey, String originalFilename) {}
