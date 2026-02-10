package com.booksiread.backend.repository;

import com.booksiread.backend.entity.ReflectionComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReflectionCommentRepository extends JpaRepository<ReflectionComment, Long> {

    /** Get top-level comments (no parent) for a reflection */
    Page<ReflectionComment> findByReflectionIdAndParentCommentIsNullOrderByCreatedAtAsc(Long reflectionId, Pageable pageable);

    /** Legacy: all comments for a reflection (ascending) */
    Page<ReflectionComment> findByReflectionIdOrderByCreatedAtAsc(Long reflectionId, Pageable pageable);

    /** Get replies to a specific comment */
    List<ReflectionComment> findByParentCommentIdOrderByCreatedAtAsc(Long parentId);

    long countByReflectionId(Long reflectionId);

    /** Delete all comments for a reflection (cascade cleanup) */
    void deleteByReflectionId(Long reflectionId);
}
