package com.booksiread.backend.service.impl;

import com.booksiread.backend.dto.BookRequest;
import com.booksiread.backend.dto.BookResponse;
import com.booksiread.backend.entity.Book;
import com.booksiread.backend.entity.User;
import com.booksiread.backend.exception.ResourceNotFoundException;
import com.booksiread.backend.exception.ValidationException;
import com.booksiread.backend.model.ReadingActivity;
import com.booksiread.backend.repository.BookRepository;
import com.booksiread.backend.repository.ReadingActivityRepository;
import com.booksiread.backend.security.CustomUserDetailsService;
import com.booksiread.backend.service.AiNotesService;
import com.booksiread.backend.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * BookServiceImpl - Implementation of business logic
 * 
 * Handles:
 * - CRUD operations
 * - Business validations
 * - Entity-DTO conversions
 * - User-based filtering
 */
@Service
@Transactional
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final CustomUserDetailsService userDetailsService;
    private final ReadingActivityRepository readingActivityRepository;
    private final AiNotesService aiNotesService;
    
    // IST timezone for activity tracking
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    @Autowired
    public BookServiceImpl(BookRepository bookRepository, 
                          CustomUserDetailsService userDetailsService,
                          ReadingActivityRepository readingActivityRepository,
                          AiNotesService aiNotesService) {
        this.bookRepository = bookRepository;
        this.userDetailsService = userDetailsService;
        this.readingActivityRepository = readingActivityRepository;
        this.aiNotesService = aiNotesService;
    }

    /**
     * Get the currently authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userDetailsService.loadUserEntityByUsername(username);
    }

    @Override
    public BookResponse createBook(BookRequest request) {
        // Business validation: pagesRead cannot exceed totalPages
        validatePagesRead(request.getPagesRead(), request.getTotalPages());

        // Get current user
        User currentUser = getCurrentUser();

        // Convert DTO to Entity
        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setTotalPages(request.getTotalPages());
        book.setPagesRead(request.getPagesRead());
        book.setUser(currentUser);
        
        // Set new fields
        if (request.getStatus() != null) {
            book.setStatus(request.getStatus());
        }
        if (request.getStartDate() != null) {
            book.setStartDate(request.getStartDate());
        }
        if (request.getCompleteDate() != null) {
            book.setCompleteDate(request.getCompleteDate());
        }
        if (request.getRating() != null) {
            book.setRating(request.getRating());
        }
        if (request.getReview() != null) {
            book.setReview(request.getReview());
        }
        if (request.getNotes() != null) {
            book.setNotes(request.getNotes());
        }
        if (request.getTags() != null) {
            book.setTags(request.getTags());
        }

        // ========== AI Notes Generation ==========
        // Set initial AI status to PENDING
        book.setAiStatus(Book.AiStatus.PENDING);

        // Save to database and flush to ensure transaction commits
        Book savedBook = bookRepository.saveAndFlush(book);

        // Trigger async AI notes generation AFTER book is committed
        aiNotesService.generateNotesAsync(savedBook.getId());

        // Convert Entity to Response DTO
        return BookResponse.fromEntity(savedBook);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getAllBooks() {
        // Get current user
        User currentUser = getCurrentUser();
        
        // Fetch only books belonging to the current user
        return bookRepository.findByUser(currentUser)
                .stream()
                .map(BookResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookResponse getBookById(Long id) {
        // Get current user
        User currentUser = getCurrentUser();
        
        // Find book by ID and user (ensures user can only access their own books)
        Book book = bookRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        
        return BookResponse.fromEntity(book);
    }

    @Override
    public BookResponse updateBook(Long id, BookRequest request) {
        // Get current user
        User currentUser = getCurrentUser();
        
        // Check if book exists and belongs to current user
        Book book = bookRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        // Business validation: pagesRead cannot exceed totalPages
        validatePagesRead(request.getPagesRead(), request.getTotalPages());

        // Track if pages were updated (for reading activity)
        Integer oldPagesRead = book.getPagesRead();
        Integer newPagesRead = request.getPagesRead();
        boolean pagesChanged = !oldPagesRead.equals(newPagesRead);

        // Update fields
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setTotalPages(request.getTotalPages());
        book.setPagesRead(request.getPagesRead());
        
        // Update status (this will auto-set dates via Book entity logic)
        if (request.getStatus() != null) {
            book.setStatus(request.getStatus());
        }
        
        // Only override dates if explicitly provided and not null
        // This allows the Book entity's auto-logic to work
        if (request.getStartDate() != null) {
            book.setStartDate(request.getStartDate());
        }
        if (request.getCompleteDate() != null) {
            book.setCompleteDate(request.getCompleteDate());
        }
        
        if (request.getRating() != null) {
            book.setRating(request.getRating());
        }
        if (request.getReview() != null) {
            book.setReview(request.getReview());
        }
        if (request.getNotes() != null) {
            book.setNotes(request.getNotes());
        }
        if (request.getTags() != null) {
            book.setTags(request.getTags());
        }

        // Save updated book
        Book updatedBook = bookRepository.save(book);

        // Record reading activity if pages were updated
        if (pagesChanged && newPagesRead > 0) {
            recordReadingActivity(updatedBook, currentUser, newPagesRead - oldPagesRead);
        }

        return BookResponse.fromEntity(updatedBook);
    }

    @Override
    public void deleteBook(Long id) {
        // Get current user
        User currentUser = getCurrentUser();
        
        // Check if book exists and belongs to current user
        Book book = bookRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        // Delete associated reading activities first
        readingActivityRepository.deleteByBookId(id);
        
        // Then delete the book
        bookRepository.delete(book);
    }

    /**
     * Business validation: Ensure pagesRead is within valid range
     */
    private void validatePagesRead(Integer pagesRead, Integer totalPages) {
        if (pagesRead > totalPages) {
            throw new ValidationException(
                "Pages read (" + pagesRead + ") cannot exceed total pages (" + totalPages + ")"
            );
        }
    }
    
    /**
     * Record daily reading activity in IST timezone
     */
    private void recordReadingActivity(Book book, User user, Integer pagesReadToday) {
        // Get current date in IST
        LocalDate todayIST = LocalDate.now(IST_ZONE);
        
        // Check if activity already exists for today
        Optional<ReadingActivity> existingActivity = readingActivityRepository
            .findByUserAndBookIdAndActivityDate(user, book.getId(), todayIST);
        
        if (existingActivity.isPresent()) {
            // Update existing activity - add pages to existing count
            ReadingActivity activity = existingActivity.get();
            activity.setPagesReadToday(activity.getPagesReadToday() + pagesReadToday);
            readingActivityRepository.save(activity);
        } else {
            // Create new activity for today
            ReadingActivity newActivity = new ReadingActivity(book, user, todayIST, pagesReadToday);
            readingActivityRepository.save(newActivity);
        }
    }
}
