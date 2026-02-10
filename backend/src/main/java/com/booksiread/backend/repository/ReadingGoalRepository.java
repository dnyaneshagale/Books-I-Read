package com.booksiread.backend.repository;

import com.booksiread.backend.entity.ReadingGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingGoalRepository extends JpaRepository<ReadingGoal, Long> {

    List<ReadingGoal> findByUserIdOrderByYearDesc(Long userId);

    Optional<ReadingGoal> findByUserIdAndYear(Long userId, int year);

    boolean existsByUserIdAndYear(Long userId, int year);
}
