package com.recruitment.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.ai.client.OllamaClient; // DEPLOYMENT: change back to AnthropicClient
import com.recruitment.ai.entity.EmailDraft;
import com.recruitment.ai.prompts.PromptConstants;
import com.recruitment.ai.repository.EmailDraftRepository;
import com.recruitment.applications.entity.Application;
import com.recruitment.applications.repository.ApplicationRepository;
import com.recruitment.common.enums.ApplicationStatus;
import com.recruitment.common.events.ApplicationStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailDraftService {

    private final EmailDraftRepository emailDraftRepository;
    private final ApplicationRepository applicationRepository;
    private final OllamaClient anthropicClient; // DEPLOYMENT: change type back to AnthropicClient
    private final ObjectMapper objectMapper;

    @Value("${app.anthropic.model:claude-haiku-4-5-20251001}")
    private String modelName;

    @EventListener
    @Async("aiAsyncExecutor")
    @Transactional
    public void onApplicationStatusChanged(ApplicationStatusChangedEvent event) {
        try {
            Application application = applicationRepository.findById(event.applicationId()).orElse(null);
            if (application == null) {
                log.warn("Application {} not found for email draft", event.applicationId());
                return;
            }

            String candidateName = application.getCandidate().getUser().getFirstName()
                    + " " + application.getCandidate().getUser().getLastName();
            String jobTitle = application.getJobOffer().getTitle();
            String company = application.getJobOffer().getCompany().getName();

            String prompt = PromptConstants.EMAIL_DRAFT_PROMPT.formatted(
                    candidateName,
                    jobTitle,
                    company,
                    event.previousStatus().name(),
                    event.newStatus().name()
            );

            String responseText = anthropicClient.complete(prompt);
            JsonNode node = objectMapper.readTree(responseText);

            EmailDraft draft = EmailDraft.create(
                    event.applicationId(),
                    event.recruiterProfileId(),
                    node.path("subject").asText(),
                    node.path("body").asText(),
                    node.path("tone").asText(),
                    resolveDraftType(event.newStatus()),
                    modelName
            );
            emailDraftRepository.save(draft);
            log.info("Email draft generated for application {} → {}", event.applicationId(), event.newStatus());
        } catch (Exception e) {
            log.error("Email draft failed for application {}: {}", event.applicationId(), e.getMessage(), e);
        }
    }

    private String resolveDraftType(ApplicationStatus newStatus) {
        return switch (newStatus) {
            case INTERVIEW -> "INTERVIEW_INVITE";
            case ACCEPTED -> "ACCEPTANCE";
            case REJECTED -> "REJECTION";
            default -> "GENERAL";
        };
    }
}
