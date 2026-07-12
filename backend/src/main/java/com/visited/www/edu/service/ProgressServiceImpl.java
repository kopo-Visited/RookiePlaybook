package com.visited.www.edu.service;

import com.visited.www.edu.EducationNotFoundException;
import com.visited.www.edu.MaterialNotFoundException;
import com.visited.www.edu.StageNotFoundException;
import com.visited.www.edu.dto.response.MyProgressResponseDto;
import com.visited.www.edu.dto.response.StageCompleteResponseDto;
import com.visited.www.edu.entity.Education;
import com.visited.www.edu.entity.EducationMaterial;
import com.visited.www.edu.entity.EducationProgress;
import com.visited.www.edu.entity.EducationStage;
import com.visited.www.edu.entity.StageCompletion;
import com.visited.www.edu.entity.VideoProgress;
import com.visited.www.edu.repository.EducationMaterialRepository;
import com.visited.www.edu.repository.EducationProgressRepository;
import com.visited.www.edu.repository.EducationRepository;
import com.visited.www.edu.repository.EducationStageRepository;
import com.visited.www.edu.repository.StageCompletionRepository;
import com.visited.www.edu.repository.VideoProgressRepository;
import com.visited.www.entity.User;
import com.visited.www.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final EducationStageRepository educationStageRepository;
    private final StageCompletionRepository stageCompletionRepository;
    private final EducationProgressRepository educationProgressRepository;
    private final EducationMaterialRepository educationMaterialRepository;
    private final VideoProgressRepository videoProgressRepository;
    private final EducationRepository educationRepository;
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

    // EDU-FR-003: 영상 시청 위치 저장 (있으면 갱신, 없으면 생성 - upsert)
    @Override
    @Transactional
    public void saveVideoProgress(Long userId, Long materialId, Integer watchedPosition) {
        EducationMaterial material = educationMaterialRepository.findById(materialId)
                .orElseThrow(() -> {
                    log.warn("존재하지 않는 자료 시청 위치 저장 시도. userId={}, materialId={}", userId, materialId);
                    return new MaterialNotFoundException();
                });

        videoProgressRepository.findByUserIdAndMaterialId(userId, materialId)
                .ifPresentOrElse(
                        videoProgress -> videoProgress.updatePosition(watchedPosition),
                        () -> videoProgressRepository.save(VideoProgress.create(
                                userRepository.getReferenceById(userId), material, watchedPosition))
                );

        log.info("영상 시청 위치 저장. userId={}, materialId={}, position={}",
                userId, materialId, watchedPosition);
    }

    // 수강 시작(enroll): 진도 레코드가 없으면 진행중으로 생성한다 (멱등 - 이미 있으면 상태 유지)
    @Override
    @Transactional
    public void enroll(Long userId, Long educationId) {
        Education education = educationRepository.findById(educationId)
                .orElseThrow(EducationNotFoundException::new);

        if (educationProgressRepository.findByUserIdAndEducationId(userId, educationId).isEmpty()) {
            User user = userRepository.getReferenceById(userId);
            EducationProgress progress = EducationProgress.create(user, education);
            progress.markInProgress();
            educationProgressRepository.save(progress);
            log.info("교육 과정 수강 시작. userId={}, educationId={}", userId, educationId);
        }
    }

    // EDU-FR-005: 내 진도 조회 (진도 기록이 있는 과정만)
    @Override
    @Transactional(readOnly = true)
    public List<MyProgressResponseDto> getMyProgress(Long userId) {
        return educationProgressRepository.findAllByUserId(userId).stream()
                .map(progress -> new MyProgressResponseDto(
                        progress.getEducation().getId(),
                        progress.getEducation().getTitle(),
                        progress.getProgressRate(),
                        progress.isCompleted(),
                        progress.getCompletedAt()
                ))
                .toList();
    }
}
