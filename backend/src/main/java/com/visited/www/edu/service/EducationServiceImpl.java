package com.visited.www.edu.service;

import com.visited.www.edu.EducationInUseException;
import com.visited.www.edu.EducationNotFoundException;
import com.visited.www.edu.MaterialNotFoundException;
import com.visited.www.edu.MaterialResponseDto;
import com.visited.www.edu.StageInUseException;
import com.visited.www.edu.StageNotFoundException;
import com.visited.www.edu.dto.mapper.EducationProgressDto;
import com.visited.www.edu.dto.mapper.StageWithProgressDto;
import com.visited.www.edu.dto.request.EducationCreateRequestDto;
import com.visited.www.edu.dto.request.EducationUpdateRequestDto;
import com.visited.www.edu.dto.request.StageCreateRequestDto;
import com.visited.www.edu.dto.request.StageUpdateRequestDto;
import com.visited.www.edu.dto.response.AdminProgressResponseDto;
import com.visited.www.edu.dto.response.EducationCreateResponseDto;
import com.visited.www.edu.dto.response.IncompleteResponseDto;
import com.visited.www.edu.dto.response.EducationDetailResponseDto;
import com.visited.www.edu.dto.response.EducationListResponseDto;
import com.visited.www.edu.dto.response.StageCreateResponseDto;
import com.visited.www.edu.dto.response.StageMaterialResponseDto;
import com.visited.www.edu.dto.response.StageResponseDto;
import com.visited.www.edu.entity.Education;
import com.visited.www.edu.entity.EducationMaterial;
import com.visited.www.edu.entity.EducationProgress;
import com.visited.www.edu.entity.EducationStage;
import com.visited.www.edu.entity.VideoProgress;
import com.visited.www.edu.mapper.EducationMapper;
import com.visited.www.edu.repository.EducationMaterialRepository;
import com.visited.www.edu.repository.EducationProgressRepository;
import com.visited.www.edu.repository.EducationRepository;
import com.visited.www.edu.repository.EducationStageRepository;
import com.visited.www.edu.repository.StageCompletionRepository;
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
    private final EducationStageRepository educationStageRepository;
    private final EducationProgressRepository educationProgressRepository;
    private final StageCompletionRepository stageCompletionRepository;

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
                            completedAt,
                            education.getContentYear()
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
                            stage.getDescription(),
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
                stageDtos,
                education.getContentYear()
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

    // EDU-FR-007: 관리자 교육 과정 등록
    @Override
    @Transactional
    public EducationCreateResponseDto createEducation(EducationCreateRequestDto request) {
        Education education = educationRepository.save(Education.create(
                request.getTitle(), request.getDescription(), request.getCompletionCriteria(),
                request.getContentYear()));
        return new EducationCreateResponseDto(education.getId(), education.getTitle());
    }

    // EDU-FR-007: 관리자 교육 과정 수정
    @Override
    @Transactional
    public void updateEducation(Long educationId, EducationUpdateRequestDto request) {
        Education education = educationRepository.findById(educationId)
                .orElseThrow(EducationNotFoundException::new);
        education.update(request.getTitle(), request.getDescription(),
                request.getCompletionCriteria(), request.getContentYear());
    }

    // EDU-FR-007: 관리자 교육 과정 삭제 (단계/진도가 있으면 삭제 불가)
    @Override
    @Transactional
    public void deleteEducation(Long educationId) {
        Education education = educationRepository.findById(educationId)
                .orElseThrow(EducationNotFoundException::new);

        boolean inUse = educationStageRepository.countByEducationId(educationId) > 0
                || educationProgressRepository.existsByEducationId(educationId);
        if (inUse) {
            throw new EducationInUseException();
        }

        educationRepository.delete(education);
    }

    // EDU-FR-008: 관리자 단계 등록 (자료 함께 생성)
    @Override
    @Transactional
    public StageCreateResponseDto createStage(StageCreateRequestDto request) {
        Education education = educationRepository.findById(request.getEducationId())
                .orElseThrow(EducationNotFoundException::new);

        EducationStage stage = educationStageRepository.save(EducationStage.create(
                education, request.getTitle(), request.getDescription(), request.getOrderNumber()));

        educationMaterialRepository.save(EducationMaterial.create(
                stage, request.getVideoTitle(), request.getVideoUrl()));

        // 총 단계 수가 늘었으므로 해당 과정 사용자들의 진도를 재계산한다
        recalculateProgressForEducation(education);

        return new StageCreateResponseDto(stage.getId(), stage.getTitle());
    }

    // 단계 추가/삭제로 총 단계 수가 바뀌면 해당 과정의 모든 사용자 진도를 재계산한다.
    // (재계산하지 않으면 저장된 progress_rate/status가 상세 화면의 실시간 계산과 어긋난다)
    private void recalculateProgressForEducation(Education education) {
        long totalStages = educationStageRepository.countByEducationId(education.getId());
        List<EducationProgress> progresses = educationProgressRepository
                .findAllByEducationId(education.getId());
        for (EducationProgress progress : progresses) {
            long completedStages = stageCompletionRepository
                    .countByUserIdAndStage_Education_Id(progress.getUser().getId(), education.getId());
            int progressRate = totalStages > 0 ? (int) (completedStages * 100 / totalStages) : 0;
            progress.updateProgress(progressRate, education.getCompletionCriteria());
        }
    }

    // EDU-FR-008: 관리자 단계 수정 (자료 함께 수정, 없으면 생성)
    @Override
    @Transactional
    public void updateStage(Long stageId, StageUpdateRequestDto request) {
        EducationStage stage = educationStageRepository.findById(stageId)
                .orElseThrow(StageNotFoundException::new);
        stage.update(request.getTitle(), request.getDescription(), request.getOrderNumber());

        educationMaterialRepository.findByStageId(stageId)
                .ifPresentOrElse(
                        material -> material.update(request.getVideoTitle(), request.getVideoUrl()),
                        () -> educationMaterialRepository.save(EducationMaterial.create(
                                stage, request.getVideoTitle(), request.getVideoUrl()))
                );
    }

    // EDU-FR-008: 관리자 단계 삭제 (완료/시청 진도가 있으면 삭제 불가)
    @Override
    @Transactional
    public void deleteStage(Long stageId) {
        EducationStage stage = educationStageRepository.findById(stageId)
                .orElseThrow(StageNotFoundException::new);

        EducationMaterial material = educationMaterialRepository.findByStageId(stageId).orElse(null);
        boolean inUse = stageCompletionRepository.existsByStageId(stageId)
                || (material != null && videoProgressRepository.existsByMaterialId(material.getId()));
        if (inUse) {
            throw new StageInUseException();
        }

        if (material != null) {
            educationMaterialRepository.delete(material);
        }
        educationStageRepository.delete(stage);

        // 총 단계 수가 줄었으므로 해당 과정 사용자들의 진도를 재계산한다
        recalculateProgressForEducation(stage.getEducation());
    }

    // EDU-FR-009: 관리자 진도 현황 조회 (부서/과정/완료여부 필터 + 페이징)
    @Override
    public Page<AdminProgressResponseDto> getAdminProgress(
            Long departmentId, Long educationId, Boolean isCompleted, Pageable pageable) {

        List<AdminProgressResponseDto> content = educationMapper
                .findAdminProgress(departmentId, educationId, isCompleted,
                        pageable.getPageSize(), pageable.getOffset())
                .stream()
                .map(row -> new AdminProgressResponseDto(
                        row.getUserId(),
                        row.getUserName(),
                        row.getDepartmentName(),
                        row.getEducationTitle(),
                        row.getProgressRate(),
                        Boolean.TRUE.equals(row.getIsCompleted()),
                        row.getLastStudiedAt()
                ))
                .toList();

        long total = educationMapper.countAdminProgress(departmentId, educationId, isCompleted);

        return new PageImpl<>(content, pageable, total);
    }

    // EDU-FR-010: 미완료자 조회 (과정 필터 + 페이징)
    @Override
    public Page<IncompleteResponseDto> getIncompleteProgress(Long educationId, Pageable pageable) {
        List<IncompleteResponseDto> content = educationMapper
                .findIncompleteProgress(educationId, pageable.getPageSize(), pageable.getOffset())
                .stream()
                .map(row -> new IncompleteResponseDto(
                        row.getUserId(),
                        row.getUserName(),
                        row.getDepartmentName(),
                        row.getEducationTitle(),
                        row.getProgressRate(),
                        row.getCompletionCriteria()
                ))
                .toList();

        long total = educationMapper.countIncompleteProgress(educationId);

        return new PageImpl<>(content, pageable, total);
    }
}
