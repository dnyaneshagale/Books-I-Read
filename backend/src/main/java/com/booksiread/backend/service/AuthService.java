package com.booksiread.backend.service;

import com.booksiread.backend.dto.AuthResponse;
import com.booksiread.backend.dto.LoginRequest;
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
}
