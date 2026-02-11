package com.booksiread.backend.controller;

import com.booksiread.backend.dto.*;
import com.booksiread.backend.entity.User;
import com.booksiread.backend.security.CustomUserDetailsService;
import com.booksiread.backend.service.SocialService;

import java.util.List;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * SocialController - REST API for social network features
 * 
 * Endpoints:
 * - Profile management
 * - Follow/Unfollow (Instagram-like with private accounts)
 * - Follow requests
 * - User discovery and search
 * - Activity feed
 * 
 * Base URL: /api/social
 */
@RestController
@RequestMapping("/api/social")
public class SocialController {

    private final SocialService socialService;
    private final CustomUserDetailsService userDetailsService;

    @Autowired
    public SocialController(SocialService socialService, CustomUserDetailsService userDetailsService) {
        this.socialService = socialService;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Get the currently authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userDetailsService.loadUserEntityByUsername(username);
    }

    // ============================================
    // Profile Endpoints
    // ============================================

    /**
     * GET /api/social/profile/me - Get current user's profile
     */
    @GetMapping("/profile/me")
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        User currentUser = getCurrentUser();
        UserProfileResponse profile = socialService.getProfileById(currentUser.getId(), currentUser.getId());
        return ResponseEntity.ok(profile);
    }

    /**
     * GET /api/social/profile/{username} - Get user profile by username
     */
    @GetMapping("/profile/{username}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable String username) {
        User currentUser = getCurrentUser();
        UserProfileResponse profile = socialService.getProfile(username, currentUser.getId());
        return ResponseEntity.ok(profile);
    }

    /**
     * GET /api/social/profile/id/{userId} - Get user profile by ID
     */
    @GetMapping("/profile/id/{userId}")
    public ResponseEntity<UserProfileResponse> getProfileById(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        UserProfileResponse profile = socialService.getProfileById(userId, currentUser.getId());
        return ResponseEntity.ok(profile);
    }

    /**
     * PUT /api/social/profile - Update current user's profile
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User currentUser = getCurrentUser();
        UserProfileResponse profile = socialService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(profile);
    }

    /**
     * GET /api/social/profile/{username}/books - Get a user's books (respects privacy)
     */
    @GetMapping("/profile/{username}/books")
    public ResponseEntity<List<BookResponse>> getUserBooks(@PathVariable String username) {
        User currentUser = getCurrentUser();
        List<BookResponse> books = socialService.getUserBooks(username, currentUser.getId());
        return ResponseEntity.ok(books);
    }

    // ============================================
    // Follow/Unfollow Endpoints
    // ============================================

    /**
     * POST /api/social/follow/{userId} - Follow a user (or send request for private accounts)
     * 
     * @return "followed" - now following the user
     *         "requested" - follow request sent (private account)
     *         "already_following" - already following
     *         "already_requested" - request already pending
     */
    @PostMapping("/follow/{userId}")
    public ResponseEntity<Map<String, String>> followUser(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        String result = socialService.followUser(currentUser.getId(), userId);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", result);
        
        HttpStatus status = result.equals("followed") || result.equals("requested") 
                ? HttpStatus.OK 
                : HttpStatus.CONFLICT;
        
        return ResponseEntity.status(status).body(response);
    }

    /**
     * DELETE /api/social/follow/{userId} - Unfollow a user
     */
    @DeleteMapping("/follow/{userId}")
    public ResponseEntity<Void> unfollowUser(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        socialService.unfollowUser(currentUser.getId(), userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/social/follow/request/{userId} - Cancel pending follow request
     */
    @DeleteMapping("/follow/request/{userId}")
    public ResponseEntity<Void> cancelFollowRequest(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        socialService.cancelFollowRequest(currentUser.getId(), userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/social/followers/{userId} - Get followers of a user
     */
    @GetMapping("/followers/{userId}")
    public ResponseEntity<Page<UserCardResponse>> getFollowers(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<UserCardResponse> followers = socialService.getFollowers(userId, currentUser.getId(), page, size);
        return ResponseEntity.ok(followers);
    }

    /**
     * GET /api/social/following/{userId} - Get users that a user is following
     */
    @GetMapping("/following/{userId}")
    public ResponseEntity<Page<UserCardResponse>> getFollowing(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<UserCardResponse> following = socialService.getFollowing(userId, currentUser.getId(), page, size);
        return ResponseEntity.ok(following);
    }

    // ============================================
    // Follow Request Endpoints (for private accounts)
    // ============================================

    /**
     * GET /api/social/requests - Get pending follow requests for current user
     */
    @GetMapping("/requests")
    public ResponseEntity<Page<FollowRequestResponse>> getPendingRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<FollowRequestResponse> requests = socialService.getPendingRequests(currentUser.getId(), page, size);
        return ResponseEntity.ok(requests);
    }

    /**
     * GET /api/social/requests/count - Get count of pending follow requests
     */
    @GetMapping("/requests/count")
    public ResponseEntity<Map<String, Long>> getPendingRequestsCount() {
        User currentUser = getCurrentUser();
        long count = socialService.getPendingRequestsCount(currentUser.getId());
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/social/requests/{requestId}/approve - Approve a follow request
     */
    @PostMapping("/requests/{requestId}/approve")
    public ResponseEntity<Void> approveFollowRequest(@PathVariable Long requestId) {
        User currentUser = getCurrentUser();
        socialService.approveFollowRequest(requestId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/social/requests/{requestId}/reject - Reject a follow request
     */
    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<Void> rejectFollowRequest(@PathVariable Long requestId) {
        User currentUser = getCurrentUser();
        socialService.rejectFollowRequest(requestId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    // ============================================
    // Discovery & Search Endpoints
    // ============================================

    /**
     * GET /api/social/search - Search users by username or display name
     */
    @GetMapping("/search")
    public ResponseEntity<Page<UserCardResponse>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<UserCardResponse> users = socialService.searchUsers(query, currentUser.getId(), page, size);
        return ResponseEntity.ok(users);
    }

    /**
     * GET /api/social/discover - Discover public users (for exploration)
     */
    @GetMapping("/discover")
    public ResponseEntity<Page<UserCardResponse>> discoverUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<UserCardResponse> users = socialService.discoverUsers(currentUser.getId(), page, size);
        return ResponseEntity.ok(users);
    }

    /**
     * GET /api/social/suggestions - Get suggested users to follow
     */
    @GetMapping("/suggestions")
    public ResponseEntity<Page<UserCardResponse>> getSuggestedUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = getCurrentUser();
        Page<UserCardResponse> users = socialService.getSuggestedUsers(currentUser.getId(), page, size);
        return ResponseEntity.ok(users);
    }

    /**
     * GET /api/social/similar - Get users with similar interests
     * Matches by shared genres, authors read, and common books
     */
    @GetMapping("/similar")
    public ResponseEntity<Page<UserCardResponse>> getSimilarUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = getCurrentUser();
        Page<UserCardResponse> users = socialService.getSimilarUsers(currentUser.getId(), page, size);
        return ResponseEntity.ok(users);
    }

    // ============================================
    // Activity Feed Endpoints
    // ============================================

    /**
     * GET /api/social/feed - Get activity feed (from followed users)
     */
    @GetMapping("/feed")
    public ResponseEntity<Page<ActivityResponse>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<ActivityResponse> feed = socialService.getFeed(currentUser.getId(), page, size);
        return ResponseEntity.ok(feed);
    }

    /**
     * GET /api/social/activities/{userId} - Get activities for a specific user
     */
    @GetMapping("/activities/{userId}")
    public ResponseEntity<Page<ActivityResponse>> getUserActivities(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<ActivityResponse> activities = socialService.getUserActivities(userId, currentUser.getId(), page, size);
        return ResponseEntity.ok(activities);
    }

    // ============================================
    // Reflections Endpoints
    // ============================================

    /**
     * POST /api/social/reflections - Create a new reflection
     */
    @PostMapping("/reflections")
    public ResponseEntity<ReflectionResponse> createReflection(
            @Valid @RequestBody CreateReflectionRequest request) {
        User currentUser = getCurrentUser();
        ReflectionResponse reflection = socialService.createReflection(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(reflection);
    }

    /**
     * GET /api/social/reflections/{id} - Get a single reflection by ID
     */
    @GetMapping("/reflections/{id}")
    public ResponseEntity<ReflectionResponse> getReflection(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        ReflectionResponse reflection = socialService.getReflectionById(id, currentUser.getId());
        return ResponseEntity.ok(reflection);
    }

    /**
     * DELETE /api/social/reflections/{id} - Delete a reflection
     */
    @DeleteMapping("/reflections/{id}")
    public ResponseEntity<Void> deleteReflection(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        socialService.deleteReflection(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/social/reflections/{id}/privacy - Update reflection privacy
     */
    @PatchMapping("/reflections/{id}/privacy")
    public ResponseEntity<ReflectionResponse> updateReflectionPrivacy(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        User currentUser = getCurrentUser();
        boolean visibleToFollowersOnly = body.getOrDefault("visibleToFollowersOnly", false);
        ReflectionResponse reflection = socialService.updateReflectionPrivacy(id, currentUser.getId(), visibleToFollowersOnly);
        return ResponseEntity.ok(reflection);
    }

    /**
     * GET /api/social/reflections/following - Reflections from followed users
     */
    @GetMapping("/reflections/following")
    public ResponseEntity<Page<ReflectionResponse>> getFollowingReflections(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "relevant") String sort) {
        User currentUser = getCurrentUser();
        Page<ReflectionResponse> reflections = socialService.getFollowingReflections(currentUser.getId(), page, size, sort);
        return ResponseEntity.ok(reflections);
    }

    /**
     * GET /api/social/reflections/everyone - Public reflections from everyone
     */
    @GetMapping("/reflections/everyone")
    public ResponseEntity<Page<ReflectionResponse>> getEveryoneReflections(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "relevant") String sort) {
        User currentUser = getCurrentUser();
        Page<ReflectionResponse> reflections = socialService.getEveryoneReflections(currentUser.getId(), page, size, sort);
        return ResponseEntity.ok(reflections);
    }

    /**
     * GET /api/social/reflections/user/{userId} - Get reflections by a specific user
     */
    @GetMapping("/reflections/user/{userId}")
    public ResponseEntity<Page<ReflectionResponse>> getUserReflections(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<ReflectionResponse> reflections = socialService.getUserReflections(userId, currentUser.getId(), page, size);
        return ResponseEntity.ok(reflections);
    }

    /**
     * GET /api/social/reflections/search - Search reflections by content, book, author, or user
     */
    @GetMapping("/reflections/search")
    public ResponseEntity<Page<ReflectionResponse>> searchReflections(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<ReflectionResponse> reflections = socialService.searchReflections(query, currentUser.getId(), page, size);
        return ResponseEntity.ok(reflections);
    }

    // ============================================
    // Reflection Like / Comment / Save (LinkedIn-style)
    // ============================================

    /**
     * POST /api/social/reflections/{id}/like - Toggle like on a reflection
     */
    @PostMapping("/reflections/{id}/like")
    public ResponseEntity<ReflectionResponse> toggleLikeReflection(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        ReflectionResponse reflection = socialService.toggleLikeReflection(id, currentUser.getId());
        return ResponseEntity.ok(reflection);
    }

    /**
     * POST /api/social/reflections/{id}/comments - Add a comment (supports replies via parentId)
     */
    @PostMapping("/reflections/{id}/comments")
    public ResponseEntity<ReflectionResponse.CommentResponse> addReflectionComment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User currentUser = getCurrentUser();
        String content = body.get("content") != null ? body.get("content").toString() : null;
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Long parentId = null;
        if (body.get("parentId") != null) {
            parentId = Long.valueOf(body.get("parentId").toString());
        }
        ReflectionResponse.CommentResponse comment = socialService.addReflectionComment(id, currentUser.getId(), content, parentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    /**
     * GET /api/social/reflections/{id}/comments - Get paginated top-level comments
     */
    @GetMapping("/reflections/{id}/comments")
    public ResponseEntity<Page<ReflectionResponse.CommentResponse>> getReflectionComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<ReflectionResponse.CommentResponse> comments = socialService.getReflectionComments(id, currentUser.getId(), page, size);
        return ResponseEntity.ok(comments);
    }

    /**
     * GET /api/social/reflections/comments/{commentId}/replies - Get replies for a comment
     */
    @GetMapping("/reflections/comments/{commentId}/replies")
    public ResponseEntity<java.util.List<ReflectionResponse.CommentResponse>> getReflectionCommentReplies(
            @PathVariable Long commentId) {
        User currentUser = getCurrentUser();
        java.util.List<ReflectionResponse.CommentResponse> replies = socialService.getReflectionCommentReplies(commentId, currentUser.getId());
        return ResponseEntity.ok(replies);
    }

    /**
     * DELETE /api/social/reflections/comments/{commentId} - Delete a comment
     */
    @DeleteMapping("/reflections/comments/{commentId}")
    public ResponseEntity<Void> deleteReflectionComment(@PathVariable Long commentId) {
        User currentUser = getCurrentUser();
        socialService.deleteReflectionComment(commentId, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/social/reflections/{id}/save - Toggle save/bookmark
     */
    @PostMapping("/reflections/{id}/save")
    public ResponseEntity<ReflectionResponse> toggleSaveReflection(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        ReflectionResponse reflection = socialService.toggleSaveReflection(id, currentUser.getId());
        return ResponseEntity.ok(reflection);
    }

    /**
     * GET /api/social/reflections/saved - Get saved/bookmarked reflections
     */
    @GetMapping("/reflections/saved")
    public ResponseEntity<Page<ReflectionResponse>> getSavedReflections(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<ReflectionResponse> reflections = socialService.getSavedReflections(currentUser.getId(), page, size);
        return ResponseEntity.ok(reflections);
    }
}
