package com.booksiread.backend.client;

import com.booksiread.backend.dto.GeminiResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Gemini API Client - Handles direct communication with Google Gemini API
 * 
 * Uses: v1beta API with gemini-pro (most stable, widely supported model)
 * 
 * Extension Notes:
 * - Add retry logic using @Retryable (Spring Retry)
 * - Implement circuit breaker pattern (Resilience4j)
 * - Add request/response logging for debugging
 * - Consider switching to WebClient for reactive programming
 * - Add rate limiting to respect API quotas
 */
@Component
public class GeminiClient {

    private static final Logger logger = LoggerFactory.getLogger(GeminiClient.class);
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiClient() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Generate book notes using Gemini API
     * 
     * @param prompt - The prompt to send to Gemini
     * @return Parsed response or null if failed
     */
    public GeminiResponse generateBookNotes(String prompt) {
        try {
            logger.info("Calling Gemini API for book notes generation");

            // Build request body
            Map<String, Object> requestBody = buildRequestBody(prompt);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Make API call
            String url = GEMINI_API_URL + "?key=" + apiKey;
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            // Parse response
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return parseGeminiResponse(response.getBody());
            } else {
                logger.error("Gemini API returned non-OK status: {}", response.getStatusCode());
                return null;
            }

        } catch (Exception e) {
            logger.error("Error calling Gemini API: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Build request body for Gemini API
     */
    private Map<String, Object> buildRequestBody(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, Object> content = new HashMap<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", prompt);
        content.put("parts", List.of(part));
        
        requestBody.put("contents", List.of(content));
        
        // Add generation config optimized for JSON responses
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.3);  // Lower temp for more consistent JSON
        generationConfig.put("topK", 20);
        generationConfig.put("topP", 0.8);
        generationConfig.put("maxOutputTokens", 4096);  // Increased to prevent truncation
        requestBody.put("generationConfig", generationConfig);

        return requestBody;
    }

    /**
     * Parse Gemini API response and extract JSON content with robust error handling
     */
    private GeminiResponse parseGeminiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            
            // Navigate Gemini's response structure
            JsonNode candidates = root.path("candidates");
            if (candidates.isEmpty()) {
                logger.warn("No candidates in Gemini response");
                return null;
            }

            JsonNode content = candidates.get(0).path("content");
            JsonNode parts = content.path("parts");
            if (parts.isEmpty()) {
                logger.warn("No parts in Gemini response");
                return null;
            }

            String text = parts.get(0).path("text").asText();
            logger.info("Gemini raw response (first 500 chars): {}", 
                text.length() > 500 ? text.substring(0, 500) + "..." : text);

            // Extract and clean JSON
            String jsonText = extractAndCleanJson(text);
            
            if (jsonText == null || jsonText.isEmpty()) {
                logger.error("Failed to extract valid JSON from Gemini response");
                return null;
            }

            logger.info("Cleaned JSON length: {} characters", jsonText.length());

            // Parse with lenient settings
            return objectMapper.readValue(jsonText, GeminiResponse.class);

        } catch (Exception e) {
            logger.error("Error parsing Gemini response: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Extract and clean JSON from Gemini response with robust handling
     */
    private String extractAndCleanJson(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        
        String cleaned = text.trim();
        
        // Remove markdown code blocks
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        
        cleaned = cleaned.trim();
        
        // Find JSON object boundaries
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        
        if (start == -1 || end == -1 || start >= end) {
            logger.error("No valid JSON object found in response");
            return null;
        }
        
        cleaned = cleaned.substring(start, end + 1);
        
        // Fix common JSON issues
        cleaned = cleaned
            .replace("\n", " ")           // Remove newlines within strings
            .replace("\r", "")            // Remove carriage returns
            .replaceAll("\\s+", " ")      // Normalize whitespace
            .replace("\\'", "'")          // Fix escaped quotes
            .trim();
        
        return cleaned;
    }
}
