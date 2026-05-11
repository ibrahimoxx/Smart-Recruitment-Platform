package com.recruitment.ai.entity;

import com.recruitment.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "email_drafts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmailDraft extends BaseEntity {

    @Column(name = "application_id")
    private UUID applicationId;

    @Column(name = "recruiter_id")
    private UUID recruiterId;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(length = 64)
    private String tone;

    @Column(name = "draft_type", length = 64)
    private String draftType;

    @Column(name = "generated_by", length = 64)
    private String generatedBy;

    public static EmailDraft create(UUID applicationId, UUID recruiterId,
                                     String subject, String body, String tone,
                                     String draftType, String generatedBy) {
        EmailDraft d = new EmailDraft();
        d.applicationId = applicationId;
        d.recruiterId = recruiterId;
        d.subject = subject;
        d.body = body;
        d.tone = tone;
        d.draftType = draftType;
        d.generatedBy = generatedBy;
        return d;
    }
}
