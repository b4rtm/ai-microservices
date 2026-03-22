package com.example;

import io.micronaut.runtime.Micronaut;

public class Application {

    public static void main(String[] args) {
        Micronaut.build(args)
                .properties(
                        java.util.Map.of(
                                "micronaut.scheduling.enabled", false
                        )
                )
                .start();
    }
}