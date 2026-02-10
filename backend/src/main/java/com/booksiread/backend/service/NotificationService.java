package com.booksiread.backend.service;

import com.booksiread.backend.dto.NotificationResponse;
import com.booksiread.backend.entity.*;
import com.booksiread.backend.repository.NotificationRepository;
import com.booksiread.backend.repository.UserFollowRepository;
import com.booksiread.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * NotificationService - Handles in-app notifications
 * 
 * Notifications are created when:
 * - Someone follows you
 * - Someone sends you a follow request
 * - Your follow request is accepted
 * - Someone you follow finishes a book
 * - Someone you follow writes a review
 * - Someone comments on your review
 */
@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserFollowRepository userFollowRepository;

    @Autowired
    private UserRepository userRepository;

    private static final Pattern MENTION_PATTERN = Pattern.compile("@(\\w+)");

    // ============================================
    // Query notifications
    // ============================================

    public Page<NotificationResponse> getNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(this::mapToResponse);
    }

    public Page<NotificationResponse> getUnreadNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationRepository
                .findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(this::mapToResponse);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.markAsRead(notificationId, userId);
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    // ============================================
    // Create notifications
    // ============================================

    /** Notify user when someone follows them */
    public void notifyFollow(User actor, User recipient) {
        String displayName = actor.getDisplayName() != null ? actor.getDisplayName() : actor.getUsername();
        Notification notification = new Notification(
            recipient, actor, 
            Notification.NotificationType.FOLLOW,
            displayName + " started following you"
        );
        notificationRepository.save(notification);
    }

    /** Notify user of a follow request (private account) */
    public void notifyFollowRequest(User actor, User recipient, Long followRequestId) {
        String displayName = actor.getDisplayName() != null ? actor.getDisplayName() : actor.getUsername();
        Notification notification = new Notification(
            recipient, actor,
            Notification.NotificationType.FOLLOW_REQUEST,
            displayName + " requested to follow you"
        );
        notification.setFollowRequestId(followRequestId);
        notificationRepository.save(notification);
    }

    /** Notify user that their follow request was accepted */
    public void notifyFollowAccepted(User actor, User recipient) {
        String displayName = actor.getDisplayName() != null ? actor.getDisplayName() : actor.getUsername();
        Notification notification = new Notification(
            recipient, actor,
            Notification.NotificationType.FOLLOW_ACCEPTED,
            displayName + " accepted your follow request"
        );
        notificationRepository.save(notification);
    }

    /** Notify followers that user finished a book */
    public void notifyBookFinished(User actor, Book book) {
        List<Long> followerIds = userFollowRepository.findFollowerIdsByUserId(actor.getId());
        String displayName = actor.getDisplayName() != null ? actor.getDisplayName() : actor.getUsername();
        
        for (Long followerId : followerIds) {
            // Create a lightweight notification without loading the full User
            Notification notification = new Notification();
            notification.setActor(actor);
            notification.setRecipient(new User()); // Will be set by ID
            notification.getRecipient().setId(followerId);
            notification.setType(Notification.NotificationType.BOOK_FINISHED);
            notification.setMessage(displayName + " finished reading \"" + book.getTitle() + "\"");
            notification.setBook(book);
            notificationRepository.save(notification);
        }
    }

    /** Notify followers that user wrote a review */
    public void notifyReviewPosted(User actor, Book book, Long reviewId) {
        List<Long> followerIds = userFollowRepository.findFollowerIdsByUserId(actor.getId());
        String displayName = actor.getDisplayName() != null ? actor.getDisplayName() : actor.getUsername();
        
        for (Long followerId : followerIds) {
            Notification notification = new Notification();
            notification.setActor(actor);
            notification.setRecipient(new User());
            notification.getRecipient().setId(followerId);
            notification.setType(Notification.NotificationType.BOOK_REVIEW);
            notification.setMessage(displayName + " reviewed \"" + book.getTitle() + "\"");
            notification.setBook(book);
            notification.setReviewId(reviewId);
            notificationRepository.save(notification);
        }
    }

    /** Notify review author of a comment */
    public void notifyComment(User actor, User reviewAuthor, Book book, Long reviewId) {
        if (actor.getId().equals(reviewAuthor.getId())) return; // Don't notify self
        
        String displayName = actor.getDisplayName() != null ? actor.getDisplayName() : actor.getUsername();
        Notification notification = new Notification(
            reviewAuthor, actor,
            Notification.NotificationType.COMMENT,
            displayName + " commented on your review of \"" + book.getTitle() + "\""
        );
        notification.setBook(book);
        notification.setReviewId(reviewId);
        notificationRepository.save(notification);
    }

    /** Notify the parent comment author that someone replied */
    public void notifyCommentReply(User actor, User parentCommentAuthor, Book book, Long reviewId, Long commentId) {
        if (actor.getId().equals(parentCommentAuthor.getId())) return; // Don't notify self

        String displayName = actor.getDisplayName() != null ? actor.getDisplayName() : actor.getUsername();
        Notification notification = new Notification(
            parentCommentAuthor, actor,
            Notification.NotificationType.COMMENT_REPLY,
            displayName + " replied to your comment on \"" + book.getTitle() + "\""
        );
        notification.setBook(book);
        notification.setReviewId(reviewId);
        notification.setCommentId(commentId);
        notificationRepository.save(notification);
    }

    /**
     * Parse @mentions from comment content and create MENTION notifications.
     * Returns the set of mentioned usernames.
     */
    public Set<String> processMentions(User actor, String content, Book book, Long reviewId, Long commentId) {
        Set<String> mentionedUsernames = new LinkedHashSet<>();
        Matcher matcher = MENTION_PATTERN.matcher(content);
        while (matcher.find()) {
            mentionedUsernames.add(matcher.group(1));
        }

        String displayName = actor.getDisplayName() != null ? actor.getDisplayName() : actor.getUsername();

        for (String username : mentionedUsernames) {
            Optional<User> mentionedUser = userRepository.findByUsername(username);
            if (mentionedUser.isPresent() && !mentionedUser.get().getId().equals(actor.getId())) {
                Notification notification = new Notification(
                    mentionedUser.get(), actor,
                    Notification.NotificationType.MENTION,
                    displayName + " mentioned you in a comment on \"" + book.getTitle() + "\""
                );
                notification.setBook(book);
                notification.setReviewId(reviewId);
                notification.setCommentId(commentId);
                notificationRepository.save(notification);
            }
        }

        return mentionedUsernames;
    }

    // ============================================
    // Reflection Comment Notifications
    // ============================================

    /** Notify reflection author of a comment */
    public void notifyReflectionComment(User actor, User reflectionAuthor, Book book, Long reflectionId) {
        if (actor.getId().equals(reflectionAuthor.getId())) return;

        String displayName = actor.getDisplayName() != null ? actor.getDisplayName() : actor.getUsername();
        String bookTitle = book != null ? book.getTitle() : "a reflection";
        Notification notification = new Notification(
            reflectionAuthor, actor,
            Notification.NotificationType.COMMENT,
            displayName + " commented on your reflection" + (book != null ? " about \"" + bookTitle + "\"" : "")
        );
        if (book != null) notification.setBook(book);
        notification.setReflectionId(reflectionId);
        notificationRepository.save(notification);
    }

    /** Notify the parent comment author that someone replied on a reflection */
    public void notifyReflectionCommentReply(User actor, User parentCommentAuthor, Book book, Long reflectionId, Long commentId) {
        if (actor.getId().equals(parentCommentAuthor.getId())) return;

        String displayName = actor.getDisplayName() != null ? actor.getDisplayName() : actor.getUsername();
        Notification notification = new Notification(
            parentCommentAuthor, actor,
            Notification.NotificationType.COMMENT_REPLY,
            displayName + " replied to your comment on a reflection"
        );
        if (book != null) notification.setBook(book);
        notification.setReflectionId(reflectionId);
        notification.setCommentId(commentId);
        notificationRepository.save(notification);
    }

    /** Parse @mentions from reflection comment content and create MENTION notifications */
    public Set<String> processReflectionMentions(User actor, String content, Book book, Long reflectionId, Long commentId) {
        Set<String> mentionedUsernames = new LinkedHashSet<>();
        Matcher matcher = MENTION_PATTERN.matcher(content);
        while (matcher.find()) {
            mentionedUsernames.add(matcher.group(1));
        }

        String displayName = actor.getDisplayName() != null ? actor.getDisplayName() : actor.getUsername();

        for (String username : mentionedUsernames) {
            Optional<User> mentionedUser = userRepository.findByUsername(username);
            if (mentionedUser.isPresent() && !mentionedUser.get().getId().equals(actor.getId())) {
                Notification notification = new Notification(
                    mentionedUser.get(), actor,
                    Notification.NotificationType.MENTION,
                    displayName + " mentioned you in a comment on a reflection"
                );
                if (book != null) notification.setBook(book);
                notification.setReflectionId(reflectionId);
                notification.setCommentId(commentId);
                notificationRepository.save(notification);
            }
        }

        return mentionedUsernames;
    }

    // ============================================
    // Mapper
    // ============================================

    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setType(notification.getType().name());
        response.setMessage(notification.getMessage());
        response.setIsRead(notification.getIsRead());
        response.setCreatedAt(notification.getCreatedAt());

        if (notification.getActor() != null) {
            response.setActorId(notification.getActor().getId());
            response.setActorUsername(notification.getActor().getUsername());
            response.setActorDisplayName(
                notification.getActor().getDisplayName() != null 
                    ? notification.getActor().getDisplayName() 
                    : notification.getActor().getUsername()
            );
            response.setActorProfilePictureUrl(notification.getActor().getProfilePictureUrl());
        }

        if (notification.getBook() != null) {
            response.setBookId(notification.getBook().getId());
            response.setBookTitle(notification.getBook().getTitle());
        }

        response.setReviewId(notification.getReviewId());
        response.setCommentId(notification.getCommentId());
        response.setReflectionId(notification.getReflectionId());
        response.setFollowRequestId(notification.getFollowRequestId());

        return response;
    }
}
