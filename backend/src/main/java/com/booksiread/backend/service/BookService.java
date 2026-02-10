package com.booksiread.backend.service;

import com.booksiread.backend.dto.BookRequest;
import com.booksiread.backend.dto.BookResponse;

import java.util.List;

/**
 * BookService Interface - Business logic layer
 */
public interface BookService {

    /**
     * Create a new book
     * @param request - book details
     * @return created book with calculated fields
     */
    BookResponse createBook(BookRequest request);

    /**
     * Get all books
     * @return list of all books
     */
    List<BookResponse> getAllBooks();

    /**
     * Get a single book by ID
     * @param id - book ID
     * @return book details
     * @throws ResourceNotFoundException if book not found
     */
    BookResponse getBookById(Long id);

    /**
     * Update book details (including progress)
     * @param id - book ID
     * @param request - updated book details
     * @return updated book
     * @throws ResourceNotFoundException if book not found
     */
    BookResponse updateBook(Long id, BookRequest request);

    /**
     * Toggle book privacy
     */
    BookResponse togglePrivacy(Long id, Boolean isPublic);

    /**
     * Delete a book
     * @param id - book ID
     * @throws ResourceNotFoundException if book not found
     */
    void deleteBook(Long id);
}
