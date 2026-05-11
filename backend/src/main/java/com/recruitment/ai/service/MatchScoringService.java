package com.recruitment.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.ai.client.OllamaClient; // DEPLOYMENT: change back to AnthropicClient
import com.recruitment.ai.entity.CvParsedData;
import com.recruitment.ai.entity.MatchScore;
import com.recruitment.ai.prompts.PromptConstants;
import com.recruitment.ai.repository.CvParsedDataRepository;
import com.recruitment.ai.repository.MatchScoreRepository;
import com.recruitment.common.events.ApplicationSubmittedEvent;
import com.recruitment.jobs.entity.JobOffer;
import com.recruitment.jobs.repository.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchScoringService {

    private final MatchScoreRepository matchScoreRepository;
    private final CvParsedDataRepository cvParsedDataRepository;
    private final JobOfferRepository jobOfferRepository;
    private final OllamaClient anthropicClient; // DEPLOYMENT: change type back to AnthropicClient
    private final ObjectMapper objectMapper;

    @EventListener
    @Async("aiAsyncExecutor")
    @Transactional
    public void onApplicationSubmitted(ApplicationSubmittedEvent event) {
        try {
            if (matchScoreRepository.existsByApplicationId(event.applicationId())) {
                return;
            }

            CvParsedData cvData = cvParsedDataRepository
                    .findTopByCandidateIdOrderByParsedAtDesc(event.candidateProfileId())
                    .orElse(null);
            if (cvData == null || cvData.getParsedSkills() == null) {
                log.warn("No parsed CV data for candidate {}, skipping scoring", event.candidateProfileId());
                return;
            }

            JobOffer job = jobOfferRepository.findById(event.jobOfferId()).orElse(null);
            if (job == null) {
                log.warn("Job offer {} not found, skipping scoring", event.jobOfferId());
                return;
            }

            String cvJson = buildCvJson(cvData);
            String prompt = PromptConstants.MATCH_SCORING_PROMPT.formatted(
                    cvJson,
                    job.getTitle(),
                    job.getDescription(),
                    job.getRequirements() != null ? job.getRequirements() : ""
            );

            String responseText = anthropicClient.complete(prompt);
            JsonNode node = objectMapper.readTree(responseText);

            MatchScore matchScore = MatchScore.create(
                    event.applicationId(),
                    node.path("score").asDouble(),
                    node.path("justification").asText(),
                    node.path("matched_skills").toString(),
                    node.path("missing_skills").toString()
            );
            matchScoreRepository.save(matchScore);
            log.info("Match score {} computed for application {}", matchScore.getScore(), event.applicationId());
        } catch (Exception e) {
            log.error("Match scoring failed for application {}: {}", event.applicationId(), e.getMessage(), e);
        }
    }

    private String buildCvJson(CvParsedData cvData) {
        return String.format(
                "{\"summary\":%s,\"skills\":%s,\"experiences\":%s,\"education\":%s}",
                quoteOrNull(cvData.getParsedSummary()),
                nvl(cvData.getParsedSkills()),
                nvl(cvData.getParsedExperience()),
                nvl(cvData.getParsedEducation())
        );
    }

    private String quoteOrNull(String value) {
        return value != null ? "\"" + value.replace("\"", "\\\"") + "\"" : "null";
    }

    private String nvl(String value) {
        return value != null ? value : "[]";
    }
}
