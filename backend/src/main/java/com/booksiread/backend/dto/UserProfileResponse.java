package com.booksiread.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for public user profile information
 */
public class UserProfileResponse {
    private Long id;
    private String username;
    private String displayName;
    private String bio;
    private String profilePictureUrl;
    private Boolean isPublic;
    private Integer followersCount;
    private Integer followingCount;
    private Integer booksCount;
    private Integer reviewsCount;
    private Integer listsCount;
    private Integer reflectionsCount;
    private List<String> favoriteGenres;
    private LocalDateTime createdAt;
    
    // Relationship status with the viewing user
    private Boolean isFollowing;        // Current user follows this profile
    private Boolean isFollowedBy;       // This profile follows current user
    private Boolean hasPendingRequest;  // Current user has pending follow request
    private Boolean isOwnProfile;       // Viewing own profile

    // Constructors
    public UserProfileResponse() {
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

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
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

    public Integer getFollowingCount() {
        return followingCount;
    }

    public void setFollowingCount(Integer followingCount) {
        this.followingCount = followingCount;
    }

    public Integer getBooksCount() {
        return booksCount;
    }

    public void setBooksCount(Integer booksCount) {
        this.booksCount = booksCount;
    }

    public Integer getReviewsCount() {
        return reviewsCount;
    }

    public void setReviewsCount(Integer reviewsCount) {
        this.reviewsCount = reviewsCount;
    }

    public Integer getListsCount() {
        return listsCount;
    }

    public void setListsCount(Integer listsCount) {
        this.listsCount = listsCount;
    }

    public Integer getReflectionsCount() {
        return reflectionsCount;
    }

    public void setReflectionsCount(Integer reflectionsCount) {
        this.reflectionsCount = reflectionsCount;
    }

    public List<String> getFavoriteGenres() {
        return favoriteGenres;
    }

    public void setFavoriteGenres(List<String> favoriteGenres) {
        this.favoriteGenres = favoriteGenres;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsFollowing() {
        return isFollowing;
    }

    public void setIsFollowing(Boolean isFollowing) {
        this.isFollowing = isFollowing;
    }

    public Boolean getIsFollowedBy() {
        return isFollowedBy;
    }

    public void setIsFollowedBy(Boolean isFollowedBy) {
        this.isFollowedBy = isFollowedBy;
    }

    public Boolean getHasPendingRequest() {
        return hasPendingRequest;
    }

    public void setHasPendingRequest(Boolean hasPendingRequest) {
        this.hasPendingRequest = hasPendingRequest;
    }

    public Boolean getIsOwnProfile() {
        return isOwnProfile;
    }

    public void setIsOwnProfile(Boolean isOwnProfile) {
        this.isOwnProfile = isOwnProfile;
    }
}
