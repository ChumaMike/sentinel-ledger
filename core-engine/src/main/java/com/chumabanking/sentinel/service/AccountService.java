package com.chumabanking.sentinel.service;

import com.chumabanking.sentinel.model.Account;
import com.chumabanking.sentinel.model.Transaction;
import com.chumabanking.sentinel.repository.AccountRepository;
import com.chumabanking.sentinel.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Transactional
    public String transferMoney(Long fromId, Long toId, BigDecimal amount) {
        Account fromAcc = accountRepository.findById(fromId)
                .orElseThrow(() -> new RuntimeException("Sender Account #" + fromId + " not found"));
        Account toAcc = accountRepository.findById(toId)
                .orElseThrow(() -> new RuntimeException("Recipient Account #" + toId + " not found"));

        String sentinelUrl = "http://sentinel-ai:8000/v1/scrutinize";
        Map<String, Object> request = Map.of(
                "amount", amount,
                "from_id", fromId,
                "to_id", toId
        );

        try {
            // Log outgoing request
            System.out.println("DEBUG: Calling Sentinel with: " + request);

            Map<String, Object> response = restTemplate.postForObject(sentinelUrl, request, Map.class);
            String decision = (String) response.get("decision");

            if ("APPROVED".equals(decision)) {
                fromAcc.setBalance(fromAcc.getBalance().subtract(amount));
                toAcc.setBalance(toAcc.getBalance().add(amount));

                accountRepository.save(fromAcc);
                accountRepository.save(toAcc);

                transactionRepository.save(new Transaction(fromId, toId, amount, "SUCCESS"));
                return "Transfer Successful: Processed by Sentinel AI";
            } else {
                String reason = (String) response.get("reason");
                transactionRepository.save(new Transaction(fromId, toId, amount, "BLOCKED: " + reason));
                throw new RuntimeException("Sentinel AI blocked this move: " + reason);
            }
        } catch (Exception e) {
            // If it's a Sentinel exception, pass the reason through, otherwise generic error
            String error = e.getMessage().contains("Sentinel") ? e.getMessage() : "Banking System Error: " + e.getMessage();
            throw new RuntimeException(error);
        }
    }

    @Autowired
    private JdbcTemplate jdbcTemplate; // For checking the DB

    public Map<String, String> checkSystemHealth() {
        Map<String, String> status = new java.util.HashMap<>();

        // 1. Check Database
        try {
            jdbcTemplate.execute("SELECT 1");
            status.put("database", "UP");
        } catch (Exception e) {
            status.put("database", "DOWN - " + e.getMessage());
        }

        // 2. Check Python Sentinel
        try {
            String sentinelUrl = "http://sentinel-ai:8000/docs"; // FastAPI docs are a safe ping
            ResponseEntity<String> response = restTemplate.getForEntity(sentinelUrl, String.class);
            status.put("sentinel", response.getStatusCode().is2xxSuccessful() ? "UP" : "DOWN");
        } catch (Exception e) {
            status.put("sentinel", "DOWN - Python service not responding");
        }

        return status;
    }

    @Autowired
    private TransactionRepository transactionRepository;
}