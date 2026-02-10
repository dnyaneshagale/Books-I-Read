package com.booksiread.backend.repository;

import com.booksiread.backend.entity.ReadingListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingListItemRepository extends JpaRepository<ReadingListItem, Long> {

    List<ReadingListItem> findByReadingListIdOrderByPositionAsc(Long readingListId);

    boolean existsByReadingListIdAndBookTitleAndBookAuthor(Long readingListId, String bookTitle, String bookAuthor);

    long countByReadingListId(Long readingListId);

    Optional<ReadingListItem> findTopByReadingListIdOrderByPositionDesc(Long readingListId);

    @Modifying
    @Query("UPDATE ReadingListItem rli SET rli.position = rli.position - 1 " +
           "WHERE rli.readingList.id = :listId AND rli.position > :position")
    void decrementPositionsAbove(@Param("listId") Long listId, @Param("position") int position);
}
