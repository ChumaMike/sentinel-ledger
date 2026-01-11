package com.chumabanking.sentinel.service;

import com.chumabanking.sentinel.repository.AccountRepository;
import com.chumabanking.sentinel.repository.TransactionRepository;
import com.sentinel.common.model.Account;
import com.sentinel.common.model.Goal;
import com.chumabanking.sentinel.repository.GoalRepository;
import com.sentinel.common.model.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class GoalService {

    @Autowired private GoalRepository goalRepository;
    @Autowired private AccountRepository accountRepository;
    @Autowired private TransactionRepository transactionRepository;

    public List<Goal> getUserGoals(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    // 🌟 NEW: Move money from Account -> Goal
    @Transactional // Important for data integrity
    public Goal contributeToGoal(Long goalId, String fromAccountNumber, BigDecimal amount) {
        // 1. Fetch Goal and Account
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        Account account = accountRepository.findByAccountNumber(fromAccountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // 2. Check Balance
        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        // 3. Move Money
        account.setBalance(account.getBalance().subtract(amount)); // Deduct from Account
        goal.setCurrentAmount(goal.getCurrentAmount().add(amount)); // Add to Goal

        // 4. Update Status
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus("ACHIEVED");
        }

        // 5. Save Changes
        accountRepository.save(account);
        Goal updatedGoal = goalRepository.save(goal);

        // 6. Log Transaction (So it shows on dashboard)
        Transaction tx = new Transaction();
        tx.setFromAccountId(account.getAccountId());
        tx.setSenderAccountNumber(account.getAccountNumber());
        tx.setAmount(amount);
        tx.setDescription("Contribution to Goal: " + goal.getName());
        tx.setTransactionType("GOAL_CONTRIBUTION"); // New Type
        tx.setStatus("SUCCESS");
        tx.setTimestamp(java.time.LocalDateTime.now());
        transactionRepository.save(tx);

        return updatedGoal;
    }

    // 🌟 NEW: Update an existing goal
    public Goal updateGoal(Long goalId, Map<String, Object> updates) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (updates.containsKey("name")) goal.setName((String) updates.get("name"));
        if (updates.containsKey("description")) goal.setDescription((String) updates.get("description"));
        if (updates.containsKey("priority")) goal.setPriority((String) updates.get("priority"));
        if (updates.containsKey("notes")) goal.setNotes((String) updates.get("notes"));
        if (updates.containsKey("status")) goal.setStatus((String) updates.get("status"));

        // Handle Date conversion
        if (updates.containsKey("deadline") && updates.get("deadline") != null) {
            goal.setDeadline(LocalDate.parse((String) updates.get("deadline")));
        }

        // 🌟 Manual Progress Adjustment
        if (updates.containsKey("currentAmount")) {
            goal.setCurrentAmount(new BigDecimal(updates.get("currentAmount").toString()));
        }

        // Check completion logic
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus("COMPLETED");
        }

        return goalRepository.save(goal);
    }

    // Update createGoal to include new fields
    public Goal createGoal(Long userId, String name, BigDecimal targetAmount, String description, String priority, LocalDate deadline) {
        Goal goal = new Goal();
        goal.setUserId(userId);
        goal.setName(name);
        goal.setTargetAmount(targetAmount);
        goal.setCurrentAmount(BigDecimal.ZERO);
        goal.setStatus("IN_PROGRESS");
        goal.setDescription(description);
        goal.setPriority(priority);
        goal.setDeadline(deadline);
        goal.setCreatedDate(LocalDate.now());

        return goalRepository.save(goal);
    }
}