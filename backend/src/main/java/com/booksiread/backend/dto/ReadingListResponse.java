package com.booksiread.backend.dto;

import com.booksiread.backend.entity.ReadingList;
import com.booksiread.backend.entity.ReadingListItem;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class ReadingListResponse {

    private Long id;
    private Long ownerId;
    private String ownerUsername;
    private String ownerDisplayName;
    private String ownerProfilePictureUrl;
    private String name;
    private String description;
    private boolean isPublic;
    private String coverEmoji;
    private int booksCount;
    private int likesCount;
    private boolean likedByViewer;
    private boolean ownedByViewer;
    private List<ItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReadingListResponse fromEntity(ReadingList list, boolean likedByViewer, boolean ownedByViewer) {
        ReadingListResponse r = new ReadingListResponse();
        r.setId(list.getId());
        r.setOwnerId(list.getUser().getId());
        r.setOwnerUsername(list.getUser().getUsername());
        r.setOwnerDisplayName(list.getUser().getDisplayName());
        r.setOwnerProfilePictureUrl(list.getUser().getProfilePictureUrl());
        r.setName(list.getName());
        r.setDescription(list.getDescription());
        r.setPublic(list.getIsPublic());
        r.setCoverEmoji(list.getCoverEmoji());
        r.setBooksCount(list.getBooksCount());
        r.setLikesCount(list.getLikesCount());
        r.setLikedByViewer(likedByViewer);
        r.setOwnedByViewer(ownedByViewer);
        r.setCreatedAt(list.getCreatedAt());
        r.setUpdatedAt(list.getUpdatedAt());

        if (list.getItems() != null) {
            r.setItems(list.getItems().stream()
                    .map(ItemResponse::fromEntity)
                    .collect(Collectors.toList()));
        }
        return r;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public String getOwnerUsername() { return ownerUsername; }
    public void setOwnerUsername(String ownerUsername) { this.ownerUsername = ownerUsername; }
    public String getOwnerDisplayName() { return ownerDisplayName; }
    public void setOwnerDisplayName(String ownerDisplayName) { this.ownerDisplayName = ownerDisplayName; }
    public String getOwnerProfilePictureUrl() { return ownerProfilePictureUrl; }
    public void setOwnerProfilePictureUrl(String ownerProfilePictureUrl) { this.ownerProfilePictureUrl = ownerProfilePictureUrl; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
    public String getCoverEmoji() { return coverEmoji; }
    public void setCoverEmoji(String coverEmoji) { this.coverEmoji = coverEmoji; }
    public int getBooksCount() { return booksCount; }
    public void setBooksCount(int booksCount) { this.booksCount = booksCount; }
    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }
    public boolean isLikedByViewer() { return likedByViewer; }
    public void setLikedByViewer(boolean likedByViewer) { this.likedByViewer = likedByViewer; }
    public boolean isOwnedByViewer() { return ownedByViewer; }
    public void setOwnedByViewer(boolean ownedByViewer) { this.ownedByViewer = ownedByViewer; }
    public List<ItemResponse> getItems() { return items; }
    public void setItems(List<ItemResponse> items) { this.items = items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    /**
     * Nested DTO for list items
     */
    public static class ItemResponse {
        private Long id;
        private Long bookId;
        private String bookTitle;
        private String bookAuthor;
        private String note;
        private int position;
        private LocalDateTime addedAt;

        public static ItemResponse fromEntity(ReadingListItem item) {
            ItemResponse r = new ItemResponse();
            r.setId(item.getId());
            r.setBookId(item.getBook() != null ? item.getBook().getId() : null);
            r.setBookTitle(item.getBookTitle());
            r.setBookAuthor(item.getBookAuthor());
            r.setNote(item.getNote());
            r.setPosition(item.getPosition());
            r.setAddedAt(item.getAddedAt());
            return r;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getBookId() { return bookId; }
        public void setBookId(Long bookId) { this.bookId = bookId; }
        public String getBookTitle() { return bookTitle; }
        public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
        public String getBookAuthor() { return bookAuthor; }
        public void setBookAuthor(String bookAuthor) { this.bookAuthor = bookAuthor; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
        public int getPosition() { return position; }
        public void setPosition(int position) { this.position = position; }
        public LocalDateTime getAddedAt() { return addedAt; }
        public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
    }
}
