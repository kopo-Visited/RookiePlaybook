package com.visited.www.edu.service;

import com.visited.www.edu.EducationNotFoundException;
import com.visited.www.edu.MaterialNotFoundException;
import com.visited.www.edu.MaterialResponseDto;
import com.visited.www.edu.dto.mapper.EducationProgressDto;
import com.visited.www.edu.dto.mapper.StageWithProgressDto;
import com.visited.www.edu.dto.response.EducationDetailResponseDto;
import com.visited.www.edu.dto.response.EducationListResponseDto;
import com.visited.www.edu.dto.response.StageMaterialResponseDto;
import com.visited.www.edu.dto.response.StageResponseDto;
import com.visited.www.edu.entity.Education;
import com.visited.www.edu.entity.EducationMaterial;
import com.visited.www.edu.entity.VideoProgress;
import com.visited.www.edu.mapper.EducationMapper;
import com.visited.www.edu.repository.EducationMaterialRepository;
import com.visited.www.edu.repository.EducationRepository;
import com.visited.www.edu.repository.VideoProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EducationServiceImpl implements EducationService {


    private final EducationRepository educationRepository;
    private final EducationMapper educationMapper;
    private final EducationMaterialRepository educationMaterialRepository;
    private final VideoProgressRepository videoProgressRepository;

    // EDU-FR-001: 교육 과정 목록 조회
    @Override
    public Page<EducationListResponseDto> getEducations(Long userId, Pageable pageable) {
        Page<Education> educations = educationRepository.findAll(pageable);

        List<Long> educationIds = educations.getContent().stream()
                .map(Education::getId)
                .collect(Collectors.toList());

        // MyBatis로 진도 정보 한 번에 조회
        Map<Long, EducationProgressDto> progressMap = educationMapper
                .findProgressByUserIdAndEducationIds(userId, educationIds)
                .stream()
                .collect(Collectors.toMap(EducationProgressDto::getEducationId, p -> p));

        List<EducationListResponseDto> content = educations.getContent().stream()
                .map(education -> {
                    EducationProgressDto progress = progressMap.get(education.getId());
                    int progressRate = progress != null ? progress.getProgressRate() : 0;
                    boolean isCompleted = progress != null &&
                            "COMPLETED".equals(progress.getStatus());
                    LocalDateTime completedAt = progress != null ? progress.getCompletedAt() : null;
                    int totalStages = education.getStages().size();
                    int completedStages = progress != null ? progress.getCompletedStages() : 0;

                    return new EducationListResponseDto(
                            education.getId(),
                            education.getTitle(),
                            totalStages,
                            completedStages,
                            progressRate,
                            isCompleted,
                            completedAt
                    );
                })
                .collect(Collectors.toList());

        return new PageImpl<>(content, pageable, educations.getTotalElements());
    }

    // EDU-FR-002: 교육 과정 상세 조회
    @Override
    public EducationDetailResponseDto getEducationDetail(Long userId, Long educationId) {
        Education education = educationRepository.findById(educationId)
                .orElseThrow(EducationNotFoundException::new);

        // MyBatis로 단계 목록 + 완료 여부 + 시청 위치 한 번에 조회
        List<StageWithProgressDto> stages = educationMapper
                .findStagesWithProgressByEducationIdAndUserId(educationId, userId);

        // 진도율 계산
        int totalStages = stages.size();
        long completedCount = stages.stream().filter(StageWithProgressDto::getIsCompleted).count();
        int progressRate = totalStages > 0 ? (int) (completedCount * 100 / totalStages) : 0;
        boolean isCompleted = progressRate >= education.getCompletionCriteria();

        List<StageResponseDto> stageDtos = stages.stream()
                .map(stage -> {
                    MaterialResponseDto materialDto = null;
                    if (stage.getMaterialId() != null) {
                        materialDto = new MaterialResponseDto(
                                stage.getMaterialId(),
                                stage.getMaterialTitle(),
                                stage.getVideoUrl(),
                                stage.getLastWatchedPosition()
                        );
                    }
                    return new StageResponseDto(
                            stage.getStageId(),
                            stage.getTitle(),
                            stage.getOrderNumber(),
                            stage.getIsCompleted(),
                            materialDto
                    );
                })
                .collect(Collectors.toList());

        return new EducationDetailResponseDto(
                education.getId(),
                education.getTitle(),
                education.getDescription(),
                education.getCompletionCriteria(),
                progressRate,
                isCompleted,
                stageDtos
        );
    }

    // EDU-FR-003: 단계 자료 조회 (사용자의 이어보기 위치 포함)
    @Override
    public StageMaterialResponseDto getStageMaterial(Long userId, Long stageId) {
        EducationMaterial material = educationMaterialRepository.findByStageId(stageId)
                .orElseThrow(MaterialNotFoundException::new);

        int lastWatchedPosition = videoProgressRepository
                .findByUserIdAndMaterialId(userId, material.getId())
                .map(VideoProgress::getWatchedPosition)
                .orElse(0);

        return new StageMaterialResponseDto(
                material.getId(),
                material.getTitle(),
                material.getVideoUrl(),
                lastWatchedPosition,
                material.getTotalDuration()
        );
    }
}
