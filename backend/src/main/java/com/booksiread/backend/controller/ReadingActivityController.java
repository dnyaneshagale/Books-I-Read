package com.booksiread.backend.controller;

import com.booksiread.backend.entity.User;
import com.booksiread.backend.repository.ReadingActivityRepository;
import com.booksiread.backend.security.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * ReadingActivityController - REST API for reading activity tracking
 * 
 * Base URL: /api/activities
 */
@RestController
@RequestMapping("/api/activities")
public class ReadingActivityController {

    private final ReadingActivityRepository activityRepository;
    private final CustomUserDetailsService userDetailsService;

    @Autowired
    public ReadingActivityController(ReadingActivityRepository activityRepository,
                                    CustomUserDetailsService userDetailsService) {
        this.activityRepository = activityRepository;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Get the currently authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userDetailsService.loadUserEntityByUsername(username);
    }

    /**
     * GET /api/activities/dates - Get all unique activity dates for streak calculation
     * 
     * @return list of dates (in descending order) when user had reading activity
     */
    @GetMapping("/dates")
    public ResponseEntity<Map<String, List<LocalDate>>> getActivityDates() {
        User currentUser = getCurrentUser();
        List<LocalDate> activityDates = activityRepository.findDistinctActivityDatesByUser(currentUser);
        
        Map<String, List<LocalDate>> response = new HashMap<>();
        response.put("activityDates", activityDates);
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/activities/daily-stats - Get daily reading statistics for the last 7 days
     * 
     * @return list of daily stats with date and pages read
     */
    @GetMapping("/daily-stats")
    public ResponseEntity<Map<String, Object>> getDailyStats() {
        User currentUser = getCurrentUser();
        
        // Get last 7 days in IST (UTC+5:30)
        java.time.ZoneId istZone = java.time.ZoneId.of("Asia/Kolkata");
        LocalDate today = LocalDate.now(istZone);
        List<Map<String, Object>> dailyStats = new java.util.ArrayList<>();
        
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            
            // Get total pages read on this date
            Integer pagesRead = activityRepository.getTotalPagesReadOnDate(currentUser, date);
            
            Map<String, Object> dayStat = new HashMap<>();
            dayStat.put("date", date.toString()); // Explicitly convert to string
            dayStat.put("pages", pagesRead != null ? pagesRead : 0);
            
            dailyStats.add(dayStat);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("dailyStats", dailyStats);
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/activities/period-stats - Get pages read for week/month/year
     * 
     * @return map with pagesThisWeek, pagesThisMonth, pagesThisYear
     */
    @GetMapping("/period-stats")
    public ResponseEntity<Map<String, Object>> getPeriodStats() {
        User currentUser = getCurrentUser();
        
        // Get dates in IST (UTC+5:30)
        java.time.ZoneId istZone = java.time.ZoneId.of("Asia/Kolkata");
        LocalDate today = LocalDate.now(istZone);
        
        // This week (last 7 days)
        LocalDate weekAgo = today.minusDays(7);
        Integer pagesThisWeek = activityRepository.getTotalPagesReadBetweenDates(currentUser, weekAgo, today);
        
        // This month (from 1st of current month)
        LocalDate monthStart = today.withDayOfMonth(1);
        Integer pagesThisMonth = activityRepository.getTotalPagesReadBetweenDates(currentUser, monthStart, today);
        
        // This year (from Jan 1st of current year)
        LocalDate yearStart = today.withDayOfYear(1);
        Integer pagesThisYear = activityRepository.getTotalPagesReadBetweenDates(currentUser, yearStart, today);
        
        Map<String, Object> response = new HashMap<>();
        response.put("pagesThisWeek", pagesThisWeek != null ? pagesThisWeek : 0);
        response.put("pagesThisMonth", pagesThisMonth != null ? pagesThisMonth : 0);
        response.put("pagesThisYear", pagesThisYear != null ? pagesThisYear : 0);
        
        return ResponseEntity.ok(response);
    }
}

