package com.booksiread.backend.model;

import com.booksiread.backend.entity.Book;
import com.booksiread.backend.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reading_activities", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "book_id", "activity_date"})
})
@EntityListeners(AuditingEntityListener.class)
public class ReadingActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;
    
    @Column(name = "pages_read_today")
    private Integer pagesReadToday;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public ReadingActivity() {}
    
    public ReadingActivity(Book book, User user, LocalDate activityDate, Integer pagesReadToday) {
        this.book = book;
        this.user = user;
        this.activityDate = activityDate;
        this.pagesReadToday = pagesReadToday;
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Book getBook() {
        return book;
    }
    
    public void setBook(Book book) {
        this.book = book;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public LocalDate getActivityDate() {
        return activityDate;
    }
    
    public void setActivityDate(LocalDate activityDate) {
        this.activityDate = activityDate;
    }
    
    public Integer getPagesReadToday() {
        return pagesReadToday;
    }
    
    public void setPagesReadToday(Integer pagesReadToday) {
        this.pagesReadToday = pagesReadToday;
        this.updatedAt = LocalDateTime.now();
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
