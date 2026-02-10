package com.booksiread.backend.repository;

import com.booksiread.backend.entity.User;
import com.booksiread.backend.entity.UserFollow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserFollowRepository - Data access layer for follow relationships
 */
@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {

    /**
     * Check if a follow relationship exists
     */
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    /**
     * Find a specific follow relationship
     */
    Optional<UserFollow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    /**
     * Get all users that a user is following
     */
    @Query("SELECT uf.following FROM UserFollow uf WHERE uf.follower.id = :userId")
    Page<User> findFollowingByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Get all followers of a user
     */
    @Query("SELECT uf.follower FROM UserFollow uf WHERE uf.following.id = :userId")
    Page<User> findFollowersByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Get IDs of all users that a user is following (for feed queries)
     */
    @Query("SELECT uf.following.id FROM UserFollow uf WHERE uf.follower.id = :userId")
    List<Long> findFollowingIdsByUserId(@Param("userId") Long userId);

    /**
     * Get IDs of all followers of a user (for notifications)
     */
    @Query("SELECT uf.follower.id FROM UserFollow uf WHERE uf.following.id = :userId")
    List<Long> findFollowerIdsByUserId(@Param("userId") Long userId);

    /**
     * Count followers for a user
     */
    long countByFollowingId(Long followingId);

    /**
     * Count users that a user is following
     */
    long countByFollowerId(Long followerId);

    /**
     * Delete a follow relationship
     */
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);
}
