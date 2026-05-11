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
@Table(name = "cv_parsed_data")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CvParsedData extends BaseEntity {

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Column(name = "source_file_name", length = 255)
    private String sourceFileName;

    @Column(name = "source_object_key", length = 512)
    private String sourceObjectKey;

    @Column(name = "raw_text", columnDefinition = "TEXT")
    private String rawText;

    @Column(name = "parsed_summary", columnDefinition = "TEXT")
    private String parsedSummary;

    @Column(name = "parsed_skills", columnDefinition = "TEXT")
    private String parsedSkills;

    @Column(name = "parsed_experience", columnDefinition = "TEXT")
    private String parsedExperience;

    @Column(name = "parsed_education", columnDefinition = "TEXT")
    private String parsedEducation;

    @Column(name = "parsed_at")
    private Instant parsedAt;

    public static CvParsedData create(UUID candidateId, String sourceObjectKey, String sourceFileName) {
        CvParsedData d = new CvParsedData();
        d.candidateId = candidateId;
        d.sourceObjectKey = sourceObjectKey;
        d.sourceFileName = sourceFileName;
        return d;
    }

    public void updateParsedData(String rawText, String parsedSummary,
                                  String parsedSkills, String parsedExperience,
                                  String parsedEducation) {
        this.rawText = rawText;
        this.parsedSummary = parsedSummary;
        this.parsedSkills = parsedSkills;
        this.parsedExperience = parsedExperience;
        this.parsedEducation = parsedEducation;
        this.parsedAt = Instant.now();
    }
}
