package com.chumabanking.sentinel.repository;

import com.sentinel.common.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {

    // 🌟 Find all cards owned by a user
    List<Card> findByUserId(Long userId);

    // 🌟 Find cards linked to a specific account bucket
    List<Card> findByAccountId(Long accountId);

    // 🌟 Look up a specific card for transaction processing
    Optional<Card> findByCardNumber(String cardNumber);
}