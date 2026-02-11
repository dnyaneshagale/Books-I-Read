package com.booksiread.backend.repository;

import com.booksiread.backend.entity.BookReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookReviewRepository extends JpaRepository<BookReview, Long> {

    /** Get all reviews for a book, newest first */
    Page<BookReview> findByBookIdOrderByCreatedAtDesc(Long bookId, Pageable pageable);

    /** Get all reviews by a user */
    Page<BookReview> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /** Check if user already reviewed a book */
    boolean existsByUserIdAndBookId(Long userId, Long bookId);

    /** Find user's review for a specific book */
    Optional<BookReview> findByUserIdAndBookId(Long userId, Long bookId);

    /** Get recent reviews from users the viewer is following */
    @Query("""
        SELECT br FROM BookReview br 
        WHERE br.user.id IN :followingIds 
        ORDER BY br.createdAt DESC
    """)
    Page<BookReview> findReviewsByFollowedUsers(
            @Param("followingIds") List<Long> followingIds, Pageable pageable);

    /** Get popular reviews (most liked) */
    @Query("""
        SELECT br FROM BookReview br 
        WHERE br.user.isPublic = true 
        ORDER BY br.likesCount DESC, br.createdAt DESC
    """)
    Page<BookReview> findPopularReviews(Pageable pageable);

    /** Count reviews for a book */
    long countByBookId(Long bookId);

    /** Count reviews by a user */
    long countByUserId(Long userId);

    /** Get average rating for a book from reviews */
    @Query("SELECT AVG(br.rating) FROM BookReview br WHERE br.book.id = :bookId AND br.rating IS NOT NULL")
    Double getAverageRatingForBook(@Param("bookId") Long bookId);

    /** Search reviews by content, book title, book author, or reviewer username */
    @Query("""
        SELECT br FROM BookReview br
        WHERE (LOWER(br.content) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(br.book.title) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(br.book.author) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(br.user.username) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(br.user.displayName) LIKE LOWER(CONCAT('%', :query, '%')))
          AND br.user.isPublic = true
        ORDER BY br.createdAt DESC
    """)
    Page<BookReview> searchReviews(@Param("query") String query, Pageable pageable);
}
