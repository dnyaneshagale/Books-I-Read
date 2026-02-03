package com.booksiread.backend.repository;

import com.booksiread.backend.entity.Book;
import com.booksiread.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * BookRepository - Data access layer for Book entity
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
