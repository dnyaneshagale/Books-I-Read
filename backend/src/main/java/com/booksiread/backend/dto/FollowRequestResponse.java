package com.booksiread.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO for follow request information
 */
public class FollowRequestResponse {
    private Long requestId;
    private UserCardResponse requester;
    private String status;
    private LocalDateTime createdAt;

    // Constructors
    public FollowRequestResponse() {
    }

    // Getters and Setters
    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public UserCardResponse getRequester() {
        return requester;
    }

    public void setRequester(UserCardResponse requester) {
        this.requester = requester;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
