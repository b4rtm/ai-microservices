package com.example.userservice.service;

import com.example.userservice.dto.UserDto;
import com.example.userservice.entity.User;
import com.example.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserDto createUser(String email, String password, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }
        String hashed = passwordEncoder.encode(password);
        User saved = userRepository.save(User.builder().email(email).password(hashed).role(role).build());
        log.info("Created user id={}", saved.getId());
        return toDto(saved);
    }

    public UserDto verifyUser(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return toDto(user);
    }

    public UserDto getUserByEmail(String email) {
        return userRepository.findByEmail(email).map(this::toDto)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public UserDto getUserById(Long id) {
        return userRepository.findById(id).map(this::toDto)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserDto toDto(User u) {
        return UserDto.builder().id(u.getId()).email(u.getEmail()).password(u.getPassword()).role(u.getRole()).build();
    }
}
