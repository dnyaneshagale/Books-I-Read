package com.booksiread.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Notification Entity - In-app notifications for social events
 * Table: notifications
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_recipient", columnList = "recipient_id"),
    @Index(name = "idx_notification_read", columnList = "recipient_id, is_read")
})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** User receiving the notification */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    /** User who triggered the notification */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private NotificationType type;

    /** Optional reference to a book */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Book book;

    /** Optional reference to a review */
    @Column(name = "review_id")
    private Long reviewId;

    /** Optional reference to a comment */
    @Column(name = "comment_id")
    private Long commentId;

    /** Optional reference to a reflection */
    @Column(name = "reflection_id")
    private Long reflectionId;

    /** Optional reference to a follow request */
    @Column(name = "follow_request_id")
    private Long followRequestId;

    /** Human-readable notification message */
    @Column(nullable = false, length = 500)
    private String message;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        FOLLOW,              // Someone followed you
        FOLLOW_REQUEST,      // Someone requested to follow you (private account)
        FOLLOW_ACCEPTED,     // Your follow request was accepted
        LIKE_REVIEW,         // Someone liked your review
        COMMENT,             // Someone commented on your review
        COMMENT_REPLY,       // Someone replied to your comment
        MENTION,             // Someone mentioned you in a comment
        BOOK_FINISHED,       // Someone you follow finished a book
        BOOK_REVIEW          // Someone you follow wrote a review
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public Notification() {}

    public Notification(User recipient, User actor, NotificationType type, String message) {
        this.recipient = recipient;
        this.actor = actor;
        this.type = type;
        this.message = message;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }

    public User getActor() { return actor; }
    public void setActor(User actor) { this.actor = actor; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public Long getReviewId() { return reviewId; }
    public void setReviewId(Long reviewId) { this.reviewId = reviewId; }

    public Long getCommentId() { return commentId; }
    public void setCommentId(Long commentId) { this.commentId = commentId; }

    public Long getReflectionId() { return reflectionId; }
    public void setReflectionId(Long reflectionId) { this.reflectionId = reflectionId; }

    public Long getFollowRequestId() { return followRequestId; }
    public void setFollowRequestId(Long followRequestId) { this.followRequestId = followRequestId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
