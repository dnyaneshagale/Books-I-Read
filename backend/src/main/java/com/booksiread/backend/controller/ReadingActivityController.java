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
}
