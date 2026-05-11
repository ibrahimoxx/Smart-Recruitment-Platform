package com.recruitment.ai.entity;

import com.recruitment.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "match_scores")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MatchScore extends BaseEntity {

    @Column(name = "application_id", nullable = false, unique = true)
    private UUID applicationId;

    @Column(nullable = false)
    private double score;

    @Column(columnDefinition = "TEXT")
    private String reasoning;

    @Column(name = "matched_skills", columnDefinition = "TEXT")
    private String matchedSkills;

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills;

    @Column(name = "computed_at", nullable = false)
    private Instant computedAt;

    public static MatchScore create(UUID applicationId, double score, String reasoning,
                                     String matchedSkills, String missingSkills) {
        MatchScore ms = new MatchScore();
        ms.applicationId = applicationId;
        ms.score = score;
        ms.reasoning = reasoning;
        ms.matchedSkills = matchedSkills;
        ms.missingSkills = missingSkills;
        ms.computedAt = Instant.now();
        return ms;
    }
}
