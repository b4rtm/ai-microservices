package com.microservices.gateway.controller;

import com.microservices.gateway.dto.GatewayUserDto;
import com.microservices.gateway.dto.LoginRequest;
import com.microservices.gateway.dto.LoginResponse;
import com.microservices.gateway.dto.RegisterRequest;
import com.microservices.gateway.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final WebClient userWebClient;
    private final JwtUtil jwtUtil;

    public AuthController(
            @Qualifier("userWebClient") WebClient userWebClient,
            JwtUtil jwtUtil) {
        this.userWebClient = userWebClient;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public Mono<LoginResponse> login(@RequestBody LoginRequest request) {
        return userWebClient.post()
                .uri("/users/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("email", request.email(), "password", request.password()))
                .retrieve()
                .bodyToMono(GatewayUserDto.class)
                .map(user -> {
                    String token = jwtUtil.generateToken(user.email(), user.role(), user.id());
                    log.info("Login successful for email={}", user.email());
                    return new LoginResponse(token, user.email(), user.role(), user.id());
                })
                .onErrorMap(WebClientResponseException.class, ex -> {
                    if (ex.getStatusCode().value() == 401 || ex.getStatusCode().value() == 404) {
                        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
                    }
                    log.error("User service error during login: {}", ex.getMessage());
                    return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Authentication service unavailable");
                });
    }

    @PostMapping("/register")
    public Mono<LoginResponse> register(@RequestBody RegisterRequest request) {
        return userWebClient.post()
                .uri("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("email", request.email(), "password", request.password(), "role", "USER"))
                .retrieve()
                .bodyToMono(GatewayUserDto.class)
                .map(user -> {
                    String token = jwtUtil.generateToken(user.email(), user.role(), user.id());
                    log.info("Registration successful for email={}", user.email());
                    return new LoginResponse(token, user.email(), user.role(), user.id());
                })
                .onErrorMap(WebClientResponseException.class, ex -> {
                    if (ex.getStatusCode().value() == 409) {
                        return new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
                    }
                    log.error("User service error during registration: {}", ex.getMessage());
                    return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Registration service unavailable");
                });
    }
}
