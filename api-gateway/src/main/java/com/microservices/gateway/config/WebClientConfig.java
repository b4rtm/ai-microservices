package com.microservices.gateway.config;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.web.reactive.function.client.WebClientCustomizer;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient.Builder;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    // Configuration for WebClient beans to interact with different microservices

    @Bean
    @LoadBalanced
    public Builder loadBalancedWebClientBuilder(ObjectProvider<WebClientCustomizer> customizerProvider) {
        Builder builder = WebClient.builder();
        customizerProvider.orderedStream().forEach(customizer -> customizer.customize(builder));
        return builder;
    }

    @Bean
    public WebClient spamWebClient(
            @LoadBalanced Builder webClientBuilder) {
        return webClientBuilder.baseUrl("http://spam-detection-service").build();
    }

    @Bean
    public WebClient historyWebClient(
            @LoadBalanced Builder webClientBuilder) {
        return webClientBuilder.baseUrl("http://spam-history-service").build();
    }

    @Bean
    public WebClient userWebClient(
            @LoadBalanced Builder webClientBuilder) {
        return webClientBuilder.baseUrl("http://user-service").build();
    }
}
