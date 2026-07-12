package com.visited.www.edu.service;

import com.visited.www.edu.StageLockedException;
import com.visited.www.edu.entity.EducationStage;
import com.visited.www.edu.repository.EducationStageRepository;
import com.visited.www.edu.repository.StageCompletionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

// 순차 수강 잠금 정책: 직전 단계(orderNumber 기준)를 완료해야 현재 단계에 접근할 수 있다.
// 첫 단계(직전 단계 없음)는 항상 열려 있다.
@Component
@RequiredArgsConstructor
public class StageAccessPolicy {

    private final EducationStageRepository educationStageRepository;
    private final StageCompletionRepository stageCompletionRepository;

    public void assertUnlocked(Long userId, EducationStage stage) {
        educationStageRepository
                .findFirstByEducationIdAndOrderNumberLessThanOrderByOrderNumberDesc(
                        stage.getEducation().getId(), stage.getOrderNumber())
                .ifPresent(previous -> {
                    if (!stageCompletionRepository.existsByUserIdAndStageId(userId, previous.getId())) {
                        throw new StageLockedException();
                    }
                });
    }
}
