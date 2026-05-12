package com.recruitment.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.ai.client.OllamaClient; // DEPLOYMENT: change back to AnthropicClient
import com.recruitment.ai.entity.CvParsedData;
import com.recruitment.ai.prompts.PromptConstants;
import com.recruitment.ai.repository.CvParsedDataRepository;
import com.recruitment.common.config.MinioProperties;
import com.recruitment.common.events.CvUploadedEvent;
import com.recruitment.storage.StorageService;
import java.io.InputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CvParsingService {

    private final CvParsedDataRepository cvParsedDataRepository;
    private final StorageService storageService;
    private final MinioProperties minioProperties;
    private final OllamaClient anthropicClient; // DEPLOYMENT: change type back to AnthropicClient
    private final ObjectMapper objectMapper;

    @EventListener
    @Async("aiAsyncExecutor")
    public void onCvUploaded(CvUploadedEvent event) {
        log.info("CV parsing triggered: candidate={} key={}", event.candidateProfileId(), event.objectKey());
        try {
            CvParsedData existing = cvParsedDataRepository
                    .findByCandidateIdAndSourceObjectKey(event.candidateProfileId(), event.objectKey())
                    .orElse(null);

            String rawText = extractPdfText(minioProperties.getBucketCv(), event.objectKey());
            log.info("PDF text extracted: {} chars for candidate {}", rawText.length(), event.candidateProfileId());
            if (rawText.isBlank()) {
                log.warn("PDF has no text layer — candidate={} key={} — upload a text-based PDF, not a scanned image",
                        event.candidateProfileId(), event.objectKey());
                return;
            }

            String prompt = PromptConstants.CV_PARSING_PROMPT.formatted(rawText);
            String responseText = anthropicClient.complete(prompt);
            JsonNode node = objectMapper.readTree(responseText);

            CvParsedData data = existing != null
                    ? existing
                    : CvParsedData.create(event.candidateProfileId(), event.objectKey(), event.originalFilename());

            data.updateParsedData(
                    rawText,
                    node.path("summary").asText(),
                    node.path("skills").toString(),
                    node.path("experiences").toString(),
                    node.path("education").toString()
            );
            cvParsedDataRepository.save(data);
            log.info("CV parsing complete for candidate {}", event.candidateProfileId());
        } catch (Exception e) {
            log.error("CV parsing failed for candidate={} key={}: {}",
                    event.candidateProfileId(), event.objectKey(), e.getMessage(), e);
        }
    }

    public String extractTextFromCv(String objectKey) throws Exception {
        return extractPdfText(minioProperties.getBucketCv(), objectKey);
    }

    private String extractPdfText(String bucket, String objectKey) throws Exception {
        try (InputStream stream = storageService.downloadFile(bucket, objectKey)) {
            byte[] pdfBytes = stream.readAllBytes();
            try (PDDocument doc = Loader.loadPDF(pdfBytes)) {
                return new PDFTextStripper().getText(doc);
            }
        }
    }
}
