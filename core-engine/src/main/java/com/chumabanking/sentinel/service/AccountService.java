package com.chumabanking.sentinel.service;

import com.sentinel.common.model.Account;
import com.sentinel.common.model.Transaction;
import com.chumabanking.sentinel.repository.AccountRepository;
import com.chumabanking.sentinel.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class AccountService {

    @Autowired private AccountRepository accountRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private RestTemplate restTemplate;

    @Transactional
    public String transferMoney(String fromAccNum, String toAccNum, BigDecimal amount, String description) {
        // 1. Find Accounts by Account Number (Not ID)
        Account fromAcc = accountRepository.findByAccountNumber(fromAccNum)
                .orElseThrow(() -> new RuntimeException("Sender Account " + fromAccNum + " not found"));
        Account toAcc = accountRepository.findByAccountNumber(toAccNum)
                .orElseThrow(() -> new RuntimeException("Recipient Account " + toAccNum + " not found"));

        if (fromAcc.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds! Balance: R" + fromAcc.getBalance());
        }

        // 2. Call Sentinel AI for Scrutiny
        String sentinelUrl = "http://sentinel-ai:8000/v1/scrutinize";
        Map<String, Object> request = Map.of(
                "amount", amount,
                "from_account", fromAccNum,
                "to_account", toAccNum
        );

        try {
            Map<String, Object> response = restTemplate.postForObject(sentinelUrl, request, Map.class);
            String decision = (String) response.get("decision");

            if ("APPROVED".equals(decision)) {
                fromAcc.setBalance(fromAcc.getBalance().subtract(amount));
                toAcc.setBalance(toAcc.getBalance().add(amount));

                accountRepository.save(fromAcc);
                accountRepository.save(toAcc);

                // 🌟 Create "Real" Log with Name/Description
                Transaction tx = new Transaction();
                tx.setFromAccountId(fromAcc.getAccountId());
                tx.setToAccountId(toAcc.getAccountId());
                tx.setAmount(amount);
                tx.setDescription(description); // 🌟 Now included!
                tx.setStatus("SUCCESS");
                tx.setTimestamp(LocalDateTime.now());
                transactionRepository.save(tx);

                return "Transfer Successful to " + toAccNum;
            } else {
                throw new RuntimeException("Sentinel AI blocked: " + response.get("reason"));
            }
        } catch (Exception e) {
            throw new RuntimeException("Transaction Error: " + e.getMessage());
        }
    }
}