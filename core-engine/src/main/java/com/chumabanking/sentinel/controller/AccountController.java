package com.chumabanking.sentinel.controller;

import com.sentinel.common.model.Account;
import com.sentinel.common.model.Transaction;
import com.chumabanking.sentinel.repository.AccountRepository;
import com.chumabanking.sentinel.repository.TransactionRepository;
import com.chumabanking.sentinel.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired private AccountRepository accountRepository;
    @Autowired private TransactionRepository transactionRepository; // 👈 Inject Repository
    @Autowired private AccountService accountService;

    @GetMapping
    public List<Account> getMyAccounts() {
        Long userId = getCurrentUserId();
        return accountRepository.findByUserId(userId);
    }

    // 🌟 THE MISSING ENDPOINT
    @GetMapping("/history")
    public List<Transaction> getHistory() {
        Long userId = getCurrentUserId();

        // 1. Get all my account numbers
        List<Account> myAccounts = accountRepository.findByUserId(userId);
        List<Transaction> allHistory = new ArrayList<>();

        // 2. For each account, find its transactions
        for (Account acc : myAccounts) {
            List<Transaction> txs = transactionRepository
                    .findBySenderAccountNumberOrReceiverAccountNumberOrderByTimestampDesc(
                            acc.getAccountNumber(),
                            acc.getAccountNumber()
                    );
            allHistory.addAll(txs);
        }

        // 3. (Optional) Sort strictly by date if needed, but the DB query helps.
        return allHistory;
    }

    @PostMapping("/transfer")
    public ResponseEntity<String> transfer(
            @RequestParam String fromAcc,
            @RequestParam String toAcc,
            @RequestParam BigDecimal amount,
            @RequestParam String description) {

        String result = accountService.transferMoney(fromAcc, toAcc, amount, description);
        return ResponseEntity.ok(result);
    }

    // Helper to get User ID from the Token
    private Long getCurrentUserId() {
        String userIdStr = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(userIdStr);
    }
}