package com.example.userservice.controller;

import com.example.userservice.dto.UserDto;
import com.example.userservice.dto.VerifyRequest;
import com.example.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto req) {
        log.info("POST /users email={}", req.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(userService.createUser(req.getEmail(), req.getPassword(), req.getRole()));
    }

    @PostMapping("/verify")
    public ResponseEntity<UserDto> verifyUser(@Valid @RequestBody VerifyRequest req) {
        log.info("POST /users/verify email={}", req.getEmail());
        return ResponseEntity.ok(userService.verifyUser(req.getEmail(), req.getPassword()));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllActiveUsers() {
        return ResponseEntity.ok(userService.getAllActiveUsers());
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<Void> archiveUser(@PathVariable Long id) {
        log.info("PATCH /users/{}/archive", id);
        userService.archiveUser(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("DELETE /users/{}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "user-service-" + System.getenv("HOSTNAME")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
