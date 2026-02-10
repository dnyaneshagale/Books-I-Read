package com.booksiread.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO for a compact user card (used in lists, search results, etc.)
 */
public class UserCardResponse {
    private Long id;
    private String username;
    private String displayName;
    private String profilePictureUrl;
    private String bio;
    private Boolean isPublic;
    private Integer followersCount;
    private Integer booksCount;
    
    // Relationship status
    private Boolean isFollowing;
    private Boolean hasPendingRequest;

    // Similarity info (for "People with Similar Interests")
    private java.util.List<String> sharedGenres;
    private java.util.List<String> sharedAuthors;
    private Integer commonBooksCount;

    // Constructors
    public UserCardResponse() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Integer getFollowersCount() {
        return followersCount;
    }

    public void setFollowersCount(Integer followersCount) {
        this.followersCount = followersCount;
    }

    public Integer getBooksCount() {
        return booksCount;
    }

    public void setBooksCount(Integer booksCount) {
        this.booksCount = booksCount;
    }

    public Boolean getIsFollowing() {
        return isFollowing;
    }

    public void setIsFollowing(Boolean isFollowing) {
        this.isFollowing = isFollowing;
    }

    public Boolean getHasPendingRequest() {
        return hasPendingRequest;
    }

    public void setHasPendingRequest(Boolean hasPendingRequest) {
        this.hasPendingRequest = hasPendingRequest;
    }

    public java.util.List<String> getSharedGenres() {
        return sharedGenres;
    }

    public void setSharedGenres(java.util.List<String> sharedGenres) {
        this.sharedGenres = sharedGenres;
    }

    public java.util.List<String> getSharedAuthors() {
        return sharedAuthors;
    }

    public void setSharedAuthors(java.util.List<String> sharedAuthors) {
        this.sharedAuthors = sharedAuthors;
    }

    public Integer getCommonBooksCount() {
        return commonBooksCount;
    }

    public void setCommonBooksCount(Integer commonBooksCount) {
        this.commonBooksCount = commonBooksCount;
    }
}
