package com.example.userservice.service;

import com.example.userservice.dto.UserDto;
import com.example.userservice.entity.User;
import com.example.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_USER = "USER";

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
        if (user.isArchived()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account is archived");
        }
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return toDto(user);
    }

    public List<UserDto> getAllActiveUsers() {
        return userRepository.findAllByArchivedFalse().stream()
            .map(this::toDto)
            .toList();
    }

    public Page<UserDto> getAllUsers(int page, int size, String email) {
        Pageable pageable = PageRequest.of(page, size);
        if (!StringUtils.hasText(email)) {
            return userRepository.findAll(pageable).map(this::toDto);
        }
        return userRepository.findByEmailContainingIgnoreCase(email, pageable).map(this::toDto);
    }

    public void toggleArchiveUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        boolean archived = !user.isArchived();
        user.setArchived(archived);
        userRepository.save(user);
        log.info("Updated archive status for user id={} archived={}", id, archived);
    }

    public void toggleUserRole(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String currentRole = user.getRole();
        String nextRole;
        if (ROLE_ADMIN.equalsIgnoreCase(currentRole)) {
            nextRole = ROLE_USER;
        } else if (ROLE_USER.equalsIgnoreCase(currentRole)) {
            nextRole = ROLE_ADMIN;
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User role must be ADMIN or USER");
        }

        user.setRole(nextRole);
        userRepository.save(user);
        log.info("Updated role for user id={} role={}", id, nextRole);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        userRepository.delete(user);
        log.info("Deleted user id={}", id);
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
        return UserDto.builder()
            .id(u.getId())
            .email(u.getEmail())
            .password(u.getPassword())
            .role(u.getRole())
            .archived(u.isArchived())
            .build();
    }
}
