package com.chumabanking.sentinel.repository;

import com.sentinel.common.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // 🌟 Find transactions where I am the sender OR the receiver
    List<Transaction> findBySenderAccountNumberOrReceiverAccountNumberOrderByTimestampDesc(
            String senderAccountNumber,
            String receiverAccountNumber
    );
}