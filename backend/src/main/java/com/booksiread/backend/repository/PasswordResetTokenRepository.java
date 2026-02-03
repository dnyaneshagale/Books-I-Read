package com.booksiread.backend.repository;

import com.booksiread.backend.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    /**
     * Find password reset token by token string
     * @param token The reset token
     * @return Optional PasswordResetToken
     */
    Optional<PasswordResetToken> findByToken(String token);
    
    /**
     * Delete all tokens for a specific user
     * @param userId User ID
     */
    void deleteByUserId(Long userId);
}
