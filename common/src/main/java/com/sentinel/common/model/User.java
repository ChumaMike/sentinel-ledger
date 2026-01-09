package com.sentinel.common.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash; // 🔒 For Login

    @Column(nullable = false)
    private String pinHash;      // 🔢 For Transactions (The 2nd Layer of Security)

    private String phoneNumber;

    private String role; // e.g., "ROLE_USER"
}