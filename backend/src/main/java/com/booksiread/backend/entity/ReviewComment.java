package com.booksiread.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ReviewComment Entity - Comments on book reviews (supports threaded replies)
 * Table: review_comments
 */
@Entity
@Table(name = "review_comments")
public class ReviewComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private BookReview review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Comment content is required")
    @Size(max = 1000, message = "Comment must be at most 1000 characters")
    @Column(nullable = false, length = 1000)
    private String content;

    /** Parent comment for threaded replies (null = top-level comment) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ReviewComment parentComment;

    /** Child replies */
    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<ReviewComment> replies = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public ReviewComment() {}

    public ReviewComment(BookReview review, User user, String content) {
        this.review = review;
        this.user = user;
        this.content = content;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BookReview getReview() { return review; }
    public void setReview(BookReview review) { this.review = review; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public ReviewComment getParentComment() { return parentComment; }
    public void setParentComment(ReviewComment parentComment) { this.parentComment = parentComment; }

    public List<ReviewComment> getReplies() { return replies; }
    public void setReplies(List<ReviewComment> replies) { this.replies = replies; }
}
