package com.booksiread.backend.controller;

import com.booksiread.backend.dto.BookRequest;
import com.booksiread.backend.dto.BookResponse;
import com.booksiread.backend.service.BookService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * BookController - REST API endpoints for book management
 * 
 * Base URL: /api/books
 * 
 * Extension Notes:
 * - Add @PreAuthorize for role-based access control
 * - Add rate limiting with @RateLimiter
 * - Add API versioning (/api/v1/books)
 * - Add HATEOAS links for better REST compliance
 */
@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;
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
     * 
     * Extension: Add query parameters for filtering and pagination
     * ?status=reading&page=0&size=10&sort=createdAt,desc
     * 
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
     * 
     * Use this to update reading progress or book information
     * 
     * @param id - book ID
     * @param request - updated book details
     * @return updated book
     * @throws ResourceNotFoundException if book not found (404)
     */
    @PutMapping("/{id}")
    public ResponseEntity<BookResponse> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequest request) {
        BookResponse response = bookService.updateBook(id, request);
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
     * Extension: Add statistics endpoint
     * GET /api/books/stats - Get reading statistics
     * 
     * Returns:
     * - Total books
     * - Books completed
     * - Currently reading
     * - Total pages read
     * - Average progress
     */
}
