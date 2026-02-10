package com.booksiread.backend.repository;

import com.booksiread.backend.entity.Book;
import com.booksiread.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
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

    /**
     * Count all books for a user
     */
    long countByUserId(Long userId);

    /**
     * Count public books for a user
     */
    long countByUserIdAndIsPublicTrue(Long userId);

    /**
     * Count finished books for a user within a date range (for reading goals)
     */
    @Query("SELECT COUNT(b) FROM Book b WHERE b.user.id = :userId AND b.status = 'FINISHED' AND b.completeDate >= :startDate AND b.completeDate <= :endDate")
    int countFinishedBooksInDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
