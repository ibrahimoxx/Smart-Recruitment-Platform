package com.recruitment.ai.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.ai.entity.MatchScore;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record MatchScoreResponse(
        UUID id,
        UUID applicationId,
        double score,
        String justification,
        List<String> matchedSkills,
        List<String> missingSkills,
        Instant computedAt
) {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static MatchScoreResponse from(MatchScore ms) {
        return new MatchScoreResponse(
                ms.getId(),
                ms.getApplicationId(),
                ms.getScore(),
                ms.getReasoning(),
                parseJsonArray(ms.getMatchedSkills()),
                parseJsonArray(ms.getMissingSkills()),
                ms.getComputedAt()
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
