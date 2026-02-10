package com.booksiread.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * ReadingListLike - Tracks which users have liked/saved a reading list.
 */
@Entity
@Table(name = "reading_list_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"reading_list_id", "user_id"})
})
public class ReadingListLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reading_list_id", nullable = false)
    private ReadingList readingList;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public ReadingListLike() {}

    public ReadingListLike(ReadingList readingList, User user) {
        this.readingList = readingList;
        this.user = user;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ReadingList getReadingList() { return readingList; }
    public void setReadingList(ReadingList readingList) { this.readingList = readingList; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
