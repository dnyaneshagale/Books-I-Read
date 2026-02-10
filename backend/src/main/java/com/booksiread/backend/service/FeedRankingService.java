package com.booksiread.backend.service;

import com.booksiread.backend.entity.BookReview;
import com.booksiread.backend.entity.Reflection;
import com.booksiread.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * FeedRankingService — Instagram/LinkedIn-style relevance ranking for feeds.
 *
 * Scoring formula:
 *   score = engagementScore × recencyMultiplier × relationshipBoost
 *
 * Where:
 *   engagementScore = (likes × 3) + (comments × 5) + (saves × 4)
 *   recencyMultiplier = 1 / (1 + hoursAge / HALF_LIFE)^DECAY_POWER
 *   relationshipBoost = 2.0 if author is followed, 1.0 otherwise
 *
 * The algorithm fetches a larger candidate pool from DB (sorted chronologically),
 * scores each item in-memory, and returns a ranked page.
 */
@Service
@Transactional(readOnly = true)
public class FeedRankingService {

    // ----- Tuning constants -----
    private static final double LIKE_WEIGHT = 3.0;
    private static final double COMMENT_WEIGHT = 5.0;
    private static final double SAVE_WEIGHT = 4.0;
    private static final double HALF_LIFE_HOURS = 24.0;  // 50% decay every 24 hours
    private static final double DECAY_POWER = 1.5;
    private static final double FOLLOWING_BOOST = 2.0;
    private static final double BASE_SCORE = 1.0;  // Minimum score so new posts aren't zero
    private static final int CANDIDATE_MULTIPLIER = 5;  // Fetch 5× requested page size as candidates

    @Autowired private BookReviewRepository reviewRepository;
    @Autowired private ReflectionRepository reflectionRepository;
    @Autowired private UserFollowRepository userFollowRepository;

    // ============================================
    // Public API
    // ============================================

    /**
     * Get ranked reviews from followed users (or popular reviews if following nobody).
     */
    public Page<BookReview> getRankedFollowingReviews(Long viewerId, int page, int size) {
        List<Long> followingIds = userFollowRepository.findFollowingIdsByUserId(viewerId);
        Set<Long> followingSet = new HashSet<>(followingIds);

        if (followingIds.isEmpty()) {
            // Fall back to popular reviews (already engagement-sorted in DB)
            return reviewRepository.findPopularReviews(PageRequest.of(page, size));
        }

        // Fetch a larger candidate pool
        int candidateSize = Math.min(size * CANDIDATE_MULTIPLIER, 200);
        Pageable candidatePageable = PageRequest.of(0, candidateSize);
        List<BookReview> candidates = reviewRepository
                .findReviewsByFollowedUsers(followingIds, candidatePageable)
                .getContent();

        // Also mix in some popular public reviews for discovery (up to 20% of candidates)
        int discoveryCount = Math.max(candidateSize / 5, 10);
        List<BookReview> discoveryReviews = reviewRepository
                .findPopularReviews(PageRequest.of(0, discoveryCount))
                .getContent();

        // Merge, deduplicate
        Map<Long, BookReview> merged = new LinkedHashMap<>();
        candidates.forEach(r -> merged.put(r.getId(), r));
        discoveryReviews.forEach(r -> merged.putIfAbsent(r.getId(), r));

        // Score and sort
        List<BookReview> ranked = merged.values().stream()
                .sorted((a, b) -> Double.compare(
                        scoreReview(b, followingSet),
                        scoreReview(a, followingSet)
                ))
                .collect(Collectors.toList());

        return paginateList(ranked, page, size);
    }

    /**
     * Get ranked reflections for the "Following" tab.
     */
    public Page<Reflection> getRankedFollowingReflections(Long userId, int page, int size) {
        List<Long> followingIds = userFollowRepository.findFollowingIdsByUserId(userId);
        Set<Long> followingSet = new HashSet<>(followingIds);

        if (followingIds.isEmpty()) {
            return Page.empty(PageRequest.of(page, size));
        }

        int candidateSize = Math.min(size * CANDIDATE_MULTIPLIER, 200);
        List<Reflection> candidates = reflectionRepository
                .findFollowingFeed(followingIds, PageRequest.of(0, candidateSize))
                .getContent();

        List<Reflection> ranked = candidates.stream()
                .sorted((a, b) -> Double.compare(
                        scoreReflection(b, followingSet),
                        scoreReflection(a, followingSet)
                ))
                .collect(Collectors.toList());

        return paginateList(ranked, page, size);
    }

    /**
     * Get ranked reflections for the "Everyone" tab.
     */
    public Page<Reflection> getRankedEveryoneReflections(Long userId, int page, int size) {
        List<Long> followingIds = userFollowRepository.findFollowingIdsByUserId(userId);
        Set<Long> followingSet = new HashSet<>(followingIds);

        int candidateSize = Math.min(size * CANDIDATE_MULTIPLIER, 200);
        Pageable candidatePageable = PageRequest.of(0, candidateSize);

        List<Reflection> candidates;
        if (followingIds.isEmpty()) {
            candidates = reflectionRepository.findPublicReflections(candidatePageable).getContent();
        } else {
            candidates = reflectionRepository.findEveryoneFeed(followingIds, candidatePageable).getContent();
        }

        List<Reflection> ranked = candidates.stream()
                .sorted((a, b) -> Double.compare(
                        scoreReflection(b, followingSet),
                        scoreReflection(a, followingSet)
                ))
                .collect(Collectors.toList());

        return paginateList(ranked, page, size);
    }

    // ============================================
    // Scoring Functions
    // ============================================

    /**
     * Score a BookReview: engagement + recency + relationship
     */
    private double scoreReview(BookReview review, Set<Long> followingIds) {
        double engagement = BASE_SCORE
                + (safeInt(review.getLikesCount()) * LIKE_WEIGHT)
                + (safeInt(review.getCommentsCount()) * COMMENT_WEIGHT);

        double recency = recencyMultiplier(review.getCreatedAt());
        double relationship = followingIds.contains(review.getUser().getId()) ? FOLLOWING_BOOST : 1.0;

        return engagement * recency * relationship;
    }

    /**
     * Score a Reflection: engagement + recency + relationship
     */
    private double scoreReflection(Reflection reflection, Set<Long> followingIds) {
        double engagement = BASE_SCORE
                + (safeInt(reflection.getLikesCount()) * LIKE_WEIGHT)
                + (safeInt(reflection.getCommentsCount()) * COMMENT_WEIGHT)
                + (safeInt(reflection.getSavesCount()) * SAVE_WEIGHT);

        double recency = recencyMultiplier(reflection.getCreatedAt());
        double relationship = followingIds.contains(reflection.getUser().getId()) ? FOLLOWING_BOOST : 1.0;

        return engagement * recency * relationship;
    }

    /**
     * Time-decay multiplier: content loses relevance as it ages.
     * Half-life of 24 hours means a 1-day-old post has ~41% of a brand-new post's score.
     */
    private double recencyMultiplier(LocalDateTime createdAt) {
        if (createdAt == null) return 0.1;
        double hoursAge = Duration.between(createdAt, LocalDateTime.now()).toMinutes() / 60.0;
        if (hoursAge < 0) hoursAge = 0;
        return 1.0 / Math.pow(1.0 + hoursAge / HALF_LIFE_HOURS, DECAY_POWER);
    }

    // ============================================
    // Utility
    // ============================================

    private int safeInt(Integer val) {
        return val != null ? val : 0;
    }

    /**
     * Paginate a pre-sorted in-memory list into a Spring Data Page.
     */
    private <T> Page<T> paginateList(List<T> items, int page, int size) {
        int total = items.size();
        int fromIndex = page * size;
        if (fromIndex >= total) {
            return new PageImpl<>(Collections.emptyList(), PageRequest.of(page, size), total);
        }
        int toIndex = Math.min(fromIndex + size, total);
        List<T> pageContent = items.subList(fromIndex, toIndex);
        return new PageImpl<>(pageContent, PageRequest.of(page, size), total);
    }
}
