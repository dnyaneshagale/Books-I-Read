package com.booksiread.backend.service;

import com.booksiread.backend.client.GeminiClient;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * RecommendationService - AI-powered book recommendations
 */
@Service
public class RecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationService.class);

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    public RecommendationService(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Get book recommendations based on user's reading library
     */
    public List<Map<String, String>> getLibraryBasedRecommendations(String bookList) {
        logger.info("Generating library-based recommendations");

        String prompt = buildLibraryPrompt(bookList);
        String jsonResponse = geminiClient.generateRecommendations(prompt);

        return parseRecommendations(jsonResponse);
    }

    /**
     * Get book recommendations based on custom preferences
     */
    public List<Map<String, String>> getCustomRecommendations(Map<String, String> preferences) {
        logger.info("Generating custom recommendations with preferences: {}", preferences);

        String prompt = buildCustomPrompt(preferences);
        String jsonResponse = geminiClient.generateRecommendations(prompt);

        return parseRecommendations(jsonResponse);
    }

    /**
     * Build prompt for library-based recommendations
     */
    private String buildLibraryPrompt(String bookList) {
        return String.format(
                "I have read these books: %s.\n\n" +
                "Based on my reading history, recommend 5 new books I might like. " +
                "Do not recommend any books already in my list.\n\n" +
                "CRITICAL: Return ONLY valid JSON. No markdown, no explanation, no code blocks.\n\n" +
                "Required JSON structure:\n" +
                "[\n" +
                "  {\n" +
                "    \"title\": \"Book Title\",\n" +
                "    \"author\": \"Author Name\",\n" +
                "    \"reason\": \"One short sentence explaining why this book matches my taste.\"\n" +
                "  }\n" +
                "]\n\n" +
                "Return exactly 5 recommendations as a valid JSON array.",
                bookList
        );
    }

    /**
     * Build prompt for custom recommendations
     */
    private String buildCustomPrompt(Map<String, String> preferences) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Recommend 5 books based on the following preferences:\n\n");

        if (preferences.get("genre") != null && !preferences.get("genre").isEmpty()) {
            promptBuilder.append("Genre: ").append(preferences.get("genre")).append("\n");
        }
        if (preferences.get("mood") != null && !preferences.get("mood").isEmpty()) {
            promptBuilder.append("Mood/Vibe: ").append(preferences.get("mood")).append("\n");
        }
        if (preferences.get("length") != null && !preferences.get("length").isEmpty()) {
            promptBuilder.append("Book Length: ").append(preferences.get("length")).append("\n");
        }
        if (preferences.get("topics") != null && !preferences.get("topics").isEmpty()) {
            promptBuilder.append("Specific Topics: ").append(preferences.get("topics")).append("\n");
        }

        promptBuilder.append("\nCRITICAL: Return ONLY valid JSON. No markdown, no explanation, no code blocks.\n\n");
        promptBuilder.append("Required JSON structure:\n");
        promptBuilder.append("[\n");
        promptBuilder.append("  {\n");
        promptBuilder.append("    \"title\": \"Book Title\",\n");
        promptBuilder.append("    \"author\": \"Author Name\",\n");
        promptBuilder.append("    \"reason\": \"One short sentence explaining why this book fits the criteria.\"\n");
        promptBuilder.append("  }\n");
        promptBuilder.append("]\n\n");
        promptBuilder.append("Return exactly 5 recommendations as a valid JSON array.");

        return promptBuilder.toString();
    }

    /**
     * Parse JSON response into list of recommendations
     */
    private List<Map<String, String>> parseRecommendations(String jsonResponse) {
        if (jsonResponse == null || jsonResponse.isEmpty()) {
            logger.error("Empty response from Gemini API");
            return new ArrayList<>();
        }

        try {
            // Clean the response (remove markdown code blocks if present)
            String cleanedJson = cleanJsonResponse(jsonResponse);

            // Parse JSON array
            List<Map<String, String>> recommendations = objectMapper.readValue(
                    cleanedJson,
                    new TypeReference<List<Map<String, String>>>() {}
            );

            logger.info("Successfully parsed {} recommendations", recommendations.size());
            return recommendations;

        } catch (Exception e) {
            logger.error("Failed to parse recommendations JSON: {}", e.getMessage());
            logger.error("Raw response: {}", jsonResponse);
            return new ArrayList<>();
        }
    }

    /**
     * Clean JSON response (remove markdown code blocks, extra whitespace)
     */
    private String cleanJsonResponse(String response) {
        // Remove markdown code blocks
        String cleaned = response.replaceAll("```json\\s*", "")
                                 .replaceAll("```\\s*", "")
                                 .trim();

        // Find JSON array boundaries
        int startIndex = cleaned.indexOf('[');
        int endIndex = cleaned.lastIndexOf(']');

        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            return cleaned.substring(startIndex, endIndex + 1);
        }

        return cleaned;
    }
}
