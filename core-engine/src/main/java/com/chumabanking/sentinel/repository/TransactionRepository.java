package com.chumabanking.sentinel.repository;

import com.chumabanking.sentinel.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // This allows us to show the latest banking activity first
    List<Transaction> findAllByOrderByTimestampDesc();
}