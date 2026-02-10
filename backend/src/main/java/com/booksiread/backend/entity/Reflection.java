package com.booksiread.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * Reflection Entity - A text post / thought about books / reading
 * 
 * Table: reflections
 * Users share reading reflections in the social feed.
 * Privacy: visibleToFollowersOnly controls whether only followers or everyone can see it.
 */
@Entity
@Table(name = "reflections")
public class Reflection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Reflection content is required")
    @Size(max = 2000, message = "Reflection must be at most 2000 characters")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /** Optional: link the reflection to a specific book */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Book book;

    /** Privacy: if true, only followers can see this reflection. If false, anyone (public). */
    @Column(name = "visible_to_followers_only", nullable = false)
    private Boolean visibleToFollowersOnly = false;

    @Column(name = "likes_count", nullable = false)
    private Integer likesCount = 0;

    @Column(name = "comments_count", nullable = false)
    private Integer commentsCount = 0;

    @Column(name = "saves_count", nullable = false)
    private Integer savesCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Reflection() {}

    public Reflection(User user, String content) {
        this.user = user;
        this.content = content;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public Boolean getVisibleToFollowersOnly() { return visibleToFollowersOnly; }
    public void setVisibleToFollowersOnly(Boolean visibleToFollowersOnly) { this.visibleToFollowersOnly = visibleToFollowersOnly; }

    public Integer getLikesCount() { return likesCount != null ? likesCount : 0; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }

    public Integer getCommentsCount() { return commentsCount != null ? commentsCount : 0; }
    public void setCommentsCount(Integer commentsCount) { this.commentsCount = commentsCount; }

    public Integer getSavesCount() { return savesCount != null ? savesCount : 0; }
    public void setSavesCount(Integer savesCount) { this.savesCount = savesCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
