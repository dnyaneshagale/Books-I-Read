package com.booksiread.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.ColumnDefault;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Author is required")
    @Column(nullable = false)
    private String author;

    @NotNull(message = "Total pages is required")
    @Min(value = 1, message = "Total pages must be greater than 0")
    @Column(nullable = false)
    private Integer totalPages;

    @NotNull(message = "Pages read is required")
    @Min(value = 0, message = "Pages read cannot be negative")
    @Column(nullable = false)
    private Integer pagesRead = 0;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'WANT_TO_READ'")
    @Column
    private ReadingStatus status = ReadingStatus.WANT_TO_READ;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "complete_date")
    private LocalDate completeDate;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    @Column
    private Integer rating;

    @Column(length = 2000)
    private String review;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "book_tags", joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ReadingStatus {
        WANT_TO_READ,
        READING,
        FINISHED
    }

    // Lifecycle callbacks
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
    public Book() {
    }

    public Book(String title, String author, Integer totalPages, Integer pagesRead) {
        this.title = title;
        this.author = author;
        this.totalPages = totalPages;
        this.pagesRead = pagesRead;
        this.status = ReadingStatus.WANT_TO_READ;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }

    public Integer getPagesRead() {
        return pagesRead;
    }

    public void setPagesRead(Integer pagesRead) {
        this.pagesRead = pagesRead;
    }

    public ReadingStatus getStatus() {
        return status;
    }

    public void setStatus(ReadingStatus status) {
        ReadingStatus oldStatus = this.status;
        this.status = status;
        
        // Auto-set start date when status changes to READING (if not already set)
        if (status == ReadingStatus.READING && this.startDate == null) {
            this.startDate = LocalDate.now();
        }
        
        // Auto-set complete date when status changes to FINISHED
        if (status == ReadingStatus.FINISHED) {
            // Always update complete date when marking as finished
            this.completeDate = LocalDate.now();
        }
        
        // Clear complete date when changing away from FINISHED
        if (oldStatus == ReadingStatus.FINISHED && status != ReadingStatus.FINISHED) {
            this.completeDate = null;
        }
        
        // Clear start date when changing back to WANT_TO_READ
        if (status == ReadingStatus.WANT_TO_READ) {
            this.startDate = null;
            this.completeDate = null;
        }
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getCompleteDate() {
        return completeDate;
    }

    public void setCompleteDate(LocalDate completeDate) {
        this.completeDate = completeDate;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getReview() {
        return review;
    }

    public void setReview(String review) {
        this.review = review;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
