package com.booksiread.backend.controller;

import com.booksiread.backend.dto.BookRequest;
import com.booksiread.backend.dto.BookResponse;
import com.booksiread.backend.repository.BookReviewRepository;
import com.booksiread.backend.service.AiNotesService;
import com.booksiread.backend.service.BookService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * BookController - REST API endpoints for book management
 * Base URL: /api/books
 */
@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final AiNotesService aiNotesService;
    private final BookReviewRepository bookReviewRepository;

    @Autowired
    public BookController(BookService bookService, AiNotesService aiNotesService,
                          BookReviewRepository bookReviewRepository) {
        this.bookService = bookService;
        this.aiNotesService = aiNotesService;
        this.bookReviewRepository = bookReviewRepository;
    }

    /**
     * POST /api/books - Create a new book
     * 
     * @param request - validated book details
     * @return created book with 201 status
     */
    @PostMapping
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody BookRequest request) {
        BookResponse response = bookService.createBook(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/books - Get all books
     * @return list of all books
     */
    @GetMapping
    public ResponseEntity<List<BookResponse>> getAllBooks() {
        List<BookResponse> books = bookService.getAllBooks();
        return ResponseEntity.ok(books);
    }

    /**
     * GET /api/books/{id} - Get a single book
     * 
     * @param id - book ID
     * @return book details
     * @throws ResourceNotFoundException if book not found (404)
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        BookResponse response = bookService.getBookById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/books/{id} - Update book details
     * @param id - book ID
     * @param request - updated book details
     * @return updated book
     */
    @PutMapping("/{id}")
    public ResponseEntity<BookResponse> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequest request) {
        BookResponse response = bookService.updateBook(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/books/{id}/privacy - Toggle book privacy
     */
    @PatchMapping("/{id}/privacy")
    public ResponseEntity<BookResponse> togglePrivacy(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Boolean> body) {
        Boolean isPublic = body.get("isPublic");
        BookResponse response = bookService.togglePrivacy(id, isPublic);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/books/{id} - Delete a book
     * 
     * @param id - book ID
     * @return 204 No Content on success
     * @throws ResourceNotFoundException if book not found (404)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/books/{id}/regenerate-notes - Regenerate AI notes for a book
     * @param id - book ID
     * @return 202 Accepted (async processing)
     */
    @PostMapping("/{id}/regenerate-notes")
    public ResponseEntity<String> regenerateAiNotes(@PathVariable Long id) {
        aiNotesService.regenerateNotes(id);
        return ResponseEntity.accepted().body("AI notes regeneration started");
    }

    /**
     * GET /api/books/{id}/community-stats - Community rating & review count for a book
     */
    @GetMapping("/{id}/community-stats")
    public ResponseEntity<Map<String, Object>> getCommunityStats(@PathVariable Long id) {
        Map<String, Object> stats = new HashMap<>();
        Double avgRating = bookReviewRepository.getAverageRatingForBook(id);
        long reviewCount = bookReviewRepository.countByBookId(id);
        stats.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null);
        stats.put("reviewCount", reviewCount);
        return ResponseEntity.ok(stats);
    }
}
