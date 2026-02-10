package com.booksiread.backend.service;

import com.booksiread.backend.dto.ReadingGoalRequest;
import com.booksiread.backend.dto.ReadingGoalResponse;
import com.booksiread.backend.entity.ReadingGoal;
import com.booksiread.backend.entity.User;
import com.booksiread.backend.repository.BookRepository;
import com.booksiread.backend.repository.ReadingGoalRepository;
import com.booksiread.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReadingGoalService {

    @Autowired
    private ReadingGoalRepository readingGoalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    /**
     * Set or update a reading goal for a specific year.
     */
    public ReadingGoalResponse setGoal(Long userId, ReadingGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int year = request.getYear();
        if (year < 2000 || year > 2100) {
            throw new RuntimeException("Invalid year");
        }
        if (request.getTargetBooks() < 1) {
            throw new RuntimeException("Target must be at least 1 book");
        }

        Optional<ReadingGoal> existing = readingGoalRepository.findByUserIdAndYear(userId, year);
        ReadingGoal goal;
        if (existing.isPresent()) {
            goal = existing.get();
            goal.setTargetBooks(request.getTargetBooks());
        } else {
            goal = new ReadingGoal();
            goal.setUser(user);
            goal.setYear(year);
            goal.setTargetBooks(request.getTargetBooks());
            goal.setBooksCompleted(0);
        }

        goal = readingGoalRepository.save(goal);
        return ReadingGoalResponse.fromEntity(goal);
    }

    /**
     * Get the current year's reading goal for a user.
     * Syncs booksCompleted from actual book data for realtime accuracy.
     */
    @Transactional
    public ReadingGoalResponse getCurrentGoal(Long userId) {
        int currentYear = LocalDate.now().getYear();
        ReadingGoal goal = readingGoalRepository.findByUserIdAndYear(userId, currentYear)
                .orElse(null);
        if (goal == null) return null;
        syncBooksCompleted(goal);
        return ReadingGoalResponse.fromEntity(goal);
    }

    /**
     * Get a specific year's goal.
     * Syncs booksCompleted from actual book data for realtime accuracy.
     */
    @Transactional
    public ReadingGoalResponse getGoalByYear(Long userId, int year) {
        ReadingGoal goal = readingGoalRepository.findByUserIdAndYear(userId, year)
                .orElse(null);
        if (goal == null) return null;
        syncBooksCompleted(goal);
        return ReadingGoalResponse.fromEntity(goal);
    }

    /**
     * Get all goals for a user (history).
     * Syncs booksCompleted from actual book data for each goal.
     */
    @Transactional
    public List<ReadingGoalResponse> getAllGoals(Long userId) {
        List<ReadingGoal> goals = readingGoalRepository.findByUserIdOrderByYearDesc(userId);
        goals.forEach(this::syncBooksCompleted);
        return goals.stream()
                .map(ReadingGoalResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Sync booksCompleted for the current year's goal from actual book data.
     * Called automatically when a book status changes.
     */
    public void incrementBooksCompleted(Long userId) {
        int currentYear = LocalDate.now().getYear();
        Optional<ReadingGoal> goalOpt = readingGoalRepository.findByUserIdAndYear(userId, currentYear);
        if (goalOpt.isPresent()) {
            syncBooksCompleted(goalOpt.get());
        }
    }

    /**
     * Sync booksCompleted when a book is un-finished.
     */
    public void decrementBooksCompleted(Long userId) {
        int currentYear = LocalDate.now().getYear();
        Optional<ReadingGoal> goalOpt = readingGoalRepository.findByUserIdAndYear(userId, currentYear);
        if (goalOpt.isPresent()) {
            syncBooksCompleted(goalOpt.get());
        }
    }

    /**
     * Sync the booksCompleted count from actual finished books data.
     * Counts books with FINISHED status and completeDate in the goal year.
     */
    private void syncBooksCompleted(ReadingGoal goal) {
        LocalDate yearStart = LocalDate.of(goal.getYear(), 1, 1);
        LocalDate yearEnd = LocalDate.of(goal.getYear(), 12, 31);
        int actualCount = bookRepository.countFinishedBooksInDateRange(
                goal.getUser().getId(), yearStart, yearEnd);
        if (goal.getBooksCompleted() != actualCount) {
            goal.setBooksCompleted(actualCount);
            readingGoalRepository.save(goal);
        }
    }

    /**
     * Delete a goal.
     */
    public void deleteGoal(Long userId, Long goalId) {
        ReadingGoal goal = readingGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }
        readingGoalRepository.delete(goal);
    }
}
