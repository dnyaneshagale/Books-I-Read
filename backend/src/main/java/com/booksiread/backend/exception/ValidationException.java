package com.booksiread.backend.exception;

/**
 * ValidationException - Custom exception for business validation errors
 * 
 * Thrown when business rules are violated (e.g., pagesRead > totalPages)
 * Results in HTTP 400 response
 */
public class ValidationException extends RuntimeException {
    
    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
