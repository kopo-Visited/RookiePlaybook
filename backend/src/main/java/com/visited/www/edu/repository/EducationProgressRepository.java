package com.visited.www.edu.repository;

import com.visited.www.edu.entity.EducationProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EducationProgressRepository extends JpaRepository<EducationProgress, Long> {

    // 특정 유저의 특정 과정 진도율 조회
    Optional<EducationProgress> findByUserIdAndEducationId(Long userId, Long educationId);

    // 특정 유저의 전체 과정 진도율 조회
    List<EducationProgress> findAllByUserId(Long userId);
}
