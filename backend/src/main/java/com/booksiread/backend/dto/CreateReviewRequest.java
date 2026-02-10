package com.booksiread.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateReviewRequest {

    @NotBlank(message = "Review content is required")
    @Size(max = 5000, message = "Review must be at most 5000 characters")
    private String content;

    @Min(1) @Max(5)
    private Integer rating;

    private Boolean containsSpoilers = false;

    // Getters and Setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public Boolean getContainsSpoilers() { return containsSpoilers; }
    public void setContainsSpoilers(Boolean containsSpoilers) { this.containsSpoilers = containsSpoilers; }
}
