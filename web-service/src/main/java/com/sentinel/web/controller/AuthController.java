package com.sentinel.web.controller;

import com.sentinel.web.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", exposedHeaders = "Authorization")
public class AuthController {

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody Map<String, String> request) {
        String enteredPin = request.get("pin");

        if ("1234".equals(enteredPin)) {
            // 🌟 Define the profile data (claims)
            Map<String, Object> claims = Map.of(
                    "name", "Chuma Meyiswa",
                    "email", "nmeyiswa@gmail.com",
                    "role", "SENTINEL_PREMIUM"
            );

            // 🌟 Pass BOTH username and claims to generateToken
            String token = jwtService.generateToken("SENTINEL_USER_01", claims);

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "token", token,
                    "user", claims // Send to React for Sidebar display
            ));
        }

        return ResponseEntity.status(401).body(Map.of(
                "status", "FAILED",
                "message", "Invalid Security PIN"
        ));
    }
}