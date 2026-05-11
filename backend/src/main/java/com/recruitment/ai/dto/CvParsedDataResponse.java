package com.recruitment.ai.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.ai.entity.CvParsedData;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CvParsedDataResponse(
        UUID id,
        UUID candidateId,
        String sourceFileName,
        String summary,
        List<String> skills,
        List<String> experiences,
        List<String> education,
        Instant parsedAt,
        Instant createdAt
) {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static CvParsedDataResponse from(CvParsedData data) {
        return new CvParsedDataResponse(
                data.getId(),
                data.getCandidateId(),
                data.getSourceFileName(),
                data.getParsedSummary(),
                parseJsonArray(data.getParsedSkills()),
                parseJsonArray(data.getParsedExperience()),
                parseJsonArray(data.getParsedEducation()),
                data.getParsedAt(),
                data.getCreatedAt()
        );
    }

    private static List<String> parseJsonArray(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return MAPPER.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
