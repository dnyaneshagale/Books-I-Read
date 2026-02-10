package com.booksiread.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * ReflectionLike Entity - Likes on reflections (LinkedIn-style)
 * Table: reflection_likes
 */
@Entity
@Table(name = "reflection_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"reflection_id", "user_id"})
})
public class ReflectionLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reflection_id", nullable = false)
    private Reflection reflection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public ReflectionLike() {}

    public ReflectionLike(Reflection reflection, User user) {
        this.reflection = reflection;
        this.user = user;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reflection getReflection() { return reflection; }
    public void setReflection(Reflection reflection) { this.reflection = reflection; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
