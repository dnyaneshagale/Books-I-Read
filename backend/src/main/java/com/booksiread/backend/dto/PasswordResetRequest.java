package com.booksiread.backend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * PasswordResetRequest - Request body for password reset
 * Accepts either username or email
 */
public class PasswordResetRequest {
    
    @NotBlank(message = "Username or email is required")
    private String identifier; // Can be username or email

    // Constructors
    public PasswordResetRequest() {}

    public PasswordResetRequest(String identifier) {
        this.identifier = identifier;
    }

    // Getters and Setters
    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }
}
