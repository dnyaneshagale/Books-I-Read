package com.booksiread.backend.service;

import com.booksiread.backend.client.GeminiClient;
import com.booksiread.backend.dto.GeminiResponse;
import com.booksiread.backend.entity.Book;
import com.booksiread.backend.repository.BookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * AI Notes Service - Business logic for generating AI-powered book notes
 */
@Service
public class AiNotesService {

    private static final Logger logger = LoggerFactory.getLogger(AiNotesService.class);

    private final GeminiClient geminiClient;
    private final BookRepository bookRepository;

    public AiNotesService(GeminiClient geminiClient, BookRepository bookRepository) {
        this.geminiClient = geminiClient;
        this.bookRepository = bookRepository;
    }

    /**
     * Generate AI notes asynchronously for a book
     * 
     * @param bookId - The book ID to generate notes for
     */
    @Async("aiNotesExecutor")
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void generateNotesAsync(Long bookId) {
        logger.info("Starting async AI notes generation for book ID: {}", bookId);

        try {
            // Small delay to ensure parent transaction commits
            Thread.sleep(100);
            
            // Fetch book from database
            Book book = bookRepository.findById(bookId)
                    .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));

            // Build prompt
            String prompt = buildPrompt(book.getTitle(), book.getAuthor());

            // Call Gemini API
            GeminiResponse response = geminiClient.generateBookNotes(prompt);

            if (response != null && isValidResponse(response)) {
                // Update book with AI notes
                updateBookWithNotes(book, response);
                logger.info("Successfully generated AI notes for book: {}", book.getTitle());
            } else {
                // Mark as failed
                markAsFailed(book, "Invalid or empty response from Gemini API");
                logger.warn("Failed to generate valid AI notes for book: {}", book.getTitle());
            }

        } catch (Exception e) {
            logger.error("Error generating AI notes for book ID {}: {}", bookId, e.getMessage(), e);
            
            // Attempt to mark book as failed (best effort)
            try {
                Book book = bookRepository.findById(bookId).orElse(null);
                if (book != null) {
                    markAsFailed(book, "Exception: " + e.getMessage());
                }
            } catch (Exception ex) {
                logger.error("Failed to mark book as failed: {}", ex.getMessage());
            }
        }
    }

    /**
     * Build optimized prompt for Gemini API with strict JSON format requirements
     */
    private String buildPrompt(String title, String author) {
        return String.format(
                "You are a book analyzer. Generate book notes for \"%s\" by %s.\n\n" +
                "CRITICAL: Return ONLY valid JSON. No markdown, no explanation, no code blocks.\n\n" +
                "Required JSON structure:\n" +
                "{\n" +
                "  \"summary\": \"2-3 sentence summary without spoilers\",\n" +
                "  \"keyHighlights\": [\"point 1\", \"point 2\", \"point 3\", \"point 4\", \"point 5\"],\n" +
                "  \"overallOpinion\": [\"what readers like 1\", \"what readers like 2\", \"what readers dislike 1\"],\n" +
                "  \"mainThemes\": [\"theme 1\", \"theme 2\", \"theme 3\"]\n" +
                "}\n\n" +
                "Rules:\n" +
                "- Use simple strings (no special characters or quotes inside strings)\n" +
                "- Keep all text brief and factual\n" +
                "- Return ONLY the JSON object\n" +
                "- If unknown, use \"Information not available\"",
                title, author
        );
    }

    /**
     * Validate Gemini response has required fields
     */
    private boolean isValidResponse(GeminiResponse response) {
        return response.getSummary() != null && !response.getSummary().trim().isEmpty()
                && response.getKeyHighlights() != null && !response.getKeyHighlights().isEmpty()
                && response.getOverallOpinion() != null && !response.getOverallOpinion().isEmpty();
    }

    /**
     * Update book entity with AI-generated notes
     */
    private void updateBookWithNotes(Book book, GeminiResponse response) {
        book.setAiSummary(response.getSummary());
        
        // Convert highlights list to newline-separated string
        book.setAiHighlights(String.join("\n", response.getKeyHighlights()));
        
        // Convert opinion list to newline-separated string
        book.setAiOverallOpinion(String.join("\n", response.getOverallOpinion()));
        book.setAiGeneratedAt(LocalDateTime.now());
        book.setAiStatus(Book.AiStatus.COMPLETED);
        
        bookRepository.save(book);
    }

    /**
     * Mark book AI generation as failed
     */
    private void markAsFailed(Book book, String reason) {
        book.setAiStatus(Book.AiStatus.FAILED);
        book.setAiSummary("Failed to generate notes: " + reason);
        book.setAiGeneratedAt(LocalDateTime.now());
        bookRepository.save(book);
    }

    /**
     * Regenerate notes for an existing book (manual trigger)
     */
    @Transactional
    public void regenerateNotes(Long bookId) {
        logger.info("Regenerating AI notes for book ID: {}", bookId);
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));
        
        // Reset status to pending
        book.setAiStatus(Book.AiStatus.PENDING);
        book.setAiSummary(null);
        book.setAiHighlights(null);
        book.setAiOverallOpinion(null);
        bookRepository.save(book);
        
        // Trigger async generation
        generateNotesAsync(bookId);
    }
}
