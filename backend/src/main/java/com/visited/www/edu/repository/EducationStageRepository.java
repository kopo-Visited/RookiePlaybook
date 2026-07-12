package com.visited.www.edu.repository;

import com.visited.www.edu.entity.EducationStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EducationStageRepository extends JpaRepository<EducationStage, Long> {

    // 특정 과정의 전체 단계 수 조회 (진도율 계산용)
    long countByEducationId(Long educationId);

    // 같은 과정에서 현재 단계 바로 직전 단계(orderNumber가 가장 큰 하위 단계) 조회 (순차 잠금용)
    Optional<EducationStage> findFirstByEducationIdAndOrderNumberLessThanOrderByOrderNumberDesc(
            Long educationId, Integer orderNumber);
}
