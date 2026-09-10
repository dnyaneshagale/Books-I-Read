package com.booksiread.backend.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Client for verifying recommendation candidates against Google Books.
 */
@Component
public class GoogleBooksClient {

    private static final Logger logger = LoggerFactory.getLogger(GoogleBooksClient.class);

    @Value("${google.books.api.key:}")
    private String apiKey = "";

    @Value("${google.books.api.url:https://www.googleapis.com/books/v1/volumes}")
    private String apiUrl = "https://www.googleapis.com/books/v1/volumes";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GoogleBooksClient() {
        this(new RestTemplate());
    }

    GoogleBooksClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Verify a title/author pair and return trusted metadata when a close match exists.
     * A null result means the candidate was not found, while exceptions are handled by
     * the caller as an unavailable verification service.
     */
    public Map<String, String> verifyBook(String title, String author) {
        if (title == null || title.isBlank() || author == null || author.isBlank()) {
            return null;
        }

        try {
            String query = "intitle:" + title + " inauthor:" + author;
            StringBuilder urlBuilder = new StringBuilder(apiUrl)
                    .append("?q=")
                    .append(URLEncoder.encode(query, StandardCharsets.UTF_8))
                    .append("&maxResults=5");
            if (apiKey != null && !apiKey.isBlank()) {
                urlBuilder.append("&key=").append(URLEncoder.encode(apiKey, StandardCharsets.UTF_8));
            }
            String url = urlBuilder.toString();
            String responseBody = restTemplate.getForObject(URI.create(url), String.class);
            JsonNode items = objectMapper.readTree(responseBody).path("items");

            JsonNode match = findBestMatch(items, title, author);
            if (match == null) {
                return null;
            }

            JsonNode volumeInfo = match.path("volumeInfo");
            Map<String, String> verifiedData = new HashMap<>();
            verifiedData.put("verifiedTitle", textOrEmpty(volumeInfo, "title"));
            verifiedData.put("verifiedAuthor", firstAuthor(volumeInfo));
            putIfPresent(verifiedData, "description", volumeInfo, "description");
            putIfPresent(verifiedData, "publishedDate", volumeInfo, "publishedDate");
            putIfPresent(verifiedData, "averageRating", volumeInfo, "averageRating");
            putIfPresent(verifiedData, "ratingsCount", volumeInfo, "ratingsCount");

            JsonNode imageLinks = volumeInfo.path("imageLinks");
            if (imageLinks.hasNonNull("thumbnail")) {
                verifiedData.put("coverUrl", imageLinks.get("thumbnail").asText().replace("http://", "https://"));
            }

            return verifiedData;
        } catch (Exception exception) {
            logger.warn("Google Books verification failed for '{} by {}': {}", title, author, exception.getMessage());
            throw new GoogleBooksVerificationException(exception);
        }
    }

    private JsonNode findBestMatch(JsonNode items, String title, String author) {
        if (!items.isArray()) {
            return null;
        }

        JsonNode bestMatch = null;
        int bestScore = 0;
        for (JsonNode item : items) {
            JsonNode volumeInfo = item.path("volumeInfo");
            String candidateTitle = textOrEmpty(volumeInfo, "title");
            String candidateAuthor = firstAuthor(volumeInfo);
            int score = matchScore(title, author, candidateTitle, candidateAuthor);
            if (score == 3 && score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        }
        return bestMatch;
    }

    private int matchScore(String title, String author, String candidateTitle, String candidateAuthor) {
        String normalizedTitle = normalize(title);
        String normalizedAuthor = normalize(author);
        String normalizedCandidateTitle = normalize(candidateTitle);
        String normalizedCandidateAuthor = normalize(candidateAuthor);

        boolean titleMatches = normalizedCandidateTitle.equals(normalizedTitle)
                || normalizedCandidateTitle.startsWith(normalizedTitle)
                || normalizedTitle.startsWith(normalizedCandidateTitle);
        boolean authorMatches = normalizedCandidateAuthor.contains(normalizedAuthor)
                || normalizedAuthor.contains(normalizedCandidateAuthor);

        if (titleMatches && authorMatches) return 3;
        if (titleMatches) return 1;
        return 0;
    }

    private String firstAuthor(JsonNode volumeInfo) {
        JsonNode authors = volumeInfo.path("authors");
        return authors.isArray() && !authors.isEmpty() ? authors.get(0).asText() : "";
    }

    private String textOrEmpty(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asText() : "";
    }

    private void putIfPresent(Map<String, String> target, String key, JsonNode source, String field) {
        if (source.hasNonNull(field) && !source.get(field).asText().isBlank()) {
            target.put(key, source.get(field).asText());
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase().replaceAll("[^a-z0-9]", "");
    }

    public static class GoogleBooksVerificationException extends RuntimeException {
        public GoogleBooksVerificationException(Throwable cause) {
            super(cause);
        }
    }
}
