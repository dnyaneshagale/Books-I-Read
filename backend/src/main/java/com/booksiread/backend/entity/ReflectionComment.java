package com.booksiread.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ReflectionComment Entity - Comments on reflections (supports threaded replies)
 * Table: reflection_comments
 */
@Entity
@Table(name = "reflection_comments")
public class ReflectionComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reflection_id", nullable = false)
    private Reflection reflection;

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
    private ReflectionComment parentComment;

    /** Child replies */
    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<ReflectionComment> replies = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public ReflectionComment() {}

    public ReflectionComment(Reflection reflection, User user, String content) {
        this.reflection = reflection;
        this.user = user;
        this.content = content;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reflection getReflection() { return reflection; }
    public void setReflection(Reflection reflection) { this.reflection = reflection; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public ReflectionComment getParentComment() { return parentComment; }
    public void setParentComment(ReflectionComment parentComment) { this.parentComment = parentComment; }

    public List<ReflectionComment> getReplies() { return replies; }
    public void setReplies(List<ReflectionComment> replies) { this.replies = replies; }
}
