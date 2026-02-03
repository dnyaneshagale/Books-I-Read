package com.booksiread.backend.service;

/**
 * EmailService - Handles email sending operations
 */
public interface EmailService {
    
    /**
     * Send password reset email with reset link
     * @param toEmail Recipient email address
     * @param username User's username
     * @param resetToken Password reset token
     */
    void sendPasswordResetEmail(String toEmail, String username, String resetToken);
}
