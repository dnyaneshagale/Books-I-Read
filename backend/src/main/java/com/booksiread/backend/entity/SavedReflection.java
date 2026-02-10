package com.booksiread.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * SavedReflection Entity - Bookmarked/saved reflections (LinkedIn-style Save)
 * Table: saved_reflections
 */
@Entity
@Table(name = "saved_reflections", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "reflection_id"})
})
public class SavedReflection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reflection_id", nullable = false)
    private Reflection reflection;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public SavedReflection() {}

    public SavedReflection(User user, Reflection reflection) {
        this.user = user;
        this.reflection = reflection;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Reflection getReflection() { return reflection; }
    public void setReflection(Reflection reflection) { this.reflection = reflection; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
