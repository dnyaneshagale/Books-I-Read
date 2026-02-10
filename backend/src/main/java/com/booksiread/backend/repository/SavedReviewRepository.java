package com.booksiread.backend.repository;

import com.booksiread.backend.entity.SavedReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedReviewRepository extends JpaRepository<SavedReview, Long> {

    boolean existsByUserIdAndReviewId(Long userId, Long reviewId);

    Optional<SavedReview> findByUserIdAndReviewId(Long userId, Long reviewId);

    Page<SavedReview> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    void deleteByReviewId(Long reviewId);
}
