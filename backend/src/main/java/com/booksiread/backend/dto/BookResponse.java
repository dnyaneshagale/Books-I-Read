package com.booksiread.backend.dto;

import com.booksiread.backend.entity.Book;
import com.booksiread.backend.entity.Book.ReadingStatus;
import com.booksiread.backend.entity.Book.AiStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * BookResponse DTO - Returned to frontend
 * 
 * Includes computed fields:
 * - progress: reading progress percentage
 * - AI-generated notes fields
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
    private String notes;
    private Boolean isPublic;
    private List<String> tags;
    
    // AI-generated fields
    private String aiSummary;
    private String aiHighlights;
    private String aiOverallOpinion;
    private LocalDateTime aiGeneratedAt;
    private AiStatus aiStatus;

    // Constructors
    public BookResponse() {
    }

    public BookResponse(Long id, String title, String author, Integer totalPages, 
                       Integer pagesRead, Double progress, ReadingStatus status,
                       LocalDate startDate, LocalDate completeDate, Integer rating, String review,
                       String notes, Boolean isPublic, List<String> tags, String aiSummary, String aiHighlights, 
                       String aiOverallOpinion, LocalDateTime aiGeneratedAt, AiStatus aiStatus) {
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
        this.notes = notes;
        this.isPublic = isPublic;
        this.tags = tags;
        this.aiSummary = aiSummary;
        this.aiHighlights = aiHighlights;
        this.aiOverallOpinion = aiOverallOpinion;
        this.aiGeneratedAt = aiGeneratedAt;
        this.aiStatus = aiStatus;
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
            book.getNotes(),
            book.getIsPublic(),
            book.getTags(),
            book.getAiSummary(),
            book.getAiHighlights(),
            book.getAiOverallOpinion(),
            book.getAiGeneratedAt(),
            book.getAiStatus()
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    // ========== AI Fields Getters and Setters ==========
    
    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }

    public String getAiHighlights() {
        return aiHighlights;
    }

    public void setAiHighlights(String aiHighlights) {
        this.aiHighlights = aiHighlights;
    }

    public String getAiOverallOpinion() {
        return aiOverallOpinion;
    }

    public void setAiOverallOpinion(String aiOverallOpinion) {
        this.aiOverallOpinion = aiOverallOpinion;
    }

    public LocalDateTime getAiGeneratedAt() {
        return aiGeneratedAt;
    }

    public void setAiGeneratedAt(LocalDateTime aiGeneratedAt) {
        this.aiGeneratedAt = aiGeneratedAt;
    }

    public AiStatus getAiStatus() {
        return aiStatus;
    }

    public void setAiStatus(AiStatus aiStatus) {
        this.aiStatus = aiStatus;
    }
}
