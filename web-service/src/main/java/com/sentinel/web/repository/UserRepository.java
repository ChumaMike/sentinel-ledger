package com.sentinel.web.repository;

// 🌟 IMPORTANT: Import the User from COMMON, not web.model
import com.sentinel.common.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByPinHash(String pinHash);
}