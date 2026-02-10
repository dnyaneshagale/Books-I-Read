package com.booksiread.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating / updating a Reflection
 */
public class CreateReflectionRequest {

    @NotBlank(message = "Reflection content is required")
    @Size(max = 2000, message = "Reflection must be at most 2000 characters")
    private String content;

    /** Optional: attach a book to the reflection */
    private Long bookId;

    /** Privacy: true = only followers can see; false = everyone (default) */
    private Boolean visibleToFollowersOnly = false;

    // Getters and Setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public Boolean getVisibleToFollowersOnly() { return visibleToFollowersOnly; }
    public void setVisibleToFollowersOnly(Boolean visibleToFollowersOnly) { this.visibleToFollowersOnly = visibleToFollowersOnly; }
}
