package com.microservices.gateway.dto;

public record SpamHistoryRequest(Long userId, String text, String category, double prediction, boolean isDeleted) {}
