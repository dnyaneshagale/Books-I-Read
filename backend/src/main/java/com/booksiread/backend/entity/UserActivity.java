package com.booksiread.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * UserActivity Entity - Represents activities for the social feed
 * 
 * Table: user_activities
 * Tracks activities like: started reading, finished book, wrote review, etc.
 */
@Entity
@Table(name = "user_activities")
public class UserActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 50)
    private ActivityType activityType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Book book; // For book-related activities

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    private User targetUser; // For follow activities

    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON string for additional data

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum ActivityType {
        STARTED_READING,     // User started reading a book
        FINISHED_BOOK,       // User finished reading a book
        PROGRESS_UPDATE,     // User updated reading progress
        ADDED_BOOK,          // User added a new book to their library
        RATED_BOOK,          // User rated a book
        WROTE_REVIEW,        // User wrote a review
        FOLLOWED_USER,       // User followed another user
        JOINED_PLATFORM      // User joined the platform (for new users)
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public UserActivity() {
    }

    public UserActivity(User user, ActivityType activityType) {
        this.user = user;
        this.activityType = activityType;
    }

    public UserActivity(User user, ActivityType activityType, Book book) {
        this.user = user;
        this.activityType = activityType;
        this.book = book;
    }

    public UserActivity(User user, ActivityType activityType, User targetUser) {
        this.user = user;
        this.activityType = activityType;
        this.targetUser = targetUser;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ActivityType getActivityType() {
        return activityType;
    }

    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public User getTargetUser() {
        return targetUser;
    }

    public void setTargetUser(User targetUser) {
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
