package com.booksiread.backend.repository;

import com.booksiread.backend.entity.ReadingListLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReadingListLikeRepository extends JpaRepository<ReadingListLike, Long> {

    boolean existsByReadingListIdAndUserId(Long readingListId, Long userId);

    Optional<ReadingListLike> findByReadingListIdAndUserId(Long readingListId, Long userId);

    long countByReadingListId(Long readingListId);
}
