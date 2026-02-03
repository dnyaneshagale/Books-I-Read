package com.booksiread.backend.controller;

import com.booksiread.backend.dto.AuthResponse;
import com.booksiread.backend.dto.LoginRequest;
import com.booksiread.backend.dto.PasswordResetRequest;
import com.booksiread.backend.dto.PasswordResetConfirmRequest;
import com.booksiread.backend.dto.RegisterRequest;
import com.booksiread.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * AuthController - Authentication endpoints
 * 
 * Endpoints:
 * - POST /api/auth/register - Register new user
 * - POST /api/auth/login - Authenticate user
 * - POST /api/auth/reset-password - Request password reset
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Register new user
     * POST /api/auth/register
     * 
     * @param request Registration details (username, email, password)
     * @return AuthResponse with JWT token
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Login user
     * POST /api/auth/login
     * 
     * Supports login with either username or email
     * 
     * @param request Login credentials (username/email, password)
     * @return AuthResponse with JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Validate token
     * GET /api/auth/validate
     * 
     * @return 200 if token is valid, 401/403 if invalid
     */
    @GetMapping("/validate")
    public ResponseEntity<Void> validateToken() {
        // If this endpoint is reached, the token is valid (JWT filter passed)
        return ResponseEntity.ok().build();
    }

    /**
     * Request password reset
     * POST /api/auth/reset-password
     * 
     * Security Features:
     * - Token expires in 15 minutes
     * - Token can only be used once
     * - Old tokens are automatically deleted when new one is requested
     * - Does not reveal if email exists (prevents user enumeration)
     * - Token is only sent via email (not in API response)
     * - Rate limiting recommended at API Gateway level
     * 
     * @param request Email address for password reset
     * @return Generic success message (same whether email exists or not)
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequest request) {
        
        // Generate reset token and send email
        authService.requestPasswordReset(request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "If an account exists with that email, a password reset link has been sent.");
        // Security: Do not reveal if email exists or not (prevents user enumeration)
        // Security: Do not include token in response (token only sent via email)
        
        return ResponseEntity.ok(response);
    }

    /**
     * Confirm password reset with token
     * POST /api/auth/reset-password/confirm
     * 
     * Security Features:
     * - Validates token exists in database
     * - Checks token hasn't been used
     * - Checks token hasn't expired (15 min)
     * - Password is encrypted with BCrypt
     * - Token is marked as used after successful reset
     * - Atomic transaction to prevent race conditions
     * 
     * @param request Token and new password
     * @return Success message
     */
    @PostMapping("/reset-password/confirm")
    public ResponseEntity<Map<String, String>> confirmPasswordReset(
            @Valid @RequestBody PasswordResetConfirmRequest request) {
        
        authService.confirmPasswordReset(request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password has been reset successfully. You can now login with your new password.");
        
        return ResponseEntity.ok(response);
    }
}
