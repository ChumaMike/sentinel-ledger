package com.chumabanking.sentinel.repository;

import com.sentinel.common.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    // 🌟 Find all accounts belonging to a specific user (Savings, Cheque, etc.)
    List<Account> findByUserId(Long userId);

    // 🌟 Look up an account by its 10-digit number (Retail Logic)
    Optional<Account> findByAccountNumber(String accountNumber);

    // 🌟 Check if an account number already exists (useful for registration)
    boolean existsByAccountNumber(String accountNumber);
}