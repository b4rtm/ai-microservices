package com.microservices.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient.Builder;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    // Configuration for WebClient beans to interact with different microservices

    @Bean
    public WebClient spamWebClient(
            Builder webClientBuilder,
            @Value("${SPAM_SERVICE_URL:http://spam-detection-service:8000}") String spamUrl) {
        return webClientBuilder.baseUrl(spamUrl).build();
    }

    @Bean
    public WebClient historyWebClient(
            Builder webClientBuilder,
            @Value("${SPAM_HISTORY_SERVICE_URL:http://spam-history-service:8082}") String historyUrl) {
        return webClientBuilder.baseUrl(historyUrl).build();
    }

    @Bean
    public WebClient userWebClient(
            Builder webClientBuilder,
            @Value("${USER_SERVICE_URL:http://user-service:8081}") String userUrl) {
        return webClientBuilder.baseUrl(userUrl).build();
    }
}
