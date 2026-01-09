package com.sentinel.common.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "goals")
@Data
@NoArgsConstructor
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "goal_id")
    private Long goalId;

    @Column(nullable = false)
    private Long userId; // Link to the user who owns this goal

    @Column(nullable = false)
    private String name; // e.g., "PlayStation 5"

    @Column(nullable = false)
    private BigDecimal targetAmount; // e.g., R 12,000.00

    @Column(nullable = false)
    private BigDecimal currentAmount; // e.g., R 500.00

    private LocalDate deadline; // e.g., 2026-06-30

    private String status; // "IN_PROGRESS", "COMPLETED", "FAILED"

    // 💡 Helper to check progress (0.0 to 1.0)
    public double getProgressPercentage() {
        if (targetAmount == null || targetAmount.compareTo(BigDecimal.ZERO) == 0) return 0.0;
        return currentAmount.doubleValue() / targetAmount.doubleValue() * 100.0;
    }
}