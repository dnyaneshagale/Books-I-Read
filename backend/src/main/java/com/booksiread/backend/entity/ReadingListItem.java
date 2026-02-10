package com.booksiread.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * ReadingListItem - A book entry within a reading list.
 * Stores the book's title/author (independent of user's library),
 * plus optional note and position for ordering.
 */
@Entity
@Table(name = "reading_list_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"reading_list_id", "book_title", "book_author"})
})
public class ReadingListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reading_list_id", nullable = false)
    private ReadingList readingList;

    /** Reference to a Book entity if the book exists in the creator's library */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Book book;

    /** Title stored independently so lists work even without a Book entity */
    @Column(name = "book_title", nullable = false)
    private String bookTitle;

    @Column(name = "book_author")
    private String bookAuthor;

    @Column(length = 300)
    private String note;

    @Column(name = "position")
    private Integer position = 0;

    @Column(name = "added_at")
    private LocalDateTime addedAt;

    public ReadingListItem() {}

    public ReadingListItem(ReadingList readingList, String bookTitle, String bookAuthor) {
        this.readingList = readingList;
        this.bookTitle = bookTitle;
        this.bookAuthor = bookAuthor;
    }

    @PrePersist
    protected void onCreate() {
        this.addedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ReadingList getReadingList() { return readingList; }
    public void setReadingList(ReadingList readingList) { this.readingList = readingList; }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }

    public String getBookAuthor() { return bookAuthor; }
    public void setBookAuthor(String bookAuthor) { this.bookAuthor = bookAuthor; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Integer getPosition() { return position != null ? position : 0; }
    public void setPosition(Integer position) { this.position = position; }

    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
