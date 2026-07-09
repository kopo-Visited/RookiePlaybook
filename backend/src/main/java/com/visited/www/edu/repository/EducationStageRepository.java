package com.visited.www.edu.repository;

import com.visited.www.edu.entity.EducationStage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EducationStageRepository extends JpaRepository<EducationStage, Long> {

    // 특정 과정의 전체 단계 수 조회 (진도율 계산용)
    long countByEducationId(Long educationId);
}
