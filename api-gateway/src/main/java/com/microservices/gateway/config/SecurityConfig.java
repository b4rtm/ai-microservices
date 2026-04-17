package com.microservices.gateway.config;

import com.microservices.gateway.security.JwtAuthenticationFilter;
import com.microservices.gateway.security.JwtUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable) // disable CSRF because we are using JWTs and not cookies
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable) // disable basic auth because we are using JWTs
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable) // do not auto generate login page
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // enable CORS with our custom configuration
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(HttpMethod.OPTIONS).permitAll() // allow preflight CORS requests without authentication
                        .pathMatchers(
                                "/auth/**",
                                "/actuator/health",
                                "/spam/health",
                                "/spam/predict",
                                "/users/users/health"
                        ).permitAll()
                        .pathMatchers("/admin/**", "/users/**").hasRole("ADMIN")
                        .anyExchange().authenticated()
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtUtil), SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // allow authorization headers (Bearer <token>) to be sent in CORS requests

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // apply CORS configuration to all endpoints
        return source;
    }
}
