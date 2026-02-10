package com.booksiread.backend.controller;

import com.booksiread.backend.dto.CreateReviewRequest;
import com.booksiread.backend.dto.ReviewResponse;
import com.booksiread.backend.entity.User;
import com.booksiread.backend.security.CustomUserDetailsService;
import com.booksiread.backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * ReviewController - REST API for book reviews, likes, and comments
 * Base URL: /api/reviews
 */
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final CustomUserDetailsService userDetailsService;

    @Autowired
    public ReviewController(ReviewService reviewService, CustomUserDetailsService userDetailsService) {
        this.reviewService = reviewService;
        this.userDetailsService = userDetailsService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userDetailsService.loadUserEntityByUsername(username);
    }

    // ============================================
    // Review CRUD
    // ============================================

    /** POST /api/reviews/book/{bookId} - Create a review */
    @PostMapping("/book/{bookId}")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long bookId,
            @Valid @RequestBody CreateReviewRequest request) {
        User currentUser = getCurrentUser();
        ReviewResponse review = reviewService.createReview(currentUser.getId(), bookId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    /** PUT /api/reviews/{reviewId} - Update a review */
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody CreateReviewRequest request) {
        User currentUser = getCurrentUser();
        ReviewResponse review = reviewService.updateReview(currentUser.getId(), reviewId, request);
        return ResponseEntity.ok(review);
    }

    /** DELETE /api/reviews/{reviewId} - Delete a review */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        User currentUser = getCurrentUser();
        reviewService.deleteReview(currentUser.getId(), reviewId);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/reviews/{reviewId} - Get a single review */
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> getReview(@PathVariable Long reviewId) {
        User currentUser = getCurrentUser();
        ReviewResponse review = reviewService.getReview(reviewId, currentUser.getId());
        return ResponseEntity.ok(review);
    }

    /** GET /api/reviews/book/{bookId} - Get all reviews for a book */
    @GetMapping("/book/{bookId}")
    public ResponseEntity<Page<ReviewResponse>> getBookReviews(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = getCurrentUser();
        Page<ReviewResponse> reviews = reviewService.getBookReviews(bookId, currentUser.getId(), page, size);
        return ResponseEntity.ok(reviews);
    }

    /** GET /api/reviews/user/{userId} - Get all reviews by a user */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<ReviewResponse>> getUserReviews(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = getCurrentUser();
        Page<ReviewResponse> reviews = reviewService.getUserReviews(userId, currentUser.getId(), page, size);
        return ResponseEntity.ok(reviews);
    }

    /** GET /api/reviews/feed - Get reviews from followed users */
    @GetMapping("/feed")
    public ResponseEntity<Page<ReviewResponse>> getFollowingReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "relevant") String sort) {
        User currentUser = getCurrentUser();
        Page<ReviewResponse> reviews = reviewService.getFollowingReviews(currentUser.getId(), page, size, sort);
        return ResponseEntity.ok(reviews);
    }

    // ============================================
    // Likes
    // ============================================

    /** POST /api/reviews/{reviewId}/like - Toggle like */
    @PostMapping("/{reviewId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long reviewId) {
        User currentUser = getCurrentUser();
        boolean liked = reviewService.toggleLike(currentUser.getId(), reviewId);
        int likesCount = reviewService.getLikesCount(reviewId);
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("liked", liked);
        response.put("likesCount", likesCount);
        return ResponseEntity.ok(response);
    }

    // ============================================
    // Save/Bookmark
    // ============================================

    /** POST /api/reviews/{reviewId}/save - Toggle save (bookmark) */
    @PostMapping("/{reviewId}/save")
    public ResponseEntity<Map<String, Object>> toggleSave(@PathVariable Long reviewId) {
        User currentUser = getCurrentUser();
        boolean saved = reviewService.toggleSave(currentUser.getId(), reviewId);
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("saved", saved);
        return ResponseEntity.ok(response);
    }

    /** GET /api/reviews/saved - Get user's saved reviews */
    @GetMapping("/saved")
    public ResponseEntity<Page<ReviewResponse>> getSavedReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<ReviewResponse> reviews = reviewService.getSavedReviews(currentUser.getId(), page, size);
        return ResponseEntity.ok(reviews);
    }

    // ============================================
    // Comments
    // ============================================

    /** POST /api/reviews/{reviewId}/comments - Add a comment (optionally a reply) */
    @PostMapping("/{reviewId}/comments")
    public ResponseEntity<ReviewResponse.CommentResponse> addComment(
            @PathVariable Long reviewId,
            @RequestBody Map<String, Object> body) {
        User currentUser = getCurrentUser();
        String content = (String) body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Long parentId = body.get("parentId") != null ? Long.valueOf(body.get("parentId").toString()) : null;
        ReviewResponse.CommentResponse comment = reviewService.addComment(
                currentUser.getId(), reviewId, content, parentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    /** GET /api/reviews/{reviewId}/comments - Get top-level comments for a review */
    @GetMapping("/{reviewId}/comments")
    public ResponseEntity<Page<ReviewResponse.CommentResponse>> getComments(
            @PathVariable Long reviewId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ReviewResponse.CommentResponse> comments = reviewService.getComments(reviewId, page, size);
        return ResponseEntity.ok(comments);
    }

    /** GET /api/reviews/comments/{commentId}/replies - Get replies for a comment */
    @GetMapping("/comments/{commentId}/replies")
    public ResponseEntity<java.util.List<ReviewResponse.CommentResponse>> getReplies(
            @PathVariable Long commentId) {
        java.util.List<ReviewResponse.CommentResponse> replies = reviewService.getReplies(commentId);
        return ResponseEntity.ok(replies);
    }

    /** DELETE /api/reviews/comments/{commentId} - Delete a comment */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        User currentUser = getCurrentUser();
        reviewService.deleteComment(currentUser.getId(), commentId);
        return ResponseEntity.noContent().build();
    }
}
