package com.chumabanking.sentinel.controller;

import com.sentinel.common.model.Goal;
import com.chumabanking.sentinel.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "http://localhost:5173")
public class GoalController {

    @Autowired private GoalService goalService;

    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody Goal goal) {
        Long userId = getCurrentUserId();
        goal.setUserId(userId); // Link goal to the logged-in user
        return ResponseEntity.ok(goalService.createGoal(goal));
    }

    @GetMapping
    public List<Goal> myGoals() {
        return goalService.getMyGoals(getCurrentUserId());
    }

    // 🧠 The "Sentinel Advisor" Endpoint
    @GetMapping("/{id}/advice")
    public ResponseEntity<Map<String, String>> getAdvice(@PathVariable Long id) {
        String advice = goalService.getSavingAdvice(id);
        return ResponseEntity.ok(Map.of("message", advice));
    }

    private Long getCurrentUserId() {
        String userIdStr = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(userIdStr);
    }
}