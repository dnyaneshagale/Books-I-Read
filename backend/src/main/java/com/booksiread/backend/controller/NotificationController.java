package com.booksiread.backend.controller;

import com.booksiread.backend.dto.NotificationResponse;
import com.booksiread.backend.entity.User;
import com.booksiread.backend.security.CustomUserDetailsService;
import com.booksiread.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * NotificationController - REST API for in-app notifications
 * Base URL: /api/notifications
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CustomUserDetailsService userDetailsService;

    @Autowired
    public NotificationController(NotificationService notificationService, 
                                  CustomUserDetailsService userDetailsService) {
        this.notificationService = notificationService;
        this.userDetailsService = userDetailsService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userDetailsService.loadUserEntityByUsername(username);
    }

    /** GET /api/notifications - Get all notifications */
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<NotificationResponse> notifications = notificationService
                .getNotifications(currentUser.getId(), page, size);
        return ResponseEntity.ok(notifications);
    }

    /** GET /api/notifications/unread - Get unread notifications */
    @GetMapping("/unread")
    public ResponseEntity<Page<NotificationResponse>> getUnreadNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<NotificationResponse> notifications = notificationService
                .getUnreadNotifications(currentUser.getId(), page, size);
        return ResponseEntity.ok(notifications);
    }

    /** GET /api/notifications/count - Get unread count */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User currentUser = getCurrentUser();
        long count = notificationService.getUnreadCount(currentUser.getId());
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /** POST /api/notifications/{id}/read - Mark one as read */
    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        notificationService.markAsRead(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    /** POST /api/notifications/read-all - Mark all as read */
    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        User currentUser = getCurrentUser();
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
