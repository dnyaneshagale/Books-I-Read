package com.booksiread.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * ReadingGoal - Yearly (or custom-period) reading goal.
 * Users set a target number of books to read within a year.
 */
@Entity
@Table(name = "reading_goals", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "year"})
})
public class ReadingGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "target_books", nullable = false)
    private Integer targetBooks;

    @Column(name = "books_completed")
    private Integer booksCompleted = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ReadingGoal() {}

    public ReadingGoal(User user, Integer year, Integer targetBooks) {
        this.user = user;
        this.year = year;
        this.targetBooks = targetBooks;
        this.booksCompleted = 0;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Integer getTargetBooks() { return targetBooks; }
    public void setTargetBooks(Integer targetBooks) { this.targetBooks = targetBooks; }

    public Integer getBooksCompleted() { return booksCompleted != null ? booksCompleted : 0; }
    public void setBooksCompleted(Integer booksCompleted) { this.booksCompleted = booksCompleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper
    public double getProgressPercentage() {
        if (targetBooks == null || targetBooks == 0) return 0;
        return Math.min(100.0, (getBooksCompleted() * 100.0) / targetBooks);
    }

    public boolean isCompleted() {
        return getBooksCompleted() >= targetBooks;
    }
}
