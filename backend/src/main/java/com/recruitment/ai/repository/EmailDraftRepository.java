package com.recruitment.ai.repository;

import com.recruitment.ai.entity.EmailDraft;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailDraftRepository extends JpaRepository<EmailDraft, UUID> {

    List<EmailDraft> findByApplicationIdOrderByCreatedAtDesc(UUID applicationId);

    Optional<EmailDraft> findTopByApplicationIdOrderByCreatedAtDesc(UUID applicationId);
}
