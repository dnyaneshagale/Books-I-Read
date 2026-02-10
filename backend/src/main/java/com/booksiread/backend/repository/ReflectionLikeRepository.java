package com.booksiread.backend.repository;

import com.booksiread.backend.entity.ReflectionLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReflectionLikeRepository extends JpaRepository<ReflectionLike, Long> {

    Optional<ReflectionLike> findByReflectionIdAndUserId(Long reflectionId, Long userId);

    boolean existsByReflectionIdAndUserId(Long reflectionId, Long userId);

    long countByReflectionId(Long reflectionId);

    void deleteByReflectionIdAndUserId(Long reflectionId, Long userId);

    /** Check which reflections in a list the user has liked */
    @Query("SELECT rl.reflection.id FROM ReflectionLike rl WHERE rl.user.id = :userId AND rl.reflection.id IN :reflectionIds")
    List<Long> findLikedReflectionIds(@Param("userId") Long userId, @Param("reflectionIds") List<Long> reflectionIds);

    /** Delete all likes for a reflection (cascade cleanup) */
    void deleteByReflectionId(Long reflectionId);
}
