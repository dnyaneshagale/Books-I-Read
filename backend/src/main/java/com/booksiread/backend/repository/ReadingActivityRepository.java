package com.booksiread.backend.repository;

import com.booksiread.backend.entity.User;
import com.booksiread.backend.model.ReadingActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingActivityRepository extends JpaRepository<ReadingActivity, Long> {
    
    /**
     * Find all reading activities for a user within a date range
     */
    @Query("SELECT ra FROM ReadingActivity ra WHERE ra.user = :user AND ra.activityDate BETWEEN :startDate AND :endDate ORDER BY ra.activityDate DESC")
    List<ReadingActivity> findByUserAndDateRange(
        @Param("user") User user,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    /**
     * Find all reading activities for a user
     */
    List<ReadingActivity> findByUserOrderByActivityDateDesc(User user);
    
    /**
     * Find activity for a specific user, book, and date
     */
    Optional<ReadingActivity> findByUserAndBookIdAndActivityDate(User user, Long bookId, LocalDate activityDate);
    
    /**
     * Get all unique activity dates for a user (for streak calculation)
     */
    @Query("SELECT DISTINCT ra.activityDate FROM ReadingActivity ra WHERE ra.user = :user ORDER BY ra.activityDate DESC")
    List<LocalDate> findDistinctActivityDatesByUser(@Param("user") User user);
    
    /**
     * Delete all activities for a specific book
     */
    void deleteByBookId(Long bookId);
}
