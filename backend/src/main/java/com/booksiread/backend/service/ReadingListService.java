package com.booksiread.backend.service;

import com.booksiread.backend.dto.AddListItemRequest;
import com.booksiread.backend.dto.ReadingListRequest;
import com.booksiread.backend.dto.ReadingListResponse;
import com.booksiread.backend.entity.*;
import com.booksiread.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReadingListService {

    @Autowired
    private ReadingListRepository readingListRepository;

    @Autowired
    private ReadingListItemRepository readingListItemRepository;

    @Autowired
    private ReadingListLikeRepository readingListLikeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserFollowRepository userFollowRepository;

    // ─── CRUD ────────────────────────────────────────────────────

    public ReadingListResponse createList(Long userId, ReadingListRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("List name is required");
        }

        ReadingList list = new ReadingList();
        list.setUser(user);
        list.setName(request.getName().trim());
        list.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        list.setIsPublic(request.isPublic());
        list.setCoverEmoji(request.getCoverEmoji() != null ? request.getCoverEmoji() : "📚");
        list.setBooksCount(0);
        list.setLikesCount(0);

        list = readingListRepository.save(list);
        return ReadingListResponse.fromEntity(list, false, true);
    }

    public ReadingListResponse updateList(Long userId, Long listId, ReadingListRequest request) {
        ReadingList list = readingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
        if (!list.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            list.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            list.setDescription(request.getDescription().trim());
        }
        list.setIsPublic(request.isPublic());
        if (request.getCoverEmoji() != null) {
            list.setCoverEmoji(request.getCoverEmoji());
        }

        list = readingListRepository.save(list);
        return ReadingListResponse.fromEntity(list, false, true);
    }

    public void deleteList(Long userId, Long listId) {
        ReadingList list = readingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
        if (!list.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }
        readingListRepository.delete(list);
    }

    // ─── Get Lists ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ReadingListResponse getList(Long listId, Long viewerId) {
        ReadingList list = readingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));

        boolean isOwner = list.getUser().getId().equals(viewerId);

        // Check visibility
        if (!list.getIsPublic() && !isOwner) {
            // Only followers can see private lists
            boolean isFollower = userFollowRepository.existsByFollowerIdAndFollowingId(viewerId, list.getUser().getId());
            if (!isFollower) {
                throw new RuntimeException("This list is private");
            }
        }

        boolean liked = readingListLikeRepository.existsByReadingListIdAndUserId(listId, viewerId);
        return ReadingListResponse.fromEntity(list, liked, isOwner);
    }

    @Transactional(readOnly = true)
    public List<ReadingListResponse> getMyLists(Long userId) {
        return readingListRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(list -> ReadingListResponse.fromEntity(list, false, true))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReadingListResponse> getUserPublicLists(Long userId, Long viewerId) {
        boolean isOwner = userId.equals(viewerId);
        if (isOwner) {
            return getMyLists(userId);
        }
        return readingListRepository.findByUserIdAndIsPublicTrueOrderByCreatedAtDesc(userId).stream()
                .map(list -> {
                    boolean liked = readingListLikeRepository.existsByReadingListIdAndUserId(list.getId(), viewerId);
                    return ReadingListResponse.fromEntity(list, liked, false);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ReadingListResponse> browsePopularLists(Long viewerId, int page) {
        Page<ReadingList> lists = readingListRepository.findPopularPublicLists(PageRequest.of(page, 12));
        return lists.map(list -> {
            boolean liked = readingListLikeRepository.existsByReadingListIdAndUserId(list.getId(), viewerId);
            boolean isOwner = list.getUser().getId().equals(viewerId);
            return ReadingListResponse.fromEntity(list, liked, isOwner);
        });
    }

    @Transactional(readOnly = true)
    public Page<ReadingListResponse> searchLists(String query, Long viewerId, int page) {
        Page<ReadingList> lists = readingListRepository.searchPublicLists(query, PageRequest.of(page, 12));
        return lists.map(list -> {
            boolean liked = readingListLikeRepository.existsByReadingListIdAndUserId(list.getId(), viewerId);
            boolean isOwner = list.getUser().getId().equals(viewerId);
            return ReadingListResponse.fromEntity(list, liked, isOwner);
        });
    }

    // ─── Items ──────────────────────────────────────────────────

    public ReadingListResponse addItem(Long userId, Long listId, AddListItemRequest request) {
        ReadingList list = readingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
        if (!list.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        if (request.getBookTitle() == null || request.getBookTitle().isBlank()) {
            throw new RuntimeException("Book title is required");
        }
        String title = request.getBookTitle().trim();
        String author = request.getBookAuthor() != null ? request.getBookAuthor().trim() : "Unknown";

        // Check duplicate
        if (readingListItemRepository.existsByReadingListIdAndBookTitleAndBookAuthor(listId, title, author)) {
            throw new RuntimeException("This book is already in the list");
        }

        // Determine next position
        int nextPosition = readingListItemRepository
                .findTopByReadingListIdOrderByPositionDesc(listId)
                .map(item -> item.getPosition() + 1)
                .orElse(0);

        ReadingListItem item = new ReadingListItem();
        item.setReadingList(list);
        item.setBookTitle(title);
        item.setBookAuthor(author);
        item.setNote(request.getNote() != null ? request.getNote().trim() : null);
        item.setPosition(nextPosition);

        // Optionally link to a Book entity
        if (request.getBookId() != null) {
            bookRepository.findById(request.getBookId()).ifPresent(item::setBook);
        }

        readingListItemRepository.save(item);

        // Update count
        list.setBooksCount((int) readingListItemRepository.countByReadingListId(listId));
        readingListRepository.save(list);

        return getList(listId, userId);
    }

    public ReadingListResponse removeItem(Long userId, Long listId, Long itemId) {
        ReadingList list = readingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
        if (!list.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        ReadingListItem item = readingListItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        if (!item.getReadingList().getId().equals(listId)) {
            throw new RuntimeException("Item does not belong to this list");
        }

        int removedPosition = item.getPosition();
        readingListItemRepository.delete(item);
        readingListItemRepository.decrementPositionsAbove(listId, removedPosition);

        // Update count
        list.setBooksCount((int) readingListItemRepository.countByReadingListId(listId));
        readingListRepository.save(list);

        return getList(listId, userId);
    }

    // ─── Likes ──────────────────────────────────────────────────

    public ReadingListResponse toggleLike(Long userId, Long listId) {
        ReadingList list = readingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean liked;
        var existingLike = readingListLikeRepository.findByReadingListIdAndUserId(listId, userId);
        if (existingLike.isPresent()) {
            readingListLikeRepository.delete(existingLike.get());
            list.setLikesCount(Math.max(0, list.getLikesCount() - 1));
            liked = false;
        } else {
            readingListLikeRepository.save(new ReadingListLike(list, user));
            list.setLikesCount(list.getLikesCount() + 1);
            liked = true;
        }
        readingListRepository.save(list);

        boolean isOwner = list.getUser().getId().equals(userId);
        return ReadingListResponse.fromEntity(list, liked, isOwner);
    }
}
