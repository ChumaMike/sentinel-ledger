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
import java.util.Map;

// 🌟 MISSING IMPORTS ADDED HERE
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private AccountService accountService;

    @GetMapping
    public List<Account> getMyAccounts() {
        Long userId = getCurrentUserId();
        return accountRepository.findByUserId(userId);
    }

    @GetMapping("/history")
    public List<Transaction> getHistory() {
        Long userId = getCurrentUserId();

        List<Account> myAccounts = accountRepository.findByUserId(userId);
        Set<Transaction> uniqueHistory = new HashSet<>();

        for (Account acc : myAccounts) {
            List<Transaction> txs = transactionRepository
                    .findBySenderAccountNumberOrReceiverAccountNumberOrderByTimestampDesc(
                            acc.getAccountNumber(),
                            acc.getAccountNumber()
                    );
            uniqueHistory.addAll(txs);
        }
        return new ArrayList<>(uniqueHistory);
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

    // 🌟 NEW: Manual Expense Endpoint (Fixed)
    @PostMapping("/expense")
    public ResponseEntity<?> logExpense(@RequestBody Map<String, Object> request) {
        String accountNum = (String) request.get("accountNumber");
        String category = (String) request.get("category");
        String description = (String) request.get("description");

        // Safety conversion for amount
        BigDecimal amount = new BigDecimal(request.get("amount").toString());

        Transaction tx = accountService.logManualExpense(accountNum, amount, category, description);
        return ResponseEntity.ok(tx);
    }

    // Helper to get User ID
    private Long getCurrentUserId() {
        String userIdStr = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(userIdStr);
    }

    @PostMapping("/create")
    public ResponseEntity<Account> createAccount(@RequestBody Map<String, String> request) {
        Long userId = getCurrentUserId();
        String type = request.get("type"); // e.g., "SAVINGS"
        String name = request.get("name"); // e.g., "Emergency Fund"

        Account newAccount = accountService.createAccount(userId, type, name);
        return ResponseEntity.ok(newAccount);
    }

    @PostMapping("/deposit")
    public ResponseEntity<Transaction> deposit(@RequestBody Map<String, Object> request) {
        String accNum = (String) request.get("accountNumber");
        String desc = (String) request.get("description");
        BigDecimal amount = new BigDecimal(request.get("amount").toString());

        Transaction tx = accountService.deposit(accNum, amount, desc);
        return ResponseEntity.ok(tx);
    }
    // 🌟 ADMIN: Get ALL accounts in the entire database
    @GetMapping("/admin/all")
    public ResponseEntity<List<Account>> getAllSystemAccounts() {
        return ResponseEntity.ok(accountRepository.findAll());
    }

    // 🌟 ADMIN: Get specific history for ANY account number
    @GetMapping("/admin/history/{accountNumber}")
    public ResponseEntity<List<Transaction>> getAdminHistory(@PathVariable String accountNumber) {
        return ResponseEntity.ok(transactionRepository.findGlobalHistory(accountNumber));
    }

    // 🌟 ENDPOINT: Log a real-world expense
    @PostMapping("/expense")
    public ResponseEntity<Transaction> logExpense(@RequestBody Map<String, Object> request) {
        String accNum = (String) request.get("accountNumber");
        String category = (String) request.get("category"); // Food, Tech, Transport
        String desc = (String) request.get("description");
        BigDecimal amount = new BigDecimal(request.get("amount").toString());

        Transaction tx = accountService.logManualExpense(accNum, amount, category, desc);
        return ResponseEntity.ok(tx);
    }

}