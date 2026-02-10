package com.booksiread.backend.dto;

public class AddListItemRequest {

    private Long bookId;       // optional — link to library book
    private String bookTitle;  // required
    private String bookAuthor; // required
    private String note;       // optional, max 300

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
    public String getBookAuthor() { return bookAuthor; }
    public void setBookAuthor(String bookAuthor) { this.bookAuthor = bookAuthor; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
