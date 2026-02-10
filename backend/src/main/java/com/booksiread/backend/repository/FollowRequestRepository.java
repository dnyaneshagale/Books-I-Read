package com.booksiread.backend.repository;

import com.booksiread.backend.entity.FollowRequest;
import com.booksiread.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * FollowRequestRepository - Data access layer for follow requests (private accounts)
 */
@Repository
public interface FollowRequestRepository extends JpaRepository<FollowRequest, Long> {

    /**
     * Check if a pending request already exists
     */
    boolean existsByRequesterIdAndTargetIdAndStatus(
            Long requesterId, 
            Long targetId, 
            FollowRequest.RequestStatus status
    );

    /**
     * Find a specific pending request
     */
    Optional<FollowRequest> findByRequesterIdAndTargetIdAndStatus(
            Long requesterId, 
            Long targetId, 
            FollowRequest.RequestStatus status
    );

    /**
     * Find any request between two users (regardless of status)
     */
    Optional<FollowRequest> findByRequesterIdAndTargetId(Long requesterId, Long targetId);

    /**
     * Get all pending requests for a user (requests they need to approve/reject)
     */
    @Query("SELECT fr FROM FollowRequest fr WHERE fr.target.id = :userId AND fr.status = 'PENDING' ORDER BY fr.createdAt DESC")
    Page<FollowRequest> findPendingRequestsForUser(@Param("userId") Long userId, Pageable pageable);

    /**
     * Get all pending requests sent by a user
     */
    @Query("SELECT fr FROM FollowRequest fr WHERE fr.requester.id = :userId AND fr.status = 'PENDING' ORDER BY fr.createdAt DESC")
    Page<FollowRequest> findPendingRequestsByUser(@Param("userId") Long userId, Pageable pageable);

    /**
     * Count pending requests for a user
     */
    long countByTargetIdAndStatus(Long targetId, FollowRequest.RequestStatus status);

    /**
     * Delete a request
     */
    void deleteByRequesterIdAndTargetId(Long requesterId, Long targetId);
}
