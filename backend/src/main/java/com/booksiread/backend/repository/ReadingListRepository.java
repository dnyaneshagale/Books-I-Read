package com.booksiread.backend.repository;

import com.booksiread.backend.entity.ReadingList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReadingListRepository extends JpaRepository<ReadingList, Long> {

    List<ReadingList> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<ReadingList> findByUserIdAndIsPublicTrueOrderByCreatedAtDesc(Long userId);

    @Query("SELECT rl FROM ReadingList rl WHERE rl.isPublic = true ORDER BY rl.likesCount DESC, rl.createdAt DESC")
    Page<ReadingList> findPopularPublicLists(Pageable pageable);

    @Query("SELECT rl FROM ReadingList rl WHERE rl.isPublic = true AND " +
           "(LOWER(rl.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(rl.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY rl.likesCount DESC")
    Page<ReadingList> searchPublicLists(@Param("query") String query, Pageable pageable);

    long countByUserId(Long userId);
}
