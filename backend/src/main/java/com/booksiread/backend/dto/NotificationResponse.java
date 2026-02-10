package com.booksiread.backend.dto;

import java.time.LocalDateTime;

public class NotificationResponse {
    private Long id;
    private String type;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    
    // Actor info
    private Long actorId;
    private String actorUsername;
    private String actorDisplayName;
    private String actorProfilePictureUrl;
    
    // Optional references
    private Long bookId;
    private String bookTitle;
    private Long reviewId;
    private Long commentId;
    private Long reflectionId;
    private Long followRequestId;

    public NotificationResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getActorId() { return actorId; }
    public void setActorId(Long actorId) { this.actorId = actorId; }

    public String getActorUsername() { return actorUsername; }
    public void setActorUsername(String actorUsername) { this.actorUsername = actorUsername; }

    public String getActorDisplayName() { return actorDisplayName; }
    public void setActorDisplayName(String actorDisplayName) { this.actorDisplayName = actorDisplayName; }

    public String getActorProfilePictureUrl() { return actorProfilePictureUrl; }
    public void setActorProfilePictureUrl(String actorProfilePictureUrl) { this.actorProfilePictureUrl = actorProfilePictureUrl; }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }

    public Long getReviewId() { return reviewId; }
    public void setReviewId(Long reviewId) { this.reviewId = reviewId; }

    public Long getCommentId() { return commentId; }
    public void setCommentId(Long commentId) { this.commentId = commentId; }

    public Long getReflectionId() { return reflectionId; }
    public void setReflectionId(Long reflectionId) { this.reflectionId = reflectionId; }

    public Long getFollowRequestId() { return followRequestId; }
    public void setFollowRequestId(Long followRequestId) { this.followRequestId = followRequestId; }
}
