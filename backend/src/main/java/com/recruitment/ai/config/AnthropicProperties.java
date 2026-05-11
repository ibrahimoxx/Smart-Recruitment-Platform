package com.recruitment.ai.config;

// DEPLOYMENT: uncomment @Component and @ConfigurationProperties when switching back to Anthropic

import lombok.Getter;
import lombok.Setter;
// import org.springframework.boot.context.properties.ConfigurationProperties;  // DEPLOYMENT: uncomment
// import org.springframework.stereotype.Component;                              // DEPLOYMENT: uncomment

@Getter
@Setter
// @Component                                    // DEPLOYMENT: uncomment
// @ConfigurationProperties(prefix = "app.anthropic")  // DEPLOYMENT: uncomment
public class AnthropicProperties {
    private String apiKey;
    private String model;
    private int maxTokens;
    private String baseUrl;
    private String apiVersion;
}
