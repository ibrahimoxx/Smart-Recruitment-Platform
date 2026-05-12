package com.recruitment.ai.client;

// DEPLOYMENT: remove this file — replace with AnthropicClient (re-enable @Component there)

import com.recruitment.ai.config.OllamaProperties;
import com.recruitment.common.exception.AppException;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class OllamaClient {

    private final OllamaProperties props;
    private final RestClient restClient;

    public OllamaClient(OllamaProperties props) {
        this.props = props;
        this.restClient = RestClient.builder()
                .baseUrl(props.getBaseUrl())
                .build();
    }

    public String complete(String userPrompt) {
        OllamaRequest request = new OllamaRequest(
                props.getModel(),
                List.of(new OllamaRequest.Message("user", userPrompt)),
                false
        );
        OllamaResponse response = restClient.post()
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(OllamaResponse.class);
        if (response == null || response.message() == null) {
            throw new AppException(HttpStatus.BAD_GATEWAY, "Empty response from Ollama");
        }
        return extractJson(response.message().content());
    }

    private String extractJson(String text) {
        // Strip markdown code fences (```json ... ``` or ``` ... ```)
        String cleaned = text.replaceAll("(?s)```(?:json)?\\s*", "").trim();
        // Find first JSON object or array
        int objStart = cleaned.indexOf('{');
        int arrStart = cleaned.indexOf('[');
        int start;
        char closeChar;
        if (objStart < 0 && arrStart < 0) return cleaned;
        if (objStart < 0) { start = arrStart; closeChar = ']'; }
        else if (arrStart < 0) { start = objStart; closeChar = '}'; }
        else if (objStart < arrStart) { start = objStart; closeChar = '}'; }
        else { start = arrStart; closeChar = ']'; }
        int end = cleaned.lastIndexOf(closeChar);
        return (end > start) ? cleaned.substring(start, end + 1) : cleaned;
    }

    record OllamaRequest(String model, List<Message> messages, boolean stream) {
        record Message(String role, String content) {}
    }

    record OllamaResponse(Message message, boolean done) {
        record Message(String role, String content) {}
    }
}
