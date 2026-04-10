package com.microservices.gateway.controller;

import com.microservices.gateway.dto.SpamFastApiRequest;
import com.microservices.gateway.dto.SpamHistoryRequest;
import com.microservices.gateway.dto.SpamPredictRequest;
import com.microservices.gateway.dto.SpamPredictResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
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

    public SpamOrchestrationController(
            @Qualifier("spamWebClient") WebClient spamWebClient,
            @Qualifier("historyWebClient") WebClient historyWebClient) {
        this.spamWebClient = spamWebClient;
        this.historyWebClient = historyWebClient;
    }

    @PostMapping("/predict")
    public Mono<SpamPredictResponse> predict(@RequestBody SpamPredictRequest request) {
        return callSpamService(request.text())
                .doOnSuccess(result -> saveHistory(request, result));
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

    private void saveHistory(SpamPredictRequest request, SpamPredictResponse result) {
        Long userId = request.userId() != null ? request.userId() : 0L;
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

    private static boolean isRetryable(Throwable e) {
        // only retry on connection-level failures (no HTTP response received)
        return !(e instanceof WebClientResponseException);
    }

}