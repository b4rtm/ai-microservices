package com.example;

import io.quarkus.runtime.StartupEvent;
import io.vertx.ext.consul.CheckOptions;
import io.vertx.mutiny.core.Vertx;

import io.vertx.ext.consul.ConsulClientOptions;
import io.vertx.ext.consul.ServiceOptions;
import io.vertx.mutiny.ext.consul.ConsulClient;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class ConsulRegistration {

    @ConfigProperty(name = "consul.host")
    String host;

    @ConfigProperty(name = "consul.port")
    int port;

    @ConfigProperty(name = "quarkus.http.port")
    int servicePort;

    @ConfigProperty(name = "service.address")
    String serviceAddress;

    void init(@Observes StartupEvent ev, Vertx vertx) {
        ConsulClient client = ConsulClient.create(
                vertx,
                new ConsulClientOptions().setHost(host).setPort(port)
        );

        client.registerServiceAndAwait(
                new ServiceOptions()
                        .setName("quarkus-service")
                        .setId("quarkus-service-1")
                        .setAddress(serviceAddress)
                        .setPort(servicePort)
                        .setCheckOptions(
                                new CheckOptions()
                                        .setHttp("http://" + serviceAddress + ":" + servicePort + "/q/health/ready")
                                        .setInterval("10s")
                                        //.setDeregisterAfter("1m")
                        )
        );
    }
}
