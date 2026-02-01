package com.booksiread.backend.dto;

import com.booksiread.backend.entity.Book;
import com.booksiread.backend.entity.Book.ReadingStatus;
import java.time.LocalDate;
import java.util.List;

/**
 * BookResponse DTO - Returned to frontend
 * 
 * Includes computed fields:
 * - progress: reading progress percentage
 */
public class BookResponse {

    private Long id;
    private String title;
    private String author;
    private Integer totalPages;
    private Integer pagesRead;
    private Double progress;  // Calculated field
    private ReadingStatus status;
    private LocalDate startDate;
    private LocalDate completeDate;
    private Integer rating;
    private String review;
    private List<String> tags;

    // Constructors
    public BookResponse() {
    }

    public BookResponse(Long id, String title, String author, Integer totalPages, 
                       Integer pagesRead, Double progress, ReadingStatus status,
                       LocalDate startDate, LocalDate completeDate, Integer rating, String review,
                       List<String> tags) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.totalPages = totalPages;
        this.pagesRead = pagesRead;
        this.progress = progress;
        this.status = status;
        this.startDate = startDate;
        this.completeDate = completeDate;
        this.rating = rating;
        this.review = review;
        this.tags = tags;
    }

    /**
     * Factory method to create BookResponse from Book entity
     * Automatically calculates progress
     */
    public static BookResponse fromEntity(Book book) {
        double progress = calculateProgress(book.getPagesRead(), book.getTotalPages());

        return new BookResponse(
            book.getId(),
            book.getTitle(),
            book.getAuthor(),
            book.getTotalPages(),
            book.getPagesRead(),
            progress,
            book.getStatus(),
            book.getStartDate(),
            book.getCompleteDate(),
            book.getRating(),
            book.getReview(),
            book.getTags()
        );
    }

    /**
     * Calculate reading progress percentage
     */
    private static double calculateProgress(int pagesRead, int totalPages) {
        if (totalPages == 0) return 0.0;
        return Math.round((pagesRead * 100.0 / totalPages) * 100.0) / 100.0; // Round to 2 decimal places
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

    public Double getProgress() {
        return progress;
    }

    public void setProgress(Double progress) {
        this.progress = progress;
    }

    public ReadingStatus getStatus() {
        return status;
    }

    public void setStatus(ReadingStatus status) {
        this.status = status;
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
}
