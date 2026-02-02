package com.booksiread.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * DTO for parsing Gemini API responses
 * 
 * Extension Notes:
 * - Add error handling for malformed responses
 * - Consider adding metadata fields (tokensUsed, modelVersion)
 * - Add validation for required fields
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiResponse {

    private String summary;
    private List<String> keyHighlights;
    private List<String> overallOpinion;
    private List<String> mainThemes;

    // Constructors
    public GeminiResponse() {
    }

    public GeminiResponse(String summary, List<String> keyHighlights, List<String> overallOpinion, List<String> mainThemes) {
        this.summary = summary;
        this.keyHighlights = keyHighlights;
        this.overallOpinion = overallOpinion;
        this.mainThemes = mainThemes;
    }

    // Getters and Setters
    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getKeyHighlights() {
        return keyHighlights;
    }

    public void setKeyHighlights(List<String> keyHighlights) {
        this.keyHighlights = keyHighlights;
    }

    public List<String> getOverallOpinion() {
        return overallOpinion;
    }

    public void setOverallOpinion(List<String> overallOpinion) {
        this.overallOpinion = overallOpinion;
    }

    public List<String> getMainThemes() {
        return mainThemes;
    }

    public void setMainThemes(List<String> mainThemes) {
        this.mainThemes = mainThemes;
    }

    @Override
    public String toString() {
        return "GeminiResponse{" +
                "summary='" + summary + '\'' +
                ", keyHighlights=" + keyHighlights +
                ", overallOpinion='" + overallOpinion + '\'' +
                ", mainThemes=" + mainThemes +
                '}';
    }
}
