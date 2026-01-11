package com.chumabanking.sentinel.controller;

import com.sentinel.common.model.Goal;
import com.chumabanking.sentinel.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired private GoalService goalService;

    // GET My Goals
    @GetMapping
    public ResponseEntity<List<Goal>> getMyGoals() {
        // ⚠️ In a real app, extract UserID from Token. Hardcoded to 1 for prototype.
        Long userId = 1L;
        return ResponseEntity.ok(goalService.getUserGoals(userId));
    }

    // 🌟 UPDATE: Create Goal now accepts more info
    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody Map<String, Object> request) {
        Long userId = 1L;
        String name = (String) request.get("name");
        BigDecimal amount = new BigDecimal(request.get("targetAmount").toString());
        String desc = (String) request.get("description");
        String priority = (String) request.get("priority");

        LocalDate deadline = null;
        if (request.get("deadline") != null) {
            deadline = LocalDate.parse((String) request.get("deadline"));
        }

        return ResponseEntity.ok(goalService.createGoal(userId, name, amount, desc, priority, deadline));
    }

    // 🌟 NEW: Edit Goal Endpoint
    @PutMapping("/{goalId}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long goalId, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(goalService.updateGoal(goalId, updates));
    }

    // 🌟 POST: Contribute Funds
    @PostMapping("/{goalId}/contribute")
    public ResponseEntity<Goal> contribute(@PathVariable Long goalId, @RequestBody Map<String, Object> request) {
        String accountNumber = (String) request.get("accountNumber");
        BigDecimal amount = new BigDecimal(request.get("amount").toString());

        return ResponseEntity.ok(goalService.contributeToGoal(goalId, accountNumber, amount));
    }
}