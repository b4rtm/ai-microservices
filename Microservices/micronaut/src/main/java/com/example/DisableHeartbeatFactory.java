package com.example;

import io.micronaut.context.annotation.Factory;
import io.micronaut.context.annotation.Replaces;
import io.micronaut.health.HeartbeatTask;

@Factory
public class DisableHeartbeatFactory {

    @Replaces(HeartbeatTask.class)
    HeartbeatTask disableHeartbeat() {
        return null;
    }
}