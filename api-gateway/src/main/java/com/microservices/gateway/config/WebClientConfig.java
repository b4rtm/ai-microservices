package com.microservices.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    // Configuration for WebClient beans to interact with different microservices

    @Bean
    public WebClient spamWebClient(
            @Value("${SPAM_SERVICE_URL:http://spam-detection-service:8000}") String spamUrl) {
        return WebClient.builder().baseUrl(spamUrl).build();
    }

    @Bean
    public WebClient historyWebClient(
            @Value("${SPAM_HISTORY_SERVICE_URL:http://spam-history-service:8082}") String historyUrl) {
        return WebClient.builder().baseUrl(historyUrl).build();
    }

    @Bean
    public WebClient userWebClient(
            @Value("${USER_SERVICE_URL:http://user-service:8081}") String userUrl) {
        return WebClient.builder().baseUrl(userUrl).build();
    }
}
