package com.booksiread.backend.controller;

import com.booksiread.backend.dto.ReadingGoalRequest;
import com.booksiread.backend.dto.ReadingGoalResponse;
import com.booksiread.backend.entity.User;
import com.booksiread.backend.security.CustomUserDetailsService;
import com.booksiread.backend.service.ReadingGoalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class ReadingGoalController {

    private final ReadingGoalService readingGoalService;
    private final CustomUserDetailsService userDetailsService;

    public ReadingGoalController(ReadingGoalService readingGoalService,
                                  CustomUserDetailsService userDetailsService) {
        this.readingGoalService = readingGoalService;
        this.userDetailsService = userDetailsService;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userDetailsService.loadUserEntityByUsername(username);
    }

    /**
     * Set or update a reading goal.
     * POST /api/goals
     */
    @PostMapping
    public ResponseEntity<ReadingGoalResponse> setGoal(@RequestBody ReadingGoalRequest request) {
        User user = getCurrentUser();
        ReadingGoalResponse response = readingGoalService.setGoal(user.getId(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get the current year's goal.
     * GET /api/goals/current
     */
    @GetMapping("/current")
    public ResponseEntity<ReadingGoalResponse> getCurrentGoal() {
        User user = getCurrentUser();
        ReadingGoalResponse response = readingGoalService.getCurrentGoal(user.getId());
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Get a goal by year.
     * GET /api/goals/{year}
     */
    @GetMapping("/{year}")
    public ResponseEntity<ReadingGoalResponse> getGoalByYear(@PathVariable int year) {
        User user = getCurrentUser();
        ReadingGoalResponse response = readingGoalService.getGoalByYear(user.getId(), year);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Get all goals (history).
     * GET /api/goals/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<ReadingGoalResponse>> getAllGoals() {
        User user = getCurrentUser();
        return ResponseEntity.ok(readingGoalService.getAllGoals(user.getId()));
    }

    /**
     * Delete a goal.
     * DELETE /api/goals/{goalId}
     */
    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long goalId) {
        User user = getCurrentUser();
        readingGoalService.deleteGoal(user.getId(), goalId);
        return ResponseEntity.noContent().build();
    }
}
