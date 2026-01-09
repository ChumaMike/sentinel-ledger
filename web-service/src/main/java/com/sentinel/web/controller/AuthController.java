package com.sentinel.web.controller;

import com.sentinel.common.model.User; // 👈 Importing from Common
import com.sentinel.web.repository.UserRepository;
import com.sentinel.web.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private JwtService jwtService;

    // 🌟 1. REGISTRATION (New User)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        User newUser = new User();
        newUser.setFullName(request.get("fullName"));
        newUser.setEmail(email);
        newUser.setPhoneNumber(request.get("phone"));
        newUser.setRole("ROLE_USER");

        // ⚠️ IN REAL LIFE: Use BCrypt to hash these! For now, storing plain text for simplicity.
        newUser.setPasswordHash(request.get("password"));
        newUser.setPinHash(request.get("pin"));

        userRepository.save(newUser);

        return ResponseEntity.ok("User registered successfully. Please login.");
    }

    // 🌟 2. LOGIN (Email + Password)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent() && userOpt.get().getPasswordHash().equals(password)) {
            User user = userOpt.get();

            // Generate Token
            Map<String, Object> claims = Map.of(
                    "name", user.getFullName(),
                    "role", user.getRole(),
                    "uid", user.getUserId() // Add ID to token for easy lookup
            );
            String token = jwtService.generateToken(user.getUserId().toString(), claims);

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "token", token,
                    "user", claims
            ));
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid Email or Password"));
    }
}