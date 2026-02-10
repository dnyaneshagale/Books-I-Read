package com.booksiread.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ReadingList - Custom shareable book lists / bookshelves.
 * Users can curate lists like "Best Sci-Fi", "2026 Must-Reads", etc.
 */
@Entity
@Table(name = "reading_lists")
public class ReadingList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "is_public")
    private Boolean isPublic = true;

    @Column(name = "cover_emoji", length = 10)
    private String coverEmoji = "📚";

    @Column(name = "books_count")
    private Integer booksCount = 0;

    @Column(name = "likes_count")
    private Integer likesCount = 0;

    @OneToMany(mappedBy = "readingList", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<ReadingListItem> items = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ReadingList() {}

    public ReadingList(User user, String name, String description) {
        this.user = user;
        this.name = name;
        this.description = description;
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

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsPublic() { return isPublic != null ? isPublic : true; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }

    public String getCoverEmoji() { return coverEmoji != null ? coverEmoji : "📚"; }
    public void setCoverEmoji(String coverEmoji) { this.coverEmoji = coverEmoji; }

    public Integer getBooksCount() { return booksCount != null ? booksCount : 0; }
    public void setBooksCount(Integer booksCount) { this.booksCount = booksCount; }

    public Integer getLikesCount() { return likesCount != null ? likesCount : 0; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }

    public List<ReadingListItem> getItems() { return items; }
    public void setItems(List<ReadingListItem> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
