package com.booksiread.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Reflection feed items — LinkedIn-style with social engagement data
 */
public class ReflectionResponse {
    private Long id;
    private UserCardResponse user;
    private String content;
    private BookSummary book;
    private Boolean visibleToFollowersOnly;
    private Integer likesCount;
    private Integer commentsCount;
    private Integer savesCount;
    private Boolean hasLiked;
    private Boolean hasSaved;
    private List<CommentResponse> recentComments;
    private LocalDateTime createdAt;
    private LocalDateTime savedAt;

    /** Nested book summary */
    public static class BookSummary {
        private Long id;
        private String title;
        private String author;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
    }

    /** Nested comment response (supports threaded replies) */
    public static class CommentResponse {
        private Long id;
        private UserCardResponse user;
        private String content;
        private Long parentId;
        private int replyCount;
        private List<CommentResponse> replies;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public UserCardResponse getUser() { return user; }
        public void setUser(UserCardResponse user) { this.user = user; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Long getParentId() { return parentId; }
        public void setParentId(Long parentId) { this.parentId = parentId; }
        public int getReplyCount() { return replyCount; }
        public void setReplyCount(int replyCount) { this.replyCount = replyCount; }
        public List<CommentResponse> getReplies() { return replies; }
        public void setReplies(List<CommentResponse> replies) { this.replies = replies; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserCardResponse getUser() { return user; }
    public void setUser(UserCardResponse user) { this.user = user; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public BookSummary getBook() { return book; }
    public void setBook(BookSummary book) { this.book = book; }

    public Boolean getVisibleToFollowersOnly() { return visibleToFollowersOnly; }
    public void setVisibleToFollowersOnly(Boolean visibleToFollowersOnly) { this.visibleToFollowersOnly = visibleToFollowersOnly; }

    public Integer getLikesCount() { return likesCount; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }

    public Integer getCommentsCount() { return commentsCount; }
    public void setCommentsCount(Integer commentsCount) { this.commentsCount = commentsCount; }

    public Integer getSavesCount() { return savesCount; }
    public void setSavesCount(Integer savesCount) { this.savesCount = savesCount; }

    public Boolean getHasLiked() { return hasLiked; }
    public void setHasLiked(Boolean hasLiked) { this.hasLiked = hasLiked; }

    public Boolean getHasSaved() { return hasSaved; }
    public void setHasSaved(Boolean hasSaved) { this.hasSaved = hasSaved; }

    public List<CommentResponse> getRecentComments() { return recentComments; }
    public void setRecentComments(List<CommentResponse> recentComments) { this.recentComments = recentComments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getSavedAt() { return savedAt; }
    public void setSavedAt(LocalDateTime savedAt) { this.savedAt = savedAt; }
}
