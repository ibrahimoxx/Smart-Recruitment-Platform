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
        return response.message().content();
    }

    record OllamaRequest(String model, List<Message> messages, boolean stream) {
        record Message(String role, String content) {}
    }

    record OllamaResponse(Message message, boolean done) {
        record Message(String role, String content) {}
    }
}
