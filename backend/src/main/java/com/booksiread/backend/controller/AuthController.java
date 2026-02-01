package com.booksiread.backend.controller;

import com.booksiread.backend.dto.AuthResponse;
import com.booksiread.backend.dto.LoginRequest;
import com.booksiread.backend.dto.RegisterRequest;
import com.booksiread.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController - Authentication endpoints
 * 
 * Endpoints:
 * - POST /api/auth/register - Register new user
 * - POST /api/auth/login - Authenticate user
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
     * @param request Login credentials (username, password)
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
}
