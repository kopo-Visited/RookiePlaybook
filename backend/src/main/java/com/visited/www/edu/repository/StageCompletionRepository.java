package com.visited.www.edu.repository;

import com.visited.www.edu.entity.StageCompletion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StageCompletionRepository extends JpaRepository<StageCompletion, Long> {

    // 특정 유저가 완료한 단계 ID 목록 조회
    List<StageCompletion> findAllByUserIdAndStageIdIn(Long userId, List<Long> stageIds);
}