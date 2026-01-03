package com.chumabanking.sentinel.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data // Lombok handles getters/setters
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    private Long fromAccountId;
    private Long toAccountId;
    private BigDecimal amount;
    private String status; // "SUCCESS" or "BLOCKED"

    private LocalDateTime timestamp;

    // Default constructor for JPA
    public Transaction() {}

    // Convenience constructor
    public Transaction(Long from, Long to, BigDecimal amt, String stat) {
        this.fromAccountId = from;
        this.toAccountId = to;
        this.amount = amt;
        this.status = stat;
        this.timestamp = LocalDateTime.now();
    }
}