package com.booksiread.backend.repository;

import com.booksiread.backend.entity.ReadingListLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingListLikeRepository extends JpaRepository<ReadingListLike, Long> {

    boolean existsByReadingListIdAndUserId(Long readingListId, Long userId);

    Optional<ReadingListLike> findByReadingListIdAndUserId(Long readingListId, Long userId);

    long countByReadingListId(Long readingListId);

    @Query("SELECT rll FROM ReadingListLike rll " +
           "JOIN FETCH rll.readingList rl " +
           "JOIN FETCH rl.user " +
           "LEFT JOIN FETCH rl.items " +
           "WHERE rll.user.id = :userId " +
           "ORDER BY rll.createdAt DESC")
    List<ReadingListLike> findByUserIdWithListDetails(@Param("userId") Long userId);
}
