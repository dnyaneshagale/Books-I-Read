package com.booksiread.backend.repository;

import com.booksiread.backend.entity.ReviewComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long> {

    /** Get top-level comments (no parent) for a review */
    Page<ReviewComment> findByReviewIdAndParentCommentIsNullOrderByCreatedAtAsc(Long reviewId, Pageable pageable);

    /** Legacy: all comments for a review (ascending) */
    Page<ReviewComment> findByReviewIdOrderByCreatedAtAsc(Long reviewId, Pageable pageable);

    /** Get replies to a specific comment */
    List<ReviewComment> findByParentCommentIdOrderByCreatedAtAsc(Long parentId);

    long countByReviewId(Long reviewId);

    void deleteByReviewId(Long reviewId);
}
