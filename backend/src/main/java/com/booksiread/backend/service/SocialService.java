package com.booksiread.backend.service;

import com.booksiread.backend.dto.*;
import com.booksiread.backend.entity.*;
import com.booksiread.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * SocialService - Handles all social network features
 * - Follow/Unfollow (with Instagram-like private account logic)
 * - Follow requests for private accounts
 * - User discovery and search
 * - Profile management
 * - Activity feed
 */
@Service
@Transactional
public class SocialService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserFollowRepository userFollowRepository;

    @Autowired
    private FollowRequestRepository followRequestRepository;

    @Autowired
    private UserActivityRepository userActivityRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookReviewRepository bookReviewRepository;

    @Autowired
    private ReadingListRepository readingListRepository;

    @Autowired
    private ReflectionRepository reflectionRepository;

    @Autowired
    private ReflectionLikeRepository reflectionLikeRepository;

    @Autowired
    private ReflectionCommentRepository reflectionCommentRepository;

    @Autowired
    private SavedReflectionRepository savedReflectionRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private FeedRankingService feedRankingService;

    // ============================================
    // Profile Management
    // ============================================

    /**
     * Get user profile by username
     */
    public UserProfileResponse getProfile(String username, Long viewerId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToProfileResponse(user, viewerId);
    }

    /**
     * Get user profile by ID
     */
    public UserProfileResponse getProfileById(Long userId, Long viewerId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToProfileResponse(user, viewerId);
    }

    /**
     * Update user profile
     */
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Handle username change
        if (request.getUsername() != null && !request.getUsername().isBlank()
                && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username is already taken");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }
        if (request.getIsPublic() != null) {
            user.setIsPublic(request.getIsPublic());
        }
        if (request.getFavoriteGenres() != null) {
            user.setFavoriteGenres(request.getFavoriteGenres());
        }

        User savedUser = userRepository.save(user);
        return mapToProfileResponse(savedUser, userId);
    }

    // ============================================
    // Follow System (Instagram-like)
    // ============================================

    /**
     * Follow a user or send a follow request (for private accounts)
     * Returns: "followed", "requested", or "already_following"
     */
    public String followUser(Long followerId, Long targetId) {
        if (followerId.equals(targetId)) {
            throw new RuntimeException("Cannot follow yourself");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("User to follow not found"));

        // Check if already following
        if (userFollowRepository.existsByFollowerIdAndFollowingId(followerId, targetId)) {
            return "already_following";
        }

        // Check if there's a pending request
        if (followRequestRepository.existsByRequesterIdAndTargetIdAndStatus(
                followerId, targetId, FollowRequest.RequestStatus.PENDING)) {
            return "already_requested";
        }

        // If target is public, follow directly
        if (target.getIsPublic()) {
            createFollowRelationship(follower, target);
            notificationService.notifyFollow(follower, target);
            return "followed";
        } else {
            // If target is private, create a follow request
            FollowRequest request = new FollowRequest(follower, target);
            FollowRequest savedRequest = followRequestRepository.save(request);
            notificationService.notifyFollowRequest(follower, target, savedRequest.getId());
            return "requested";
        }
    }

    /**
     * Unfollow a user
     */
    public void unfollowUser(Long followerId, Long targetId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("User to unfollow not found"));

        if (userFollowRepository.existsByFollowerIdAndFollowingId(followerId, targetId)) {
            userFollowRepository.deleteByFollowerIdAndFollowingId(followerId, targetId);
            
            // Update counts
            target.setFollowersCount(Math.max(0, target.getFollowersCount() - 1));
            follower.setFollowingCount(Math.max(0, follower.getFollowingCount() - 1));
            userRepository.save(target);
            userRepository.save(follower);
        }

        // Also cancel any pending request
        followRequestRepository.deleteByRequesterIdAndTargetId(followerId, targetId);
    }

    /**
     * Cancel a pending follow request
     */
    public void cancelFollowRequest(Long requesterId, Long targetId) {
        followRequestRepository.deleteByRequesterIdAndTargetId(requesterId, targetId);
    }

    /**
     * Get pending follow requests for a user (for private accounts)
     */
    public Page<FollowRequestResponse> getPendingRequests(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FollowRequest> requests = followRequestRepository.findPendingRequestsForUser(userId, pageable);
        return requests.map(this::mapToFollowRequestResponse);
    }

    /**
     * Get count of pending follow requests
     */
    public long getPendingRequestsCount(Long userId) {
        return followRequestRepository.countByTargetIdAndStatus(userId, FollowRequest.RequestStatus.PENDING);
    }

    /**
     * Approve a follow request
     */
    public void approveFollowRequest(Long requestId, Long targetUserId) {
        FollowRequest request = followRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Follow request not found"));

        // Verify the target user is the one approving
        if (!request.getTarget().getId().equals(targetUserId)) {
            throw new RuntimeException("Not authorized to approve this request");
        }

        // Create the follow relationship
        createFollowRelationship(request.getRequester(), request.getTarget());

        // Update request status
        request.setStatus(FollowRequest.RequestStatus.APPROVED);
        request.setRespondedAt(LocalDateTime.now());
        followRequestRepository.save(request);

        // Notify the requester that their request was accepted
        notificationService.notifyFollowAccepted(request.getTarget(), request.getRequester());
    }

    /**
     * Reject a follow request
     */
    public void rejectFollowRequest(Long requestId, Long targetUserId) {
        FollowRequest request = followRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Follow request not found"));

        // Verify the target user is the one rejecting
        if (!request.getTarget().getId().equals(targetUserId)) {
            throw new RuntimeException("Not authorized to reject this request");
        }

        request.setStatus(FollowRequest.RequestStatus.REJECTED);
        request.setRespondedAt(LocalDateTime.now());
        followRequestRepository.save(request);
    }

    /**
     * Get followers of a user
     */
    public Page<UserCardResponse> getFollowers(Long userId, Long viewerId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check privacy - only show followers if public or viewer is following
        if (!user.getIsPublic() && !userId.equals(viewerId)) {
            boolean isFollowing = userFollowRepository.existsByFollowerIdAndFollowingId(viewerId, userId);
            if (!isFollowing) {
                throw new RuntimeException("This account is private");
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<User> followers = userFollowRepository.findFollowersByUserId(userId, pageable);
        return followers.map(u -> mapToUserCard(u, viewerId));
    }

    /**
     * Get users that a user is following
     */
    public Page<UserCardResponse> getFollowing(Long userId, Long viewerId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check privacy
        if (!user.getIsPublic() && !userId.equals(viewerId)) {
            boolean isFollowing = userFollowRepository.existsByFollowerIdAndFollowingId(viewerId, userId);
            if (!isFollowing) {
                throw new RuntimeException("This account is private");
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<User> following = userFollowRepository.findFollowingByUserId(userId, pageable);
        return following.map(u -> mapToUserCard(u, viewerId));
    }

    // ============================================
    // User Discovery & Search
    // ============================================

    /**
     * Search users by username or display name
     */
    public Page<UserCardResponse> searchUsers(String query, Long viewerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userRepository.searchUsers(query, pageable);
        return users.map(u -> mapToUserCard(u, viewerId));
    }

    /**
     * Get suggested users to follow
     */
    public Page<UserCardResponse> getSuggestedUsers(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userRepository.findSuggestedUsers(userId, pageable);
        return users.map(u -> mapToUserCard(u, userId));
    }

    /**
     * Discover public users
     */
    public Page<UserCardResponse> discoverUsers(Long viewerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userRepository.findPublicUsers(pageable);
        return users.map(u -> mapToUserCard(u, viewerId));
    }

    /**
     * Get users with similar interests.
     * Matches on: shared favorite genres, common authors, and common book titles.
     */
    public Page<UserCardResponse> getSimilarUsers(Long userId, int page, int size) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Collect the current user's interests
        List<String> myGenres = currentUser.getFavoriteGenres() != null
                ? currentUser.getFavoriteGenres().stream().map(String::toLowerCase).toList()
                : List.of();

        List<Book> myBooks = bookRepository.findByUser(currentUser);
        Set<String> myAuthors = myBooks.stream()
                .map(b -> b.getAuthor().toLowerCase().trim())
                .collect(Collectors.toSet());
        Set<String> myTitles = myBooks.stream()
                .map(b -> b.getTitle().toLowerCase().trim())
                .collect(Collectors.toSet());

        // Use genre-based repo query if genres exist, else fall back to all other public users
        // Include already-followed users — this section is about shared taste, not follow suggestions
        Pageable pageable = PageRequest.of(page, size);
        Page<User> candidates;
        if (!myGenres.isEmpty()) {
            candidates = userRepository.findAllUsersWithSharedGenres(userId, myGenres, pageable);
        } else {
            // Fall back to users who share authors or books (all public users except self)
            candidates = userRepository.findAllOtherPublicUsers(userId, pageable);
        }

        return candidates.map(u -> {
            UserCardResponse card = mapToUserCard(u, userId);

            // Compute shared genres
            List<String> userGenres = u.getFavoriteGenres() != null ? u.getFavoriteGenres() : List.of();
            List<String> shared = userGenres.stream()
                    .filter(g -> myGenres.contains(g.toLowerCase()))
                    .toList();
            card.setSharedGenres(shared);

            // Compute shared authors
            List<Book> theirBooks = bookRepository.findByUser(u).stream()
                    .filter(b -> b.getIsPublic() == null || b.getIsPublic())
                    .toList();
            List<String> sharedAuthors = theirBooks.stream()
                    .map(b -> b.getAuthor().trim())
                    .distinct()
                    .filter(a -> myAuthors.contains(a.toLowerCase()))
                    .toList();
            card.setSharedAuthors(sharedAuthors);

            // Compute common books count
            long commonCount = theirBooks.stream()
                    .filter(b -> myTitles.contains(b.getTitle().toLowerCase().trim()))
                    .count();
            card.setCommonBooksCount((int) commonCount);

            return card;
        });
    }

    // ============================================
    // Activity Feed
    // ============================================

    /**
     * Get activity feed for a user (activities from followed users)
     */
    public Page<ActivityResponse> getFeed(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<Long> followingIds = userFollowRepository.findFollowingIdsByUserId(userId);
        
        if (followingIds.isEmpty()) {
            // If not following anyone, show public activities
            Page<UserActivity> activities = userActivityRepository.findPublicActivities(pageable);
            return activities.map(a -> mapToActivityResponse(a, userId));
        }
        
        Page<UserActivity> activities = userActivityRepository.findFeedActivities(followingIds, pageable);
        return activities.map(a -> mapToActivityResponse(a, userId));
    }

    /**
     * Get activities for a specific user's profile
     */
    public Page<ActivityResponse> getUserActivities(Long userId, Long viewerId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check privacy
        if (!user.getIsPublic() && !userId.equals(viewerId)) {
            boolean isFollowing = userFollowRepository.existsByFollowerIdAndFollowingId(viewerId, userId);
            if (!isFollowing) {
                throw new RuntimeException("This account is private");
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<UserActivity> activities = userActivityRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return activities.map(a -> mapToActivityResponse(a, viewerId));
    }

    /**
     * Record a new activity
     */
    public void recordActivity(Long userId, UserActivity.ActivityType type, Long bookId, Long targetUserId) {
        recordActivity(userId, type, bookId, targetUserId, null);
    }

    /**
     * Record a new activity with optional metadata
     */
    public void recordActivity(Long userId, UserActivity.ActivityType type, Long bookId, Long targetUserId, String metadata) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserActivity activity = new UserActivity(user, type);
        
        if (bookId != null) {
            bookRepository.findById(bookId).ifPresent(activity::setBook);
        }
        if (targetUserId != null) {
            userRepository.findById(targetUserId).ifPresent(activity::setTargetUser);
        }
        if (metadata != null) {
            activity.setMetadata(metadata);
        }

        userActivityRepository.save(activity);
    }

    // ============================================
    // Reflections
    // ============================================

    /**
     * Create a new reflection.
     */
    public ReflectionResponse createReflection(Long userId, CreateReflectionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Reflection reflection = new Reflection(user, request.getContent());
        reflection.setVisibleToFollowersOnly(
                request.getVisibleToFollowersOnly() != null ? request.getVisibleToFollowersOnly() : false);

        if (request.getBookId() != null) {
            bookRepository.findById(request.getBookId()).ifPresent(reflection::setBook);
        }

        reflection = reflectionRepository.save(reflection);
        return mapToReflectionResponse(reflection, userId);
    }

    /**
     * Delete a reflection (owner only). Cascades deletion to likes, comments, saves.
     */
    public void deleteReflection(Long reflectionId, Long userId) {
        Reflection reflection = reflectionRepository.findById(reflectionId)
                .orElseThrow(() -> new RuntimeException("Reflection not found"));
        if (!reflection.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this reflection");
        }
        // Cascade delete related entities
        reflectionLikeRepository.deleteByReflectionId(reflectionId);
        reflectionCommentRepository.deleteByReflectionId(reflectionId);
        savedReflectionRepository.deleteByReflectionId(reflectionId);
        reflectionRepository.delete(reflection);
    }

    /**
     * Update the privacy of a reflection (owner only).
     */
    public ReflectionResponse updateReflectionPrivacy(Long reflectionId, Long userId, boolean visibleToFollowersOnly) {
        Reflection reflection = reflectionRepository.findById(reflectionId)
                .orElseThrow(() -> new RuntimeException("Reflection not found"));
        if (!reflection.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }
        reflection.setVisibleToFollowersOnly(visibleToFollowersOnly);
        reflection = reflectionRepository.save(reflection);
        return mapToReflectionResponse(reflection, userId);
    }

    /**
     * Following feed: reflections from people the user follows.
     * @param sort "relevant" for ranked, "recent" for chronological
     */
    public Page<ReflectionResponse> getFollowingReflections(Long userId, int page, int size, String sort) {
        if ("relevant".equalsIgnoreCase(sort)) {
            return feedRankingService.getRankedFollowingReflections(userId, page, size)
                    .map(r -> mapToReflectionResponse(r, userId));
        }
        List<Long> followingIds = userFollowRepository.findFollowingIdsByUserId(userId);
        Pageable pageable = PageRequest.of(page, size);
        if (followingIds.isEmpty()) {
            return Page.empty(pageable);
        }
        Page<Reflection> reflections = reflectionRepository.findFollowingFeed(followingIds, pageable);
        return reflections.map(r -> mapToReflectionResponse(r, userId));
    }

    /** Backward-compatible overload (defaults to relevant) */
    public Page<ReflectionResponse> getFollowingReflections(Long userId, int page, int size) {
        return getFollowingReflections(userId, page, size, "relevant");
    }

    /**
     * Everyone feed: public reflections + all from followed users.
     * @param sort "relevant" for ranked, "recent" for chronological
     */
    public Page<ReflectionResponse> getEveryoneReflections(Long userId, int page, int size, String sort) {
        if ("relevant".equalsIgnoreCase(sort)) {
            return feedRankingService.getRankedEveryoneReflections(userId, page, size)
                    .map(r -> mapToReflectionResponse(r, userId));
        }
        List<Long> followingIds = userFollowRepository.findFollowingIdsByUserId(userId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Reflection> reflections;
        if (followingIds.isEmpty()) {
            reflections = reflectionRepository.findPublicReflections(pageable);
        } else {
            reflections = reflectionRepository.findEveryoneFeed(followingIds, pageable);
        }
        return reflections.map(r -> mapToReflectionResponse(r, userId));
    }

    /** Backward-compatible overload (defaults to relevant) */
    public Page<ReflectionResponse> getEveryoneReflections(Long userId, int page, int size) {
        return getEveryoneReflections(userId, page, size, "relevant");
    }

    /**
     * Get a single reflection by ID.
     */
    public ReflectionResponse getReflectionById(Long reflectionId, Long viewerId) {
        Reflection reflection = reflectionRepository.findById(reflectionId)
                .orElseThrow(() -> new RuntimeException("Reflection not found"));
        return mapToReflectionResponse(reflection, viewerId);
    }

    /**
     * Get reflections by a specific user.
     */
    public Page<ReflectionResponse> getUserReflections(Long userId, Long viewerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Reflection> reflections = reflectionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return reflections.map(r -> mapToReflectionResponse(r, viewerId));
    }

    /**
     * Search reflections by content, book title, author, or user name
     */
    @Transactional(readOnly = true)
    public Page<ReflectionResponse> searchReflections(String query, Long viewerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Reflection> reflections = reflectionRepository.searchReflections(query.trim(), pageable);
        return reflections.map(r -> mapToReflectionResponse(r, viewerId));
    }

    private ReflectionResponse mapToReflectionResponse(Reflection reflection, Long viewerId) {
        ReflectionResponse response = new ReflectionResponse();
        response.setId(reflection.getId());
        response.setContent(reflection.getContent());
        response.setUser(mapToUserCard(reflection.getUser(), viewerId));
        response.setVisibleToFollowersOnly(reflection.getVisibleToFollowersOnly());
        response.setLikesCount(reflection.getLikesCount());
        response.setCommentsCount(reflection.getCommentsCount());
        response.setSavesCount(reflection.getSavesCount());
        response.setCreatedAt(reflection.getCreatedAt());

        // Has the viewer liked / saved this reflection?
        if (viewerId != null) {
            response.setHasLiked(reflectionLikeRepository.existsByReflectionIdAndUserId(reflection.getId(), viewerId));
            response.setHasSaved(savedReflectionRepository.existsByUserIdAndReflectionId(viewerId, reflection.getId()));
        } else {
            response.setHasLiked(false);
            response.setHasSaved(false);
        }

        if (reflection.getBook() != null) {
            ReflectionResponse.BookSummary bookSummary = new ReflectionResponse.BookSummary();
            bookSummary.setId(reflection.getBook().getId());
            bookSummary.setTitle(reflection.getBook().getTitle());
            bookSummary.setAuthor(reflection.getBook().getAuthor());
            response.setBook(bookSummary);
        }

        // Load 3 most recent top-level comments with replies
        Page<ReflectionComment> recentPage = reflectionCommentRepository
                .findByReflectionIdAndParentCommentIsNullOrderByCreatedAtAsc(reflection.getId(), PageRequest.of(0, 3));
        List<ReflectionResponse.CommentResponse> recentComments = recentPage.getContent().stream()
                .map(c -> mapToCommentResponseWithReplies(c, viewerId))
                .collect(Collectors.toList());
        response.setRecentComments(recentComments);

        return response;
    }

    private ReflectionResponse.CommentResponse mapToCommentResponse(ReflectionComment comment, Long viewerId) {
        ReflectionResponse.CommentResponse resp = new ReflectionResponse.CommentResponse();
        resp.setId(comment.getId());
        resp.setContent(comment.getContent());
        resp.setUser(mapToUserCard(comment.getUser(), viewerId));
        resp.setCreatedAt(comment.getCreatedAt());
        resp.setParentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
        resp.setReplyCount(comment.getReplies() != null ? comment.getReplies().size() : 0);
        return resp;
    }

    private ReflectionResponse.CommentResponse mapToCommentResponseWithReplies(ReflectionComment comment, Long viewerId) {
        ReflectionResponse.CommentResponse resp = mapToCommentResponse(comment, viewerId);
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<ReflectionResponse.CommentResponse> replies = comment.getReplies().stream()
                    .map(r -> mapToCommentResponse(r, viewerId))
                    .collect(Collectors.toList());
            resp.setReplies(replies);
        }
        return resp;
    }

    // ============================================
    // Reflection Like (LinkedIn-style)
    // ============================================

    /**
     * Toggle like on a reflection. Returns updated reflection.
     */
    public ReflectionResponse toggleLikeReflection(Long reflectionId, Long userId) {
        Reflection reflection = reflectionRepository.findById(reflectionId)
                .orElseThrow(() -> new RuntimeException("Reflection not found"));

        Optional<ReflectionLike> existing = reflectionLikeRepository.findByReflectionIdAndUserId(reflectionId, userId);
        if (existing.isPresent()) {
            // Unlike
            reflectionLikeRepository.delete(existing.get());
            reflection.setLikesCount(Math.max(0, reflection.getLikesCount() - 1));
        } else {
            // Like
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            reflectionLikeRepository.save(new ReflectionLike(reflection, user));
            reflection.setLikesCount(reflection.getLikesCount() + 1);
        }
        reflection = reflectionRepository.save(reflection);
        return mapToReflectionResponse(reflection, userId);
    }

    // ============================================
    // Reflection Comment (LinkedIn-style)
    // ============================================

    /**
     * Add a comment to a reflection (supports threaded replies via parentId).
     */
    public ReflectionResponse.CommentResponse addReflectionComment(Long reflectionId, Long userId, String content, Long parentId) {
        Reflection reflection = reflectionRepository.findById(reflectionId)
                .orElseThrow(() -> new RuntimeException("Reflection not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ReflectionComment comment = new ReflectionComment(reflection, user, content);

        // Handle reply to parent comment
        if (parentId != null) {
            ReflectionComment parent = reflectionCommentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParentComment(parent);
        }

        ReflectionComment savedComment = reflectionCommentRepository.save(comment);

        // Update comments count
        reflection.setCommentsCount(reflection.getCommentsCount() + 1);
        reflectionRepository.save(reflection);

        // Notifications
        if (parentId != null) {
            ReflectionComment parent = savedComment.getParentComment();
            notificationService.notifyReflectionCommentReply(user, parent.getUser(), reflection.getBook(), reflectionId, savedComment.getId());
        } else {
            notificationService.notifyReflectionComment(user, reflection.getUser(), reflection.getBook(), reflectionId);
        }

        // Process @mentions
        notificationService.processReflectionMentions(user, content, reflection.getBook(), reflectionId, savedComment.getId());

        return mapToCommentResponse(savedComment, userId);
    }

    /** Backward-compatible overload */
    public ReflectionResponse.CommentResponse addReflectionComment(Long reflectionId, Long userId, String content) {
        return addReflectionComment(reflectionId, userId, content, null);
    }

    /**
     * Get paginated top-level comments for a reflection (with replies loaded).
     */
    public Page<ReflectionResponse.CommentResponse> getReflectionComments(Long reflectionId, Long viewerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ReflectionComment> comments = reflectionCommentRepository
                .findByReflectionIdAndParentCommentIsNullOrderByCreatedAtAsc(reflectionId, pageable);
        return comments.map(c -> mapToCommentResponseWithReplies(c, viewerId));
    }

    /**
     * Get replies for a specific comment.
     */
    public List<ReflectionResponse.CommentResponse> getReflectionCommentReplies(Long commentId, Long viewerId) {
        List<ReflectionComment> replies = reflectionCommentRepository.findByParentCommentIdOrderByCreatedAtAsc(commentId);
        return replies.stream().map(c -> mapToCommentResponse(c, viewerId)).collect(Collectors.toList());
    }

    /**
     * Delete a comment (owner or reflection owner).
     */
    public void deleteReflectionComment(Long commentId, Long userId) {
        ReflectionComment comment = reflectionCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        boolean isCommentOwner = comment.getUser().getId().equals(userId);
        boolean isReflectionOwner = comment.getReflection().getUser().getId().equals(userId);

        if (!isCommentOwner && !isReflectionOwner) {
            throw new RuntimeException("Not authorized to delete this comment");
        }
        reflectionCommentRepository.delete(comment);

        // Update comments count
        Reflection reflection = comment.getReflection();
        reflection.setCommentsCount(Math.max(0, reflection.getCommentsCount() - 1));
        reflectionRepository.save(reflection);
    }

    // ============================================
    // Reflection Save / Bookmark (LinkedIn-style)
    // ============================================

    /**
     * Toggle save/bookmark on a reflection. Returns updated reflection.
     */
    public ReflectionResponse toggleSaveReflection(Long reflectionId, Long userId) {
        Reflection reflection = reflectionRepository.findById(reflectionId)
                .orElseThrow(() -> new RuntimeException("Reflection not found"));

        Optional<SavedReflection> existing = savedReflectionRepository.findByUserIdAndReflectionId(userId, reflectionId);
        if (existing.isPresent()) {
            // Unsave
            savedReflectionRepository.delete(existing.get());
            reflection.setSavesCount(Math.max(0, reflection.getSavesCount() - 1));
        } else {
            // Save
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            savedReflectionRepository.save(new SavedReflection(user, reflection));
            reflection.setSavesCount(reflection.getSavesCount() + 1);
        }
        reflection = reflectionRepository.save(reflection);
        return mapToReflectionResponse(reflection, userId);
    }

    /**
     * Get all reflections saved/bookmarked by a user (paginated).
     */
    @Transactional(readOnly = true)
    public Page<ReflectionResponse> getSavedReflections(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return savedReflectionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(saved -> {
                    ReflectionResponse response = mapToReflectionResponse(saved.getReflection(), userId);
                    response.setSavedAt(saved.getCreatedAt());
                    return response;
                });
    }

    // ============================================
    // Helper Methods
    // ============================================

    private void createFollowRelationship(User follower, User target) {
        UserFollow follow = new UserFollow(follower, target);
        userFollowRepository.save(follow);

        // Update counts
        target.setFollowersCount(target.getFollowersCount() + 1);
        follower.setFollowingCount(follower.getFollowingCount() + 1);
        userRepository.save(target);
        userRepository.save(follower);

        // Record activity
        UserActivity activity = new UserActivity(follower, UserActivity.ActivityType.FOLLOWED_USER, target);
        userActivityRepository.save(activity);
    }

    /**
     * Get a user's books (respects privacy settings)
     */
    public List<BookResponse> getUserBooks(String username, Long viewerId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isOwnProfile = user.getId().equals(viewerId);
        boolean isFollowing = userFollowRepository.existsByFollowerIdAndFollowingId(viewerId, user.getId());

        // Privacy check: private accounts only show books to self or followers
        if (!user.getIsPublic() && !isOwnProfile && !isFollowing) {
            throw new RuntimeException("This account is private");
        }

        return bookRepository.findByUser(user).stream()
                .filter(book -> isOwnProfile || book.getIsPublic() == null || book.getIsPublic())
                .map(BookResponse::fromEntity)
                .toList();
    }

    private UserProfileResponse mapToProfileResponse(User user, Long viewerId) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setDisplayName(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername());
        response.setBio(user.getBio());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        response.setIsPublic(user.getIsPublic());
        response.setFollowersCount(user.getFollowersCount());
        response.setFollowingCount(user.getFollowingCount());
        boolean isOwn = user.getId().equals(viewerId);
        response.setBooksCount((int) (isOwn ? bookRepository.countByUserId(user.getId()) : bookRepository.countByUserIdAndIsPublicTrue(user.getId())));
        response.setReviewsCount((int) bookReviewRepository.countByUserId(user.getId()));
        response.setListsCount((int) readingListRepository.countByUserId(user.getId()));
        response.setReflectionsCount((int) reflectionRepository.countByUserId(user.getId()));
        response.setFavoriteGenres(user.getFavoriteGenres());
        response.setCreatedAt(user.getCreatedAt());

        // Relationship status
        response.setIsOwnProfile(user.getId().equals(viewerId));
        
        if (viewerId != null && !user.getId().equals(viewerId)) {
            response.setIsFollowing(userFollowRepository.existsByFollowerIdAndFollowingId(viewerId, user.getId()));
            response.setIsFollowedBy(userFollowRepository.existsByFollowerIdAndFollowingId(user.getId(), viewerId));
            response.setHasPendingRequest(followRequestRepository.existsByRequesterIdAndTargetIdAndStatus(
                    viewerId, user.getId(), FollowRequest.RequestStatus.PENDING));
        } else {
            response.setIsFollowing(false);
            response.setIsFollowedBy(false);
            response.setHasPendingRequest(false);
        }

        return response;
    }

    private UserCardResponse mapToUserCard(User user, Long viewerId) {
        UserCardResponse card = new UserCardResponse();
        card.setId(user.getId());
        card.setUsername(user.getUsername());
        card.setDisplayName(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername());
        card.setProfilePictureUrl(user.getProfilePictureUrl());
        card.setBio(user.getBio());
        card.setIsPublic(user.getIsPublic());
        card.setFollowersCount(user.getFollowersCount());
        boolean isOwn = viewerId != null && user.getId().equals(viewerId);
        card.setBooksCount((int) (isOwn ? bookRepository.countByUserId(user.getId()) : bookRepository.countByUserIdAndIsPublicTrue(user.getId())));

        if (viewerId != null && !user.getId().equals(viewerId)) {
            card.setIsFollowing(userFollowRepository.existsByFollowerIdAndFollowingId(viewerId, user.getId()));
            card.setHasPendingRequest(followRequestRepository.existsByRequesterIdAndTargetIdAndStatus(
                    viewerId, user.getId(), FollowRequest.RequestStatus.PENDING));
        } else {
            card.setIsFollowing(false);
            card.setHasPendingRequest(false);
        }

        return card;
    }

    private FollowRequestResponse mapToFollowRequestResponse(FollowRequest request) {
        FollowRequestResponse response = new FollowRequestResponse();
        response.setRequestId(request.getId());
        response.setRequester(mapToUserCard(request.getRequester(), null));
        response.setStatus(request.getStatus().name());
        response.setCreatedAt(request.getCreatedAt());
        return response;
    }

    private ActivityResponse mapToActivityResponse(UserActivity activity, Long viewerId) {
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setActivityType(activity.getActivityType().name());
        response.setUser(mapToUserCard(activity.getUser(), viewerId));
        response.setMetadata(activity.getMetadata());
        response.setCreatedAt(activity.getCreatedAt());

        if (activity.getBook() != null) {
            ActivityResponse.BookSummary bookSummary = new ActivityResponse.BookSummary();
            bookSummary.setId(activity.getBook().getId());
            bookSummary.setTitle(activity.getBook().getTitle());
            bookSummary.setAuthor(activity.getBook().getAuthor());
            bookSummary.setRating(activity.getBook().getRating());
            bookSummary.setStatus(activity.getBook().getStatus().name());
            response.setBook(bookSummary);
        }

        if (activity.getTargetUser() != null) {
            response.setTargetUser(mapToUserCard(activity.getTargetUser(), viewerId));
        }

        return response;
    }
}
