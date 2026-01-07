package com.chumabanking.sentinel.controller;

import com.sentinel.common.model.Account;
import com.sentinel.common.model.Transaction;
import com.chumabanking.sentinel.repository.AccountRepository;
import com.chumabanking.sentinel.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired private AccountRepository accountRepository;
    @Autowired private AccountService accountService;

    @GetMapping
    public List<Account> getMyAccounts() {
        // 🌟 Use JWT Principal to only show MY accounts
        String userIdStr = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = Long.parseLong(userIdStr);
        return accountRepository.findByUserId(userId);
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
}