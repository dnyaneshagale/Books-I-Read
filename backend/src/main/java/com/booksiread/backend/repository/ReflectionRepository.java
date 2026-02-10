package com.booksiread.backend.repository;

import com.booksiread.backend.entity.Reflection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReflectionRepository extends JpaRepository<Reflection, Long> {

    /**
     * Following feed: reflections from users the current user follows.
     * Relevance: reflections from users who share genres/authors appear first,
     * then by recency.
     */
    @Query("""
        SELECT r FROM Reflection r
        WHERE r.user.id IN :followingIds
        ORDER BY r.createdAt DESC
    """)
    Page<Reflection> findFollowingFeed(
            @Param("followingIds") List<Long> followingIds,
            Pageable pageable);

    /**
     * Everyone feed: reflections from public profiles that are NOT followers-only,
     * OR from followed users (even if followers-only).
     * This gives everyone-visible reflections + all reflections from people you follow.
     */
    @Query("""
        SELECT r FROM Reflection r
        WHERE (r.user.isPublic = true AND r.visibleToFollowersOnly = false)
           OR (r.user.id IN :followingIds)
        ORDER BY r.createdAt DESC
    """)
    Page<Reflection> findEveryoneFeed(
            @Param("followingIds") List<Long> followingIds,
            Pageable pageable);

    /**
     * Everyone feed fallback when user follows nobody:
     * Only public reflections from public users.
     */
    @Query("""
        SELECT r FROM Reflection r
        WHERE r.user.isPublic = true AND r.visibleToFollowersOnly = false
        ORDER BY r.createdAt DESC
    """)
    Page<Reflection> findPublicReflections(Pageable pageable);

    /** Get reflections by a specific user */
    Page<Reflection> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /** Get reflections for a specific book */
    Page<Reflection> findByBookIdOrderByCreatedAtDesc(Long bookId, Pageable pageable);

    /** Count reflections by user */
    long countByUserId(Long userId);
}
