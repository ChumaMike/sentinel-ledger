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
import java.util.Optional;
import java.util.Random;

@Service
public class AccountService {

    @Autowired private AccountRepository accountRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private RestTemplate restTemplate;

    // 🌟 REMOVED @Transactional from the method level to control it manually inside
    // This allows us to save "FAILED" logs even if the money doesn't move.
    public String transferMoney(String fromAccNum, String toAccNum, BigDecimal amount, String description) {

        // 0. Sanity Check
        if (fromAccNum.equals(toAccNum)) {
            throw new RuntimeException("Cannot transfer to the same account.");
        }

        // 1. Find Accounts
        Optional<Account> fromAccOpt = accountRepository.findByAccountNumber(fromAccNum);
        Optional<Account> toAccOpt = accountRepository.findByAccountNumber(toAccNum);

        if (fromAccOpt.isEmpty()) throw new RuntimeException("Sender account not found.");
        if (toAccOpt.isEmpty()) throw new RuntimeException("Recipient account " + toAccNum + " does not exist.");

        Account fromAcc = fromAccOpt.get();
        Account toAcc = toAccOpt.get();

        // 2. Create Transaction Record (Pending)
        Transaction tx = new Transaction();
        tx.setFromAccountId(fromAcc.getAccountId());
        tx.setToAccountId(toAcc.getAccountId());
        tx.setSenderAccountNumber(fromAccNum);
        tx.setReceiverAccountNumber(toAccNum);
        tx.setAmount(amount);
        tx.setDescription(description);
        tx.setTimestamp(LocalDateTime.now());

        try {
            // 3. Balance Check
            if (fromAcc.getBalance().compareTo(amount) < 0) {
                throw new RuntimeException("Insufficient funds.");
            }

            // 4. AI Sentinel Check
            // We use a try-catch for the network call specifically so we don't crash if AI is offline
            String decision = "APPROVED"; // Default to allow if AI is off (or set to DENIED for strict security)
            try {
                String sentinelUrl = "http://sentinel-ai:8000/v1/scrutinize";
                Map<String, Object> request = Map.of("amount", amount, "from_account", fromAccNum, "to_account", toAccNum);
                Map<String, Object> response = restTemplate.postForObject(sentinelUrl, request, Map.class);
                decision = (String) response.get("decision");
            } catch (Exception e) {
                System.out.println("⚠️ AI Sentinel Unreachable: Proceeding with caution.");
            }

            if ("APPROVED".equals(decision)) {
                // 5. Move Money (The Critical Part)
                doTransfer(fromAcc, toAcc, amount);

                tx.setStatus("SUCCESS");
                transactionRepository.save(tx); // Save the log only after success
                return "Transfer Successful to " + toAccNum;
            } else {
                throw new RuntimeException("Sentinel AI blocked this transaction.");
            }

        } catch (Exception e) {
            // 6. Log the Failure so the user sees it in "History"
            tx.setStatus("FAILED");
            tx.setDescription(description + " [Failed: " + e.getMessage() + "]");
            transactionRepository.save(tx);

            // Re-throw so the Controller knows to send a 400 error
            throw new RuntimeException(e.getMessage());
        }
    }

    // 🔒 Isolated Transaction to ensure Atomic Money Movement
    @Transactional
    protected void doTransfer(Account from, Account to, BigDecimal amount) {
        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));
        accountRepository.save(from);
        accountRepository.save(to);
    }

    public Account createAccount(Long userId, String accountType) {
        Account newAccount = new Account();
        newAccount.setUserId(userId);
        newAccount.setAccountType(accountType); // e.g., "SAVINGS", "CHEQUE"
        newAccount.setCurrency("ZAR");

        // 💰 SIGN-UP BONUS
        newAccount.setBalance(new BigDecimal("500.00"));

        // 🎲 GENERATORS
        newAccount.setAccountNumber(generateAccountNumber());
        // For cards, we would ideally create a separate Card entity,
        // but if your Account model has card fields, set them here:
        // newAccount.setCardNumber(generateCardNumber());
        // newAccount.setCvv(generateRandomDigits(3));

        return accountRepository.save(newAccount);
    }

    // 🛠️ Helper: Generate 10-digit Account Number
    private String generateAccountNumber() {
        return "1" + generateRandomDigits(9); // Starts with 1
    }

    private String generateRandomDigits(int length) {
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    public Transaction logManualExpense(String accountNum, BigDecimal amount, String category, String description) {
        Account account = accountRepository.findByAccountNumber(accountNum)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // 1. Update Balance (Optional: Only if you want 'Cash' to reduce your digital balance.
        //    Usually, for manual tracking, we might NOT reduce the bank balance,
        //    but let's assume this is a Debit Card swipe, so we DO reduce it.)
        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds for this expense.");
        }
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        // 2. Create the "Rich" Transaction Record
        Transaction tx = new Transaction();
        tx.setFromAccountId(account.getAccountId());
        tx.setSenderAccountNumber(accountNum);
        tx.setAmount(amount);
        tx.setDescription(description);
        tx.setCategory(category);       // e.g., "Food"
        tx.setTransactionType("EXPENSE"); // e.g., "EXPENSE"
        tx.setStatus("SUCCESS");
        tx.setTimestamp(LocalDateTime.now());

        return transactionRepository.save(tx);
    }

    public Account createAccount(Long userId, String type, String name) {
        Account account = new Account();
        account.setUserId(userId);
        account.setAccountType(type); // "SAVINGS", "CHEQUE", "BUSINESS"
        account.setAccountName(name); // "My Holiday Fund"
        account.setBalance(BigDecimal.ZERO); // Start with 0
        account.setStatus("ACTIVE");

        // Generate Random 10-digit Account Number (Starts with 200 for created accounts)
        String accNum = "200" + (1000000 + new Random().nextInt(9000000));
        account.setAccountNumber(accNum);

        return accountRepository.save(account);
    }

    //Inject money into an account
    public Transaction deposit(String accountNumber, BigDecimal amount, String description) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // 1. Increase Balance
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        // 2. Log the Transaction (No sender, just receiver)
        Transaction tx = new Transaction();
        tx.setToAccountId(account.getAccountId());
        tx.setReceiverAccountNumber(account.getAccountNumber());
        tx.setAmount(amount);
        tx.setDescription(description); // e.g., "Salary Deposit"
        tx.setTransactionType("DEPOSIT");
        tx.setStatus("SUCCESS");
        tx.setTimestamp(LocalDateTime.now());

        return transactionRepository.save(tx);
    }

}