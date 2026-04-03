package com.microservices.gateway.dto;
import com.fasterxml.jackson.annotation.JsonProperty;

public record SpamPredictResponse(
        String category,
        @JsonProperty("spam_probability") double spamProbability) {}