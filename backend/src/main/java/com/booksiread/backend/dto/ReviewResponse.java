package com.booksiread.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ReviewResponse {
    private Long id;
    private String content;
    private Integer rating;
    private Boolean containsSpoilers;
    private Integer likesCount;
    private Integer commentsCount;
    private Boolean likedByViewer;
    private Boolean savedByViewer;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime savedAt;

    // Author info
    private Long authorId;
    private String authorUsername;
    private String authorDisplayName;
    private String authorProfilePictureUrl;

    // Book info
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;

    // Comments (optionally loaded)
    private List<CommentResponse> recentComments;

    public static class CommentResponse {
        private Long id;
        private String content;
        private Long authorId;
        private String authorUsername;
        private String authorDisplayName;
        private String authorProfilePictureUrl;
        private LocalDateTime createdAt;
        private Long parentId;
        private int replyCount;
        private List<CommentResponse> replies;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Long getAuthorId() { return authorId; }
        public void setAuthorId(Long authorId) { this.authorId = authorId; }
        public String getAuthorUsername() { return authorUsername; }
        public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
        public String getAuthorDisplayName() { return authorDisplayName; }
        public void setAuthorDisplayName(String authorDisplayName) { this.authorDisplayName = authorDisplayName; }
        public String getAuthorProfilePictureUrl() { return authorProfilePictureUrl; }
        public void setAuthorProfilePictureUrl(String authorProfilePictureUrl) { this.authorProfilePictureUrl = authorProfilePictureUrl; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public Long getParentId() { return parentId; }
        public void setParentId(Long parentId) { this.parentId = parentId; }
        public int getReplyCount() { return replyCount; }
        public void setReplyCount(int replyCount) { this.replyCount = replyCount; }
        public List<CommentResponse> getReplies() { return replies; }
        public void setReplies(List<CommentResponse> replies) { this.replies = replies; }
    }

    public ReviewResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public Boolean getContainsSpoilers() { return containsSpoilers; }
    public void setContainsSpoilers(Boolean containsSpoilers) { this.containsSpoilers = containsSpoilers; }
    public Integer getLikesCount() { return likesCount; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }
    public Integer getCommentsCount() { return commentsCount; }
    public void setCommentsCount(Integer commentsCount) { this.commentsCount = commentsCount; }
    public Boolean getLikedByViewer() { return likedByViewer; }
    public void setLikedByViewer(Boolean likedByViewer) { this.likedByViewer = likedByViewer; }
    public Boolean getSavedByViewer() { return savedByViewer; }
    public void setSavedByViewer(Boolean savedByViewer) { this.savedByViewer = savedByViewer; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    public String getAuthorDisplayName() { return authorDisplayName; }
    public void setAuthorDisplayName(String authorDisplayName) { this.authorDisplayName = authorDisplayName; }
    public String getAuthorProfilePictureUrl() { return authorProfilePictureUrl; }
    public void setAuthorProfilePictureUrl(String authorProfilePictureUrl) { this.authorProfilePictureUrl = authorProfilePictureUrl; }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
    public String getBookAuthor() { return bookAuthor; }
    public void setBookAuthor(String bookAuthor) { this.bookAuthor = bookAuthor; }

    public List<CommentResponse> getRecentComments() { return recentComments; }
    public void setRecentComments(List<CommentResponse> recentComments) { this.recentComments = recentComments; }

    public LocalDateTime getSavedAt() { return savedAt; }
    public void setSavedAt(LocalDateTime savedAt) { this.savedAt = savedAt; }
}
