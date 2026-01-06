package com.chumabanking.sentinel.controller;

import com.sentinel.common.model.Account;
import com.sentinel.common.model.Transaction;
import com.chumabanking.sentinel.repository.AccountRepository;
import com.chumabanking.sentinel.repository.TransactionRepository;
import com.chumabanking.sentinel.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

// 🌟 Explicitly allow all headers and methods for the React frontend
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
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

    @PostMapping("/transfer")
    public ResponseEntity<String> transfer(
            @RequestParam("fromId") Long fromId,
            @RequestParam("toId") Long toId,
            @RequestParam("amount") BigDecimal amount) {
        accountService.transferMoney(fromId, toId, amount);
        return ResponseEntity.ok("Transfer successful! Sent R" + amount + " to Account ID: " + toId);
    }

    @GetMapping("/history")
    public List<Transaction> getTransactionHistory() {
        return transactionRepository.findAllByOrderByTimestampDesc();
    }
}