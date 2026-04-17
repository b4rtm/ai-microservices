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

    void init(@Observes StartupEvent ev, Vertx vertx) {

        String instanceId = System.getenv("HOSTNAME");

        ConsulClient client = ConsulClient.create(
                vertx,
                new ConsulClientOptions().setHost(host).setPort(port)
        );

        client.registerServiceAndAwait(
                new ServiceOptions()
                        .setName("spam-history-service") 
                        .setId("spam-history-service-" + instanceId)
                        .setAddress(instanceId) 
                        .setPort(servicePort)
                        .setCheckOptions(
                                new CheckOptions()
                                        .setHttp("http://" + instanceId + ":" + servicePort + "/q/health/ready") // 🔥 ZAMIANA
                                        .setInterval("10s")
                                        .setDeregisterAfter("1m")
                        )
        );
    }
}