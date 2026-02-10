package com.booksiread.backend.repository;

import com.booksiread.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository - Data access layer for User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Boolean existsByUsername(String username);
    
    Boolean existsByEmail(String email);

    // ============================================
    // Social Network Queries
    // ============================================

    /**
     * Search users by username or display name (for user discovery)
     */
    @Query("""
        SELECT u FROM User u 
        WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) 
        OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY u.followersCount DESC
    """)
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);

    /**
     * Find public users for discovery (ordered by followers)
     */
    @Query("SELECT u FROM User u WHERE u.isPublic = true ORDER BY u.followersCount DESC")
    Page<User> findPublicUsers(Pageable pageable);

    /**
     * Find users by favorite genre (for recommendations)
     */
    @Query("""
        SELECT u FROM User u 
        JOIN u.favoriteGenres g 
        WHERE LOWER(g) = LOWER(:genre) AND u.isPublic = true 
        ORDER BY u.followersCount DESC
    """)
    Page<User> findByFavoriteGenre(@Param("genre") String genre, Pageable pageable);

    /**
     * Get suggested users to follow (public users not already followed)
     */
    @Query("""
        SELECT u FROM User u 
        WHERE u.isPublic = true 
        AND u.id != :userId 
        AND u.id NOT IN (
            SELECT uf.following.id FROM UserFollow uf WHERE uf.follower.id = :userId
        )
        ORDER BY u.followersCount DESC
    """)
    Page<User> findSuggestedUsers(@Param("userId") Long userId, Pageable pageable);

    /**
     * Find users who share favorite genres with the given user.
     * Returns distinct users with at least one overlapping genre, excluding self and already-followed.
     */
    @Query("""
        SELECT DISTINCT u FROM User u
        JOIN u.favoriteGenres g
        WHERE u.isPublic = true
        AND u.id != :userId
        AND u.id NOT IN (
            SELECT uf.following.id FROM UserFollow uf WHERE uf.follower.id = :userId
        )
        AND LOWER(g) IN :genres
        ORDER BY u.followersCount DESC
    """)
    Page<User> findUsersWithSharedGenres(@Param("userId") Long userId,
                                         @Param("genres") List<String> genres,
                                         Pageable pageable);

    /**
     * Find ALL users who share favorite genres (including already-followed).
     * Used for "People with Similar Interests" which shows shared-taste users regardless of follow status.
     */
    @Query("""
        SELECT DISTINCT u FROM User u
        JOIN u.favoriteGenres g
        WHERE u.isPublic = true
        AND u.id != :userId
        AND LOWER(g) IN :genres
        ORDER BY u.followersCount DESC
    """)
    Page<User> findAllUsersWithSharedGenres(@Param("userId") Long userId,
                                            @Param("genres") List<String> genres,
                                            Pageable pageable);

    /**
     * Find all public users except self (including followed), for similarity fallback.
     */
    @Query("SELECT u FROM User u WHERE u.isPublic = true AND u.id != :userId ORDER BY u.followersCount DESC")
    Page<User> findAllOtherPublicUsers(@Param("userId") Long userId, Pageable pageable);
}
