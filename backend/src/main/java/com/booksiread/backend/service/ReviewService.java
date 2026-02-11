package com.booksiread.backend.service;

import com.booksiread.backend.dto.CreateReviewRequest;
import com.booksiread.backend.dto.ReviewResponse;
import com.booksiread.backend.entity.*;
import com.booksiread.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ReviewService - Handles book reviews, likes, and comments
 */
@Service
@Transactional
public class ReviewService {

    @Autowired
    private BookReviewRepository reviewRepository;

    @Autowired
    private ReviewCommentRepository commentRepository;

    @Autowired
    private ReviewLikeRepository likeRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserFollowRepository userFollowRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SocialService socialService;

    @Autowired
    private SavedReviewRepository savedReviewRepository;

    @Autowired
    private FeedRankingService feedRankingService;

    // ============================================
    // Reviews
    // ============================================

    /**
     * Create a review for a book
     */
    public ReviewResponse createReview(Long userId, Long bookId, CreateReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        // Check if user already reviewed this book
        if (reviewRepository.existsByUserIdAndBookId(userId, bookId)) {
            throw new RuntimeException("You already reviewed this book");
        }

        BookReview review = new BookReview(user, book, request.getContent(), request.getRating());
        review.setContainsSpoilers(request.getContainsSpoilers() != null ? request.getContainsSpoilers() : false);

        BookReview savedReview = reviewRepository.save(review);

        // Record activity
        try {
            socialService.recordActivity(
                userId, UserActivity.ActivityType.WROTE_REVIEW,
                bookId, null
            );
            // Notify followers
            notificationService.notifyReviewPosted(user, book, savedReview.getId());
        } catch (Exception e) {
            // Don't fail review creation
        }

        return mapToResponse(savedReview, userId);
    }

    /**
     * Update an existing review
     */
    public ReviewResponse updateReview(Long userId, Long reviewId, CreateReviewRequest request) {
        BookReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to edit this review");
        }

        review.setContent(request.getContent());
        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if (request.getContainsSpoilers() != null) {
            review.setContainsSpoilers(request.getContainsSpoilers());
        }

        return mapToResponse(reviewRepository.save(review), userId);
    }

    /**
     * Delete a review
     */
    public void deleteReview(Long userId, Long reviewId) {
        BookReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this review");
        }

        // Delete likes, comments, and saved bookmarks first
        likeRepository.deleteByReviewId(reviewId);
        commentRepository.deleteByReviewId(reviewId);
        savedReviewRepository.deleteByReviewId(reviewId);
        reviewRepository.delete(review);
    }

    /**
     * Get a single review
     */
    @Transactional(readOnly = true)
    public ReviewResponse getReview(Long reviewId, Long viewerId) {
        BookReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        return mapToResponse(review, viewerId);
    }

    /**
     * Get all reviews for a book
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getBookReviews(Long bookId, Long viewerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookReview> reviews = reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId, pageable);
        return reviews.map(r -> mapToResponse(r, viewerId));
    }

    /**
     * Get all reviews by a user
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getUserReviews(Long userId, Long viewerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookReview> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return reviews.map(r -> mapToResponse(r, viewerId));
    }

    /**
     * Get reviews from users the viewer follows (social feed)
     * @param sort "relevant" for ranked feed, "recent" for chronological
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getFollowingReviews(Long viewerId, int page, int size, String sort) {
        if ("relevant".equalsIgnoreCase(sort)) {
            return feedRankingService.getRankedFollowingReviews(viewerId, page, size)
                    .map(r -> mapToResponse(r, viewerId));
        }
        // Default: chronological
        List<Long> followingIds = userFollowRepository.findFollowingIdsByUserId(viewerId);
        if (followingIds.isEmpty()) {
            Pageable pageable = PageRequest.of(page, size);
            return reviewRepository.findPopularReviews(pageable).map(r -> mapToResponse(r, viewerId));
        }
        Pageable pageable = PageRequest.of(page, size);
        return reviewRepository.findReviewsByFollowedUsers(followingIds, pageable)
                .map(r -> mapToResponse(r, viewerId));
    }

    /**
     * Backward-compatible overload (defaults to relevant)
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getFollowingReviews(Long viewerId, int page, int size) {
        return getFollowingReviews(viewerId, page, size, "relevant");
    }

    /**
     * Search reviews by content, book title, author, or reviewer name
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> searchReviews(String query, Long viewerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookReview> reviews = reviewRepository.searchReviews(query.trim(), pageable);
        return reviews.map(r -> mapToResponse(r, viewerId));
    }

    // ============================================
    // Likes
    // ============================================

    /**
     * Toggle like on a review
     */
    public boolean toggleLike(Long userId, Long reviewId) {
        BookReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (likeRepository.existsByReviewIdAndUserId(reviewId, userId)) {
            // Unlike
            ReviewLike like = likeRepository.findByReviewIdAndUserId(reviewId, userId)
                    .orElseThrow(() -> new RuntimeException("Like not found"));
            likeRepository.delete(like);
            review.setLikesCount(Math.max(0, review.getLikesCount() - 1));
            reviewRepository.save(review);
            return false;
        } else {
            // Like
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            ReviewLike like = new ReviewLike(review, user);
            likeRepository.save(like);
            review.setLikesCount(review.getLikesCount() + 1);
            reviewRepository.save(review);

            // Notify review author
            try {
                notificationService.notifyComment(user, review.getUser(), review.getBook(), reviewId);
            } catch (Exception e) {
                // Don't fail
            }
            return true;
        }
    }

    // ============================================
    // Likes Count
    // ============================================

    // ============================================
    // Save/Bookmark
    // ============================================

    /**
     * Toggle save (bookmark) on a review
     */
    public boolean toggleSave(Long userId, Long reviewId) {
        BookReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (savedReviewRepository.existsByUserIdAndReviewId(userId, reviewId)) {
            // Unsave
            SavedReview saved = savedReviewRepository.findByUserIdAndReviewId(userId, reviewId)
                    .orElseThrow(() -> new RuntimeException("Saved review not found"));
            savedReviewRepository.delete(saved);
            return false;
        } else {
            // Save
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            SavedReview saved = new SavedReview(user, review);
            savedReviewRepository.save(saved);
            return true;
        }
    }

    /**
     * Get saved reviews for a user
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getSavedReviews(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return savedReviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(saved -> {
                    ReviewResponse response = mapToResponse(saved.getReview(), userId);
                    response.setSavedAt(saved.getCreatedAt());
                    return response;
                });
    }

    public int getLikesCount(Long reviewId) {
        BookReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        return review.getLikesCount();
    }

    // ============================================
    // Comments
    // ============================================

    /**
     * Add a comment to a review (optionally as a reply to another comment)
     */
    public ReviewResponse.CommentResponse addComment(Long userId, Long reviewId, String content, Long parentId) {
        BookReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ReviewComment comment = new ReviewComment(review, user, content);

        // Handle reply to parent comment
        if (parentId != null) {
            ReviewComment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParentComment(parent);
        }

        ReviewComment savedComment = commentRepository.save(comment);

        // Update comment count
        review.setCommentsCount(review.getCommentsCount() + 1);
        reviewRepository.save(review);

        // Notify review author (for top-level comments)
        try {
            if (parentId == null) {
                notificationService.notifyComment(user, review.getUser(), review.getBook(), reviewId);
            } else {
                // Notify the parent comment author about the reply
                ReviewComment parent = commentRepository.findById(parentId).orElse(null);
                if (parent != null) {
                    notificationService.notifyCommentReply(user, parent.getUser(), review.getBook(), reviewId, savedComment.getId());
                }
            }
            // Process @mentions
            notificationService.processMentions(user, content, review.getBook(), reviewId, savedComment.getId());
        } catch (Exception e) {
            // Don't fail
        }

        return mapCommentToResponse(savedComment);
    }

    /** Backward-compatible overload */
    public ReviewResponse.CommentResponse addComment(Long userId, Long reviewId, String content) {
        return addComment(userId, reviewId, content, null);
    }

    /**
     * Get top-level comments for a review (with replies loaded)
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse.CommentResponse> getComments(Long reviewId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return commentRepository.findByReviewIdAndParentCommentIsNullOrderByCreatedAtAsc(reviewId, pageable)
                .map(this::mapCommentToResponseWithReplies);
    }

    /**
     * Get replies for a specific comment
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse.CommentResponse> getReplies(Long commentId) {
        return commentRepository.findByParentCommentIdOrderByCreatedAtAsc(commentId)
                .stream()
                .map(this::mapCommentToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Delete a comment (own comments only)
     */
    public void deleteComment(Long userId, Long commentId) {
        ReviewComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this comment");
        }

        BookReview review = comment.getReview();
        commentRepository.delete(comment);

        // Update count
        review.setCommentsCount(Math.max(0, review.getCommentsCount() - 1));
        reviewRepository.save(review);
    }

    // ============================================
    // Mappers
    // ============================================

    private ReviewResponse mapToResponse(BookReview review, Long viewerId) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setContent(review.getContent());
        response.setRating(review.getRating());
        response.setContainsSpoilers(review.getContainsSpoilers());
        response.setLikesCount(review.getLikesCount());
        response.setCommentsCount(review.getCommentsCount());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());

        // Is viewer liking this?
        if (viewerId != null) {
            response.setLikedByViewer(likeRepository.existsByReviewIdAndUserId(review.getId(), viewerId));
            response.setSavedByViewer(savedReviewRepository.existsByUserIdAndReviewId(viewerId, review.getId()));
        } else {
            response.setLikedByViewer(false);
            response.setSavedByViewer(false);
        }

        // Author info
        User author = review.getUser();
        response.setAuthorId(author.getId());
        response.setAuthorUsername(author.getUsername());
        response.setAuthorDisplayName(author.getDisplayName() != null ? author.getDisplayName() : author.getUsername());
        response.setAuthorProfilePictureUrl(author.getProfilePictureUrl());

        // Book info
        Book book = review.getBook();
        response.setBookId(book.getId());
        response.setBookTitle(book.getTitle());
        response.setBookAuthor(book.getAuthor());

        // Load recent comments (first 3)
        List<ReviewComment> comments = commentRepository
                .findByReviewIdOrderByCreatedAtAsc(review.getId(), PageRequest.of(0, 3))
                .getContent();
        response.setRecentComments(
            comments.stream().map(this::mapCommentToResponse).collect(Collectors.toList())
        );

        return response;
    }

    private ReviewResponse.CommentResponse mapCommentToResponse(ReviewComment comment) {
        ReviewResponse.CommentResponse response = new ReviewResponse.CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setAuthorId(comment.getUser().getId());
        response.setAuthorUsername(comment.getUser().getUsername());
        response.setAuthorDisplayName(
            comment.getUser().getDisplayName() != null 
                ? comment.getUser().getDisplayName() 
                : comment.getUser().getUsername()
        );
        response.setAuthorProfilePictureUrl(comment.getUser().getProfilePictureUrl());
        response.setCreatedAt(comment.getCreatedAt());
        response.setParentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
        response.setReplyCount(comment.getReplies() != null ? comment.getReplies().size() : 0);
        return response;
    }

    private ReviewResponse.CommentResponse mapCommentToResponseWithReplies(ReviewComment comment) {
        ReviewResponse.CommentResponse response = mapCommentToResponse(comment);
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            response.setReplies(
                comment.getReplies().stream()
                    .map(this::mapCommentToResponse)
                    .collect(Collectors.toList())
            );
            response.setReplyCount(comment.getReplies().size());
        }
        return response;
    }
}
