package com.recruitment.ai.dto;

import com.recruitment.ai.entity.EmailDraft;
import java.time.Instant;
import java.util.UUID;

public record EmailDraftResponse(
        UUID id,
        UUID applicationId,
        String subject,
        String body,
        String tone,
        String draftType,
        String generatedBy,
        Instant createdAt
) {
    public static EmailDraftResponse from(EmailDraft draft) {
        return new EmailDraftResponse(
                draft.getId(),
                draft.getApplicationId(),
                draft.getSubject(),
                draft.getBody(),
                draft.getTone(),
                draft.getDraftType(),
                draft.getGeneratedBy(),
                draft.getCreatedAt()
        );
    }
}
