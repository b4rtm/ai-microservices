package com.microservices.gateway.controller;

import com.microservices.gateway.dto.SpamFastApiRequest;
import com.microservices.gateway.dto.SpamHistoryRequest;
import com.microservices.gateway.dto.SpamPredictRequest;
import com.microservices.gateway.dto.SpamPredictResponse;
import com.microservices.gateway.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

@RestController
@RequestMapping("/spam")
public class SpamOrchestrationController {

    private static final Logger log = LoggerFactory.getLogger(SpamOrchestrationController.class);

    private final WebClient spamWebClient;
    private final WebClient historyWebClient;
    private final JwtUtil jwtUtil;

    public SpamOrchestrationController(
            @Qualifier("spamWebClient") WebClient spamWebClient,
            @Qualifier("historyWebClient") WebClient historyWebClient,
            JwtUtil jwtUtil) {
        this.spamWebClient = spamWebClient;
        this.historyWebClient = historyWebClient;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/predict")
    public Mono<SpamPredictResponse> predict(
            @RequestBody SpamPredictRequest request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        return callSpamService(request.text())
                .doOnSuccess(result -> saveHistory(request, result, authHeader));
    }

    private Mono<SpamPredictResponse> callSpamService(String text) {
        return spamWebClient.post()
                .uri("/predict")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new SpamFastApiRequest(text))
                .retrieve()
                .onStatus(HttpStatusCode::is5xxServerError,
                        r -> Mono.error(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Spam service error")))
                .bodyToMono(SpamPredictResponse.class)
                .retryWhen(Retry.max(1)
                        .filter(SpamOrchestrationController::isRetryable)
                        .onRetryExhaustedThrow((spec, signal) ->
                                new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Spam service unavailable")));
    }

    private void saveHistory(SpamPredictRequest request, SpamPredictResponse result, String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        historyWebClient.post()
                .uri("/user/add")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new SpamHistoryRequest(
                        userId, request.text(), result.category(), result.spamProbability(), false))
                .retrieve()
                .toBodilessEntity()
                .retryWhen(Retry.max(1).filter(SpamOrchestrationController::isRetryable))
                .subscribe(
                        ok  -> log.debug("History saved for user={}", userId),
                        err -> log.warn("Failed to save history (fire-and-forget): {}", err.getMessage()));
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return 0L;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return 0L;
        }

        Long userId = jwtUtil.extractUserId(token);
        return userId != null ? userId : 0L;
    }

    private static boolean isRetryable(Throwable e) {
        // only retry on connection-level failures (no HTTP response received)
        return !(e instanceof WebClientResponseException);
    }

}