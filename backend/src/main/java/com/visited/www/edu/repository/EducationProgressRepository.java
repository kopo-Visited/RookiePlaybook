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

    // 특정 과정의 전체 사용자 진도 조회 (단계 추가/삭제 시 진도 재계산용)
    List<EducationProgress> findAllByEducationId(Long educationId);

    // 특정 과정에 진도 기록이 있는지 여부 (과정 삭제 시 사용중 판단용)
    boolean existsByEducationId(Long educationId);
}
