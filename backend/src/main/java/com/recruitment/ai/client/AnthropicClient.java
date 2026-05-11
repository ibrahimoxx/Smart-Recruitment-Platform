package com.recruitment.ai.client;

// =====================================================================
// DEPLOYMENT RESTORE — Phase 8
// To switch back from Ollama to Anthropic:
//   1. Uncomment @Component on this class
//   2. Remove @Component from OllamaClient
//   3. In CvParsingService, MatchScoringService, EmailDraftService:
//      change `OllamaClient` injection back to `AnthropicClient`
//   4. In application.properties: uncomment Anthropic block, remove Ollama block
//   5. In .env: set ANTHROPIC_API_KEY
// =====================================================================

import com.fasterxml.jackson.annotation.JsonProperty;
import com.recruitment.ai.config.AnthropicProperties;
import com.recruitment.common.exception.AppException;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
// import org.springframework.stereotype.Component;  // DEPLOYMENT: uncomment this
import org.springframework.web.client.RestClient;

@Slf4j
// @Component  // DEPLOYMENT: uncomment — disabled in favour of OllamaClient for local dev
public class AnthropicClient {

    private final AnthropicProperties props;
    private final RestClient restClient;

    public AnthropicClient(AnthropicProperties props) {
        this.props = props;
        this.restClient = RestClient.builder()
                .baseUrl(props.getBaseUrl())
                .defaultHeader("x-api-key", props.getApiKey())
                .defaultHeader("anthropic-version", props.getApiVersion())
                .build();
    }

    public String complete(String userPrompt) {
        if (props.getApiKey() == null || props.getApiKey().isBlank()) {
            throw new AppException(HttpStatus.SERVICE_UNAVAILABLE, "Anthropic API key not configured");
        }
        AnthropicRequest request = new AnthropicRequest(
                props.getModel(),
                props.getMaxTokens(),
                List.of(new AnthropicRequest.Message("user", userPrompt))
        );
        AnthropicResponse response = restClient.post()
                .uri("/v1/messages")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(AnthropicResponse.class);
        if (response == null || response.content() == null || response.content().isEmpty()) {
            throw new AppException(HttpStatus.BAD_GATEWAY, "Empty response from Anthropic API");
        }
        return response.content().get(0).text();
    }

    record AnthropicRequest(
            String model,
            @JsonProperty("max_tokens") int maxTokens,
            List<Message> messages
    ) {
        record Message(String role, String content) {}
    }

    record AnthropicResponse(List<Content> content) {
        record Content(String type, String text) {}
    }
}
