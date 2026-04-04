package com.microservices.gateway.dto;

public record LoginResponse(String token, String email, String role, Long userId) {}
