package com.booksiread.backend.service;

import com.booksiread.backend.dto.AuthResponse;
import com.booksiread.backend.dto.LoginRequest;
import com.booksiread.backend.dto.PasswordResetRequest;
import com.booksiread.backend.dto.PasswordResetConfirmRequest;
import com.booksiread.backend.dto.RegisterRequest;
import com.booksiread.backend.entity.User;

public interface AuthService {
    /**
     * Register a new user
     * @param request Registration details
     * @return Auth response with JWT token
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticate user and generate token
     * @param request Login credentials
     * @return Auth response with JWT token
     */
    AuthResponse login(LoginRequest request);

    /**
     * Get user from JWT token
     * @param token JWT token
     * @return User entity
     */
    User getUserFromToken(String token);

    /**
     * Request password reset
     * @param request Password reset request with email
     * Security: Token is only sent via email, never returned
     */
    void requestPasswordReset(PasswordResetRequest request);

    /**
     * Confirm password reset with token
     * @param request Token and new password
     */
    void confirmPasswordReset(PasswordResetConfirmRequest request);

    /**
     * Check if a username is already taken
     * @param username Username to check
     * @return true if taken, false if available
     */
    boolean isUsernameTaken(String username);
}
