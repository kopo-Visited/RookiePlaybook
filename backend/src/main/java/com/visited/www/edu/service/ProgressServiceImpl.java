package com.visited.www.edu.service;

import com.visited.www.edu.StageNotFoundException;
import com.visited.www.edu.dto.response.StageCompleteResponseDto;
import com.visited.www.edu.entity.Education;
import com.visited.www.edu.entity.EducationProgress;
import com.visited.www.edu.entity.EducationStage;
import com.visited.www.edu.entity.StageCompletion;
import com.visited.www.edu.repository.EducationProgressRepository;
import com.visited.www.edu.repository.EducationStageRepository;
import com.visited.www.edu.repository.StageCompletionRepository;
import com.visited.www.entity.User;
import com.visited.www.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final EducationStageRepository educationStageRepository;
    private final StageCompletionRepository stageCompletionRepository;
    private final EducationProgressRepository educationProgressRepository;
    private final UserRepository userRepository;

    // EDU-FR-004: 단계 완료 처리 (완료 기록 저장 → 진도율 재계산 → 과정 진도 갱신)
    @Override
    @Transactional
    public StageCompleteResponseDto completeStage(Long userId, Long stageId) {
        EducationStage stage = educationStageRepository.findById(stageId)
                .orElseThrow(() -> {
                    log.warn("존재하지 않는 단계 완료 시도. userId={}, stageId={}", userId, stageId);
                    return new StageNotFoundException();
                });

        Education education = stage.getEducation();
        User user = userRepository.getReferenceById(userId);

        // 중복 완료는 멱등 처리 (이미 완료한 단계면 새로 저장하지 않음)
        if (!stageCompletionRepository.existsByUserIdAndStageId(userId, stageId)) {
            stageCompletionRepository.save(StageCompletion.of(user, stage));
        }

        // 진도율 재계산 = 완료 단계 수 / 전체 단계 수 * 100
        long totalStages = educationStageRepository.countByEducationId(education.getId());
        long completedStages = stageCompletionRepository
                .countByUserIdAndStage_Education_Id(userId, education.getId());
        int progressRate = totalStages > 0
                ? (int) (completedStages * 100 / totalStages)
                : 0;

        // 과정 진도 갱신 (없으면 생성 후 갱신)
        EducationProgress progress = educationProgressRepository
                .findByUserIdAndEducationId(userId, education.getId())
                .orElseGet(() -> educationProgressRepository.save(
                        EducationProgress.create(user, education)));
        progress.updateProgress(progressRate, education.getCompletionCriteria());

        log.info("단계 완료 처리 완료. userId={}, stageId={}, progressRate={}, isCompleted={}",
                userId, stageId, progress.getProgressRate(), progress.isCompleted());

        return new StageCompleteResponseDto(
                progress.getProgressRate(),
                progress.isCompleted(),
                progress.getCompletedAt()
        );
    }
}
