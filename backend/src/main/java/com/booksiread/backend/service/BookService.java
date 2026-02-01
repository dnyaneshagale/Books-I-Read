package com.booksiread.backend.service;

import com.booksiread.backend.dto.BookRequest;
import com.booksiread.backend.dto.BookResponse;

import java.util.List;

/**
 * BookService Interface - Business logic layer
 * 
 * Extension Notes:
 * - Add getUserBooks(Long userId) for multi-user support
 * - Add searchBooks(String query) for search functionality
 * - Add getBooksByStatus(String status) for filtering
 * - Add importBooksFromCSV() for bulk import
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
     * Extension: Add pagination and sorting parameters
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
     * Delete a book
     * @param id - book ID
     * @throws ResourceNotFoundException if book not found
     */
    void deleteBook(Long id);
}
