package com.booksiread.backend.service.impl;

import com.booksiread.backend.dto.BookRequest;
import com.booksiread.backend.dto.BookResponse;
import com.booksiread.backend.entity.Book;
import com.booksiread.backend.entity.User;
import com.booksiread.backend.entity.UserActivity;
import com.booksiread.backend.exception.ResourceNotFoundException;
import com.booksiread.backend.exception.ValidationException;
import com.booksiread.backend.entity.ReadingActivity;
import com.booksiread.backend.repository.BookRepository;
import com.booksiread.backend.repository.ReadingActivityRepository;
import com.booksiread.backend.repository.UserActivityRepository;
import com.booksiread.backend.security.CustomUserDetailsService;
import com.booksiread.backend.service.AiNotesService;
import com.booksiread.backend.service.BookService;
import com.booksiread.backend.service.ReadingGoalService;
import com.booksiread.backend.service.SocialService;
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
    private final SocialService socialService;
    private final ReadingGoalService readingGoalService;
    
    // IST timezone for activity tracking
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    @Autowired
    public BookServiceImpl(BookRepository bookRepository, 
                          CustomUserDetailsService userDetailsService,
                          ReadingActivityRepository readingActivityRepository,
                          AiNotesService aiNotesService,
                          SocialService socialService,
                          ReadingGoalService readingGoalService) {
        this.bookRepository = bookRepository;
        this.userDetailsService = userDetailsService;
        this.readingActivityRepository = readingActivityRepository;
        this.aiNotesService = aiNotesService;
        this.socialService = socialService;
        this.readingGoalService = readingGoalService;
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
        if (request.getIsPublic() != null) {
            book.setIsPublic(request.getIsPublic());
        }

        // ========== AI Notes Generation ==========
        // Set initial AI status to PENDING
        book.setAiStatus(Book.AiStatus.PENDING);

        // Save to database and flush to ensure transaction commits
        Book savedBook = bookRepository.saveAndFlush(book);

        // Trigger async AI notes generation AFTER book is committed
        aiNotesService.generateNotesAsync(savedBook.getId());

        // Record social activity: book added (only for public books)
        try {
            if (savedBook.getIsPublic() == null || savedBook.getIsPublic()) {
                socialService.recordActivity(
                    currentUser.getId(), UserActivity.ActivityType.ADDED_BOOK, 
                    savedBook.getId(), null
                );
            }
            // Update books count
            currentUser.setBooksCount((currentUser.getBooksCount() != null ? currentUser.getBooksCount() : 0) + 1);
            // Note: user is managed entity, will be saved with transaction
        } catch (Exception e) {
            // Don't fail book creation if activity recording fails
        }

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

        // Track old values for social activity recording
        Book.ReadingStatus oldStatus = book.getStatus();
        Integer oldRating = book.getRating();
        String oldReview = book.getReview();

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
        if (request.getIsPublic() != null) {
            book.setIsPublic(request.getIsPublic());
        }

        // Save updated book
        Book updatedBook = bookRepository.save(book);

        // Record reading activity if pages were updated
        if (pagesChanged && newPagesRead > 0) {
            recordReadingActivity(updatedBook, currentUser, newPagesRead - oldPagesRead);
        }

        // Record social activities based on changes (only for public books)
        boolean bookIsPublic = updatedBook.getIsPublic() == null || updatedBook.getIsPublic();
        try {
            if (bookIsPublic) {
            // Track status changes
            if (request.getStatus() != null && !request.getStatus().equals(oldStatus)) {
                if (request.getStatus() == Book.ReadingStatus.READING) {
                    socialService.recordActivity(
                        currentUser.getId(), UserActivity.ActivityType.STARTED_READING,
                        updatedBook.getId(), null
                    );
                } else if (request.getStatus() == Book.ReadingStatus.FINISHED) {
                    socialService.recordActivity(
                        currentUser.getId(), UserActivity.ActivityType.FINISHED_BOOK,
                        updatedBook.getId(), null
                    );
                    // Auto-increment reading goal progress
                    try {
                        readingGoalService.incrementBooksCompleted(currentUser.getId());
                    } catch (Exception e) {
                        // Don't fail the book update if goal tracking fails
                    }
                }
            }
            // Track rating
            if (request.getRating() != null && !request.getRating().equals(oldRating)) {
                socialService.recordActivity(
                    currentUser.getId(), UserActivity.ActivityType.RATED_BOOK,
                    updatedBook.getId(), null,
                    "{\"rating\":" + request.getRating() + "}"
                );
            }
            // Track significant progress updates (only if not already tracked by status change)
            if (pagesChanged && (request.getStatus() == null || request.getStatus().equals(oldStatus))) {
                int progressPercent = (int) ((newPagesRead * 100.0) / request.getTotalPages());
                // Only record at 25%, 50%, 75% milestones
                int oldPercent = (int) ((oldPagesRead * 100.0) / request.getTotalPages());
                if ((progressPercent >= 25 && oldPercent < 25) ||
                    (progressPercent >= 50 && oldPercent < 50) ||
                    (progressPercent >= 75 && oldPercent < 75)) {
                    socialService.recordActivity(
                        currentUser.getId(), UserActivity.ActivityType.PROGRESS_UPDATE,
                        updatedBook.getId(), null,
                        "{\"progress\":" + progressPercent + "}"
                    );
                }
            }
            // Track review
            if (request.getReview() != null && !request.getReview().isEmpty() 
                && (oldReview == null || oldReview.isEmpty())) {
                socialService.recordActivity(
                    currentUser.getId(), UserActivity.ActivityType.WROTE_REVIEW,
                    updatedBook.getId(), null
                );
            }
            } // end if bookIsPublic
        } catch (Exception e) {
            // Don't fail book update if activity recording fails
        }

        return BookResponse.fromEntity(updatedBook);
    }

    @Override
    public BookResponse togglePrivacy(Long id, Boolean isPublic) {
        User currentUser = getCurrentUser();
        Book book = bookRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        book.setIsPublic(isPublic != null ? isPublic : !Boolean.FALSE.equals(book.getIsPublic()));
        Book saved = bookRepository.save(book);
        return BookResponse.fromEntity(saved);
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
