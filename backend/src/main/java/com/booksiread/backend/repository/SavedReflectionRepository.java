package com.booksiread.backend.repository;

import com.booksiread.backend.entity.SavedReflection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedReflectionRepository extends JpaRepository<SavedReflection, Long> {

    Optional<SavedReflection> findByUserIdAndReflectionId(Long userId, Long reflectionId);

    boolean existsByUserIdAndReflectionId(Long userId, Long reflectionId);

    void deleteByUserIdAndReflectionId(Long userId, Long reflectionId);

    /** Get all saved reflections for a user */
    Page<SavedReflection> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /** Check which reflections in a list the user has saved */
    @Query("SELECT sr.reflection.id FROM SavedReflection sr WHERE sr.user.id = :userId AND sr.reflection.id IN :reflectionIds")
    List<Long> findSavedReflectionIds(@Param("userId") Long userId, @Param("reflectionIds") List<Long> reflectionIds);

    /** Delete all saves for a reflection (cascade cleanup) */
    void deleteByReflectionId(Long reflectionId);
}
