package com.booksiread.backend.repository;

import com.booksiread.backend.entity.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * UserActivityRepository - Data access layer for user activities (social feed)
 */
@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    /**
     * Get activities for a specific user (for their profile)
     */
    Page<UserActivity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Get feed: book-related activities from users that the current user follows
     * Also includes notable book activities from public users for discovery
     * Excludes notification-type events (FOLLOWED_USER, JOINED_PLATFORM)
     */
    @Query("""
        SELECT ua FROM UserActivity ua 
        WHERE (ua.user.id IN :followingIds 
               AND ua.activityType IN ('STARTED_READING', 'FINISHED_BOOK', 'PROGRESS_UPDATE', 'ADDED_BOOK', 'RATED_BOOK', 'WROTE_REVIEW'))
        OR (ua.user.isPublic = true 
            AND ua.user.id NOT IN :followingIds 
            AND ua.activityType IN ('FINISHED_BOOK', 'RATED_BOOK', 'WROTE_REVIEW'))
        ORDER BY ua.createdAt DESC
    """)
    Page<UserActivity> findFeedActivities(@Param("followingIds") List<Long> followingIds, Pageable pageable);

    /**
     * Get activities only from followed users
     */
    @Query("SELECT ua FROM UserActivity ua WHERE ua.user.id IN :followingIds ORDER BY ua.createdAt DESC")
    Page<UserActivity> findActivitiesByFollowingIds(@Param("followingIds") List<Long> followingIds, Pageable pageable);

    /**
     * Get recent book-related activities for a specific book
     */
    @Query("SELECT ua FROM UserActivity ua WHERE ua.book.id = :bookId ORDER BY ua.createdAt DESC")
    Page<UserActivity> findByBookId(@Param("bookId") Long bookId, Pageable pageable);

    /**
     * Find activities by type for a user
     */
    Page<UserActivity> findByUserIdAndActivityTypeOrderByCreatedAtDesc(
            Long userId, 
            UserActivity.ActivityType activityType, 
            Pageable pageable
    );

    /**
     * Get recent book-related activities from public users (for discovery when not following anyone)
     */
    @Query("""
        SELECT ua FROM UserActivity ua 
        WHERE ua.user.isPublic = true 
        AND ua.activityType IN ('STARTED_READING', 'FINISHED_BOOK', 'PROGRESS_UPDATE', 'ADDED_BOOK', 'RATED_BOOK', 'WROTE_REVIEW')
        ORDER BY ua.createdAt DESC
    """)
    Page<UserActivity> findPublicActivities(Pageable pageable);
}
