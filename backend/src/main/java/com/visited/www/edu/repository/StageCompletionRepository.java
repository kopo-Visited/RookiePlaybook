package com.visited.www.edu.repository;

import com.visited.www.edu.entity.StageCompletion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StageCompletionRepository extends JpaRepository<StageCompletion, Long> {

    // 특정 유저가 완료한 단계 ID 목록 조회
    List<StageCompletion> findAllByUserIdAndStageIdIn(Long userId, List<Long> stageIds);

    // 특정 유저가 특정 단계를 이미 완료했는지 여부 (중복 완료 멱등 처리용)
    boolean existsByUserIdAndStageId(Long userId, Long stageId);

    // 특정 유저가 특정 과정에서 완료한 단계 수 (진도율 계산용)
    long countByUserIdAndStage_Education_Id(Long userId, Long educationId);

    // 특정 단계에 완료 이력이 있는지 여부 (단계 삭제 시 사용중 판단용)
    boolean existsByStageId(Long stageId);
}