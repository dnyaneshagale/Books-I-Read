package com.booksiread.backend.controller;

import com.booksiread.backend.service.AiNotesService;
import com.booksiread.backend.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AiController - REST API endpoints for AI-powered features
 * 
 * Base URL: /api/ai
 */
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiNotesService aiNotesService;
    private final RecommendationService recommendationService;

    @Autowired
    public AiController(AiNotesService aiNotesService, RecommendationService recommendationService) {
        this.aiNotesService = aiNotesService;
        this.recommendationService = recommendationService;
    }

    /**
     * POST /api/ai/generate-notes/{id} - Generate/regenerate AI notes for a book
     * 
     * This endpoint triggers AI note generation for a specific book.
     * Processing happens asynchronously.
     * 
     * @param id - book ID
     * @return 202 Accepted with status message
     */
    @PostMapping("/generate-notes/{id}")
    public ResponseEntity<Map<String, Object>> generateAiNotes(@PathVariable Long id) {
        aiNotesService.regenerateNotes(id);
        
        return ResponseEntity.accepted().body(Map.of(
            "status", "accepted",
            "message", "AI notes generation started",
            "bookId", id
        ));
    }

    /**
     * POST /api/ai/recommendations/library - Get recommendations based on user's library
     * 
     * @param request - Contains the list of books the user has read
     * @return List of recommended books
     */
    @PostMapping("/recommendations/library")
    public ResponseEntity<Map<String, Object>> getLibraryRecommendations(@RequestBody Map<String, String> request) {
        String bookList = request.get("books");
        List<Map<String, String>> recommendations = recommendationService.getLibraryBasedRecommendations(bookList);
        
        return ResponseEntity.ok(Map.of("recommendations", recommendations));
    }

    /**
     * POST /api/ai/recommendations/custom - Get recommendations based on custom preferences
     * 
     * @param preferences - User's preferences (genre, mood, length, topics)
     * @return List of recommended books
     */
    @PostMapping("/recommendations/custom")
    public ResponseEntity<Map<String, Object>> getCustomRecommendations(@RequestBody Map<String, String> preferences) {
        List<Map<String, String>> recommendations = recommendationService.getCustomRecommendations(preferences);
        
        return ResponseEntity.ok(Map.of("recommendations", recommendations));
    }
}

