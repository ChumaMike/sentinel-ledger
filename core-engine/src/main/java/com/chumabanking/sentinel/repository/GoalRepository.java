package com.chumabanking.sentinel.repository;

import com.sentinel.common.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    // Find all goals for a specific user
    List<Goal> findByUserId(Long userId);
}