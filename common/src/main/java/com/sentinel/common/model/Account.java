package com.sentinel.common.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "accounts")
@Data
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long accountId;

    private Long userId;

    @Column(unique = true, nullable = false)
    private String accountNumber;

    private String accountType;

    private String accountName;
    private String status;

    private BigDecimal balance;
    private String currency;
}