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
        // 1. Find Accounts (Fail early if they don't exist)
        Account fromAcc = accountRepository.findById(fromId)
                .orElseThrow(() -> new RuntimeException("Sender Account #" + fromId + " not found"));
        Account toAcc = accountRepository.findById(toId)
                .orElseThrow(() -> new RuntimeException("Recipient Account #" + toId + " not found"));

        // 2. Python Sentinel Check
        String sentinelUrl = "http://sentinel-ai:8000/v1/scrutinize";
        Map<String, Object> request = Map.of(
                "amount", amount,
                "from_id", fromId,
                "to_id", toId
        );

        try {
            // Fetch response from Python Sentinel
            Map<String, String> response = restTemplate.postForObject(sentinelUrl, request, Map.class);
            String decision = response.get("decision"); // Expected "APPROVED" or "FLAGGED"

            if ("APPROVED".equals(decision)) {
                // 3. Update Balances
                fromAcc.setBalance(fromAcc.getBalance().subtract(amount));
                toAcc.setBalance(toAcc.getBalance().add(amount));

                accountRepository.save(fromAcc);
                accountRepository.save(toAcc);

                // 4. Save to Audit Log (Transaction Table)
                transactionRepository.save(new Transaction(fromId, toId, amount, "SUCCESS"));

                return "Transfer Successful: Processed by Sentinel AI";
            } else {
                // 5. Log the Blocked Attempt
                transactionRepository.save(new Transaction(fromId, toId, amount, "BLOCKED: AI Security Flag"));
                throw new RuntimeException("Sentinel AI has flagged this transaction as high risk.");
            }
        } catch (Exception e) {
            // Handle Sentinel being offline or other errors
            transactionRepository.save(new Transaction(fromId, toId, amount, "FAILED: System Error"));
            throw new RuntimeException("Banking System Error: " + e.getMessage());
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