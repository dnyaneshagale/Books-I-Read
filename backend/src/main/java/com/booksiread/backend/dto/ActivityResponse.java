package com.booksiread.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO for activity feed items
 */
public class ActivityResponse {
    private Long id;
    private String activityType;
    private UserCardResponse user;
    private BookSummary book;
    private UserCardResponse targetUser;
    private String metadata;
    private LocalDateTime createdAt;

    // Nested class for book summary in activities
    public static class BookSummary {
        private Long id;
        private String title;
        private String author;
        private Integer rating;
        private String status;

        // Getters and Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getAuthor() {
            return author;
        }

        public void setAuthor(String author) {
            this.author = author;
        }

        public Integer getRating() {
            return rating;
        }

        public void setRating(Integer rating) {
            this.rating = rating;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    // Constructors
    public ActivityResponse() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public UserCardResponse getUser() {
        return user;
    }

    public void setUser(UserCardResponse user) {
        this.user = user;
    }

    public BookSummary getBook() {
        return book;
    }

    public void setBook(BookSummary book) {
        this.book = book;
    }

    public UserCardResponse getTargetUser() {
        return targetUser;
    }

    public void setTargetUser(UserCardResponse targetUser) {
        this.targetUser = targetUser;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
