package com.booksiread.backend.exception;

/**
 * ResourceNotFoundException - Custom exception for resource not found errors
 * 
 * Thrown when a requested resource (e.g., book) doesn't exist in the database
 * Results in HTTP 404 response
 */
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
