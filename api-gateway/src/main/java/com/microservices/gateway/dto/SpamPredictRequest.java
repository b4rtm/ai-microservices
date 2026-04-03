package com.microservices.gateway.dto;

public record SpamPredictRequest(String text, Long userId) {}
