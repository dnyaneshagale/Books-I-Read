package com.booksiread.backend.repository;

import com.booksiread.backend.entity.Book;
import com.booksiread.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * BookRepository - Data access layer for Book entity
 * 
 * Extends JpaRepository for basic CRUD operations
 * 
 * Extension Notes:
 * - Add findByStatus for filtering (completed, reading, etc.)
 * - Add findByGenre for category-based filtering
 * - Add custom queries with @Query for advanced search
 * - Add pagination with PagingAndSortingRepository
 */
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    /**
     * Find all books for a specific user
     */
    List<Book> findByUser(User user);
    
    /**
     * Find a book by ID and user (for authorization)
     */
    Optional<Book> findByIdAndUser(Long id, User user);
}
