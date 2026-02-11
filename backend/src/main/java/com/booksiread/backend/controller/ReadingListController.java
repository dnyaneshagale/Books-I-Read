package com.booksiread.backend.controller;

import com.booksiread.backend.dto.AddListItemRequest;
import com.booksiread.backend.dto.ReadingListRequest;
import com.booksiread.backend.dto.ReadingListResponse;
import com.booksiread.backend.entity.User;
import com.booksiread.backend.security.CustomUserDetailsService;
import com.booksiread.backend.service.ReadingListService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lists")
public class ReadingListController {

    private final ReadingListService readingListService;
    private final CustomUserDetailsService userDetailsService;

    public ReadingListController(ReadingListService readingListService,
                                  CustomUserDetailsService userDetailsService) {
        this.readingListService = readingListService;
        this.userDetailsService = userDetailsService;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userDetailsService.loadUserEntityByUsername(username);
    }

    // ─── CRUD ────────────────────────────────────────────────────

    /**
     * Create a new reading list.
     * POST /api/lists
     */
    @PostMapping
    public ResponseEntity<ReadingListResponse> createList(@RequestBody ReadingListRequest request) {
        User user = getCurrentUser();
        return ResponseEntity.ok(readingListService.createList(user.getId(), request));
    }

    /**
     * Update a reading list.
     * PUT /api/lists/{listId}
     */
    @PutMapping("/{listId}")
    public ResponseEntity<ReadingListResponse> updateList(@PathVariable Long listId,
                                                            @RequestBody ReadingListRequest request) {
        User user = getCurrentUser();
        return ResponseEntity.ok(readingListService.updateList(user.getId(), listId, request));
    }

    /**
     * Delete a reading list.
     * DELETE /api/lists/{listId}
     */
    @DeleteMapping("/{listId}")
    public ResponseEntity<Void> deleteList(@PathVariable Long listId) {
        User user = getCurrentUser();
        readingListService.deleteList(user.getId(), listId);
        return ResponseEntity.noContent().build();
    }

    // ─── Get Lists ──────────────────────────────────────────────

    /**
     * Get a single list with items.
     * GET /api/lists/{listId}
     */
    @GetMapping("/{listId}")
    public ResponseEntity<ReadingListResponse> getList(@PathVariable Long listId) {
        User user = getCurrentUser();
        return ResponseEntity.ok(readingListService.getList(listId, user.getId()));
    }

    /**
     * Get my lists.
     * GET /api/lists/mine
     */
    @GetMapping("/mine")
    public ResponseEntity<List<ReadingListResponse>> getMyLists() {
        User user = getCurrentUser();
        return ResponseEntity.ok(readingListService.getMyLists(user.getId()));
    }

    /**
     * Get a user's public lists.
     * GET /api/lists/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReadingListResponse>> getUserLists(@PathVariable Long userId) {
        User user = getCurrentUser();
        return ResponseEntity.ok(readingListService.getUserPublicLists(userId, user.getId()));
    }

    /**
     * Browse popular public lists.
     * GET /api/lists/browse?page=0
     */
    @GetMapping("/browse")
    public ResponseEntity<Page<ReadingListResponse>> browseLists(
            @RequestParam(defaultValue = "0") int page) {
        User user = getCurrentUser();
        return ResponseEntity.ok(readingListService.browsePopularLists(user.getId(), page));
    }

    /**
     * Search public lists.
     * GET /api/lists/search?q=...&page=0
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ReadingListResponse>> searchLists(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page) {
        User user = getCurrentUser();
        return ResponseEntity.ok(readingListService.searchLists(q, user.getId(), page));
    }

    /**
     * Get lists the current user has saved (liked).
     * GET /api/lists/saved
     */
    @GetMapping("/saved")
    public ResponseEntity<List<ReadingListResponse>> getSavedLists() {
        User user = getCurrentUser();
        return ResponseEntity.ok(readingListService.getSavedLists(user.getId()));
    }

    // ─── Items ──────────────────────────────────────────────────

    /**
     * Add a book to a list.
     * POST /api/lists/{listId}/items
     */
    @PostMapping("/{listId}/items")
    public ResponseEntity<ReadingListResponse> addItem(@PathVariable Long listId,
                                                        @RequestBody AddListItemRequest request) {
        User user = getCurrentUser();
        return ResponseEntity.ok(readingListService.addItem(user.getId(), listId, request));
    }

    /**
     * Remove a book from a list.
     * DELETE /api/lists/{listId}/items/{itemId}
     */
    @DeleteMapping("/{listId}/items/{itemId}")
    public ResponseEntity<ReadingListResponse> removeItem(@PathVariable Long listId,
                                                            @PathVariable Long itemId) {
        User user = getCurrentUser();
        return ResponseEntity.ok(readingListService.removeItem(user.getId(), listId, itemId));
    }

    // ─── Likes ──────────────────────────────────────────────────

    /**
     * Toggle like on a list.
     * POST /api/lists/{listId}/like
     */
    @PostMapping("/{listId}/like")
    public ResponseEntity<ReadingListResponse> toggleLike(@PathVariable Long listId) {
        User user = getCurrentUser();
        return ResponseEntity.ok(readingListService.toggleLike(user.getId(), listId));
    }
}
