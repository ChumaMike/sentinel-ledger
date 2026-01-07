package com.sentinel.common.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cards")
@Data
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cardId;

    @Column(unique = true, nullable = false)
    private String cardNumber; // 🌟 16 digits

    private String cardName; // 🌟 e.g., "Main Debit" or "Online Shopping"
    private String expiryDate; // MM/YY
    private String cvv;

    private Long accountId; // 🔗 Links to the Account "Bucket"
    private Long userId;    // 🔗 Owner of the card
}