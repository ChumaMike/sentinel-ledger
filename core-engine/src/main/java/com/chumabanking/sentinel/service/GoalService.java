package com.chumabanking.sentinel.service;

import com.sentinel.common.model.Goal;
import com.chumabanking.sentinel.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    public Goal createGoal(Goal goal) {
        goal.setCurrentAmount(BigDecimal.ZERO); // Start at 0
        goal.setStatus("IN_PROGRESS");
        return goalRepository.save(goal);
    }

    public List<Goal> getMyGoals(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    // 🧠 THE BRAIN: Calculate Savings Advice
    public String getSavingAdvice(Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            return "🎉 You have already reached your goal for " + goal.getName() + "!";
        }

        BigDecimal remainingAmount = goal.getTargetAmount().subtract(goal.getCurrentAmount());
        long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), goal.getDeadline());

        if (daysLeft <= 0) return "⚠️ The deadline has passed!";

        long weeksLeft = daysLeft / 7;
        if (weeksLeft < 1) weeksLeft = 1; // Avoid divide by zero

        BigDecimal weeklySave = remainingAmount.divide(BigDecimal.valueOf(weeksLeft), 2, RoundingMode.HALF_UP);

        return "💡 Tip: To buy '" + goal.getName() + "' by " + goal.getDeadline() +
                ", you need to save R " + weeklySave + " per week.";
    }
}