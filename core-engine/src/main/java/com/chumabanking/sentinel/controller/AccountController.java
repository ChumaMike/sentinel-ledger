package com.chumabanking.sentinel.controller;

import com.chumabanking.sentinel.model.Account;
import com.chumabanking.sentinel.model.Transaction;
import com.chumabanking.sentinel.repository.AccountRepository;
import com.chumabanking.sentinel.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.chumabanking.sentinel.service.AccountService;


import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173") // Allow React to talk to Java
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
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        return accountRepository.save(account);
    }

    @PostMapping("/transfer")
    public String transfer(@RequestParam Long fromId,
                           @RequestParam Long toId,
                           @RequestParam BigDecimal amount) {
        accountService.transferMoney(fromId, toId, amount);
        return "Transfer successful! Sent R" + amount + " to Account ID: " + toId;
    }

    @GetMapping("/health")
    public Map<String, String> getHealth() {
        return accountService.checkSystemHealth();
    }

    @GetMapping("/history")
    public List<Transaction> getTransactionHistory() {
        return transactionRepository.findAllByOrderByTimestampDesc();
    }
}