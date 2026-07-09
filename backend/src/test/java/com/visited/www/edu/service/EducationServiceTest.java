package com.visited.www.edu.service;

import com.visited.www.edu.EducationInUseException;
import com.visited.www.edu.EducationNotFoundException;
import com.visited.www.edu.MaterialNotFoundException;
import com.visited.www.edu.dto.mapper.EducationProgressDto;
import com.visited.www.edu.dto.mapper.StageWithProgressDto;
import com.visited.www.edu.dto.request.EducationCreateRequestDto;
import com.visited.www.edu.dto.request.EducationUpdateRequestDto;
import com.visited.www.edu.dto.response.EducationCreateResponseDto;
import com.visited.www.edu.dto.response.EducationDetailResponseDto;
import com.visited.www.edu.dto.response.EducationListResponseDto;
import com.visited.www.edu.dto.response.StageMaterialResponseDto;
import com.visited.www.edu.entity.Education;
import com.visited.www.edu.entity.EducationMaterial;
import com.visited.www.edu.entity.EducationStage;
import com.visited.www.edu.entity.VideoProgress;
import com.visited.www.edu.mapper.EducationMapper;
import com.visited.www.edu.repository.EducationMaterialRepository;
import com.visited.www.edu.repository.EducationProgressRepository;
import com.visited.www.edu.repository.EducationRepository;
import com.visited.www.edu.repository.EducationStageRepository;
import com.visited.www.edu.repository.VideoProgressRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EducationServiceTest {

    @InjectMocks
    private EducationServiceImpl educationService;

    @Mock
    private EducationRepository educationRepository;

    @Mock
    private EducationMapper educationMapper;

    @Mock
    private EducationMaterialRepository educationMaterialRepository;

    @Mock
    private VideoProgressRepository videoProgressRepository;

    @Mock
    private EducationStageRepository educationStageRepository;

    @Mock
    private EducationProgressRepository educationProgressRepository;

    // ==================== EDU-FR-001: 교육 과정 목록 조회 ====================

    @Test
    @DisplayName("교육 과정 목록 조회 - 진도율 정보와 함께 반환한다")
    void getEducations_success() {
        // given
        Long userId = 1L;
        Pageable pageable = PageRequest.of(0, 10);

        Education education = mock(Education.class);
        given(education.getId()).willReturn(1L);
        given(education.getTitle()).willReturn("신입사원 온보딩 교육");
        given(education.getStages()).willReturn(List.of(mock(EducationStage.class), mock(EducationStage.class)));

        Page<Education> educationPage = new PageImpl<>(List.of(education));
        given(educationRepository.findAll(pageable)).willReturn(educationPage);

        EducationProgressDto progressDto = new EducationProgressDto();
        progressDto.setEducationId(1L);
        progressDto.setProgressRate(60);
        progressDto.setStatus("IN_PROGRESS");
        progressDto.setCompletedAt(null);
        progressDto.setCompletedStages(1);

        given(educationMapper.findProgressByUserIdAndEducationIds(eq(userId), anyList()))
                .willReturn(List.of(progressDto));

        // when
        Page<EducationListResponseDto> result = educationService.getEducations(userId, pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).educationId()).isEqualTo(1L);
        assertThat(result.getContent().get(0).progressRate()).isEqualTo(60);
        assertThat(result.getContent().get(0).isCompleted()).isFalse();
        assertThat(result.getContent().get(0).totalStages()).isEqualTo(2);
        assertThat(result.getContent().get(0).completedStages()).isEqualTo(1);
    }

    @Test
    @DisplayName("교육 과정 목록 조회 - 진도 정보 없으면 기본값 0으로 반환한다")
    void getEducations_noProgress() {
        // given
        Long userId = 1L;

        Pageable pageable = PageRequest.of(0, 10);

        Education education = mock(Education.class);
        given(education.getId()).willReturn(1L);
        given(education.getTitle()).willReturn("신입사원 온보딩 교육");
        given(education.getStages()).willReturn(List.of());

        given(educationRepository.findAll(pageable))
                .willReturn(new PageImpl<>(List.of(education)));
        given(educationMapper.findProgressByUserIdAndEducationIds(eq(userId), anyList()))
                .willReturn(List.of());

        // when
        Page<EducationListResponseDto> result = educationService.getEducations(userId, pageable);

        // then
        assertThat(result.getContent().get(0).progressRate()).isEqualTo(0);
        assertThat(result.getContent().get(0).isCompleted()).isFalse();
        assertThat(result.getContent().get(0).completedStages()).isEqualTo(0);
    }


    // ==================== EDU-FR-002: 교육 과정 상세 조회 ====================

    @Test
    @DisplayName("교육 과정 상세 조회 - 단계 목록과 진도 정보를 함께 반환한다")
    void getEducationDetail_success() {
        // given
        Long userId = 1L;
        Long educationId = 1L;

        Education education = mock(Education.class);
        given(education.getId()).willReturn(educationId);
        given(education.getTitle()).willReturn("신입사원 온보딩 교육");
        given(education.getCompletionCriteria()).willReturn(80);

        given(educationRepository.findById(educationId)).willReturn(Optional.of(education));

        StageWithProgressDto stage1 = new StageWithProgressDto();
        stage1.setStageId(1L);
        stage1.setTitle("회사 소개");
        stage1.setOrderNumber(1);
        stage1.setIsCompleted(true);
        stage1.setMaterialId(1L);
        stage1.setMaterialTitle("회사 소개 영상");
        stage1.setVideoUrl("https://youtube.com/example");
        stage1.setLastWatchedPosition(120);

        StageWithProgressDto stage2 = new StageWithProgressDto();
        stage2.setStageId(2L);
        stage2.setTitle("보안 교육");
        stage2.setOrderNumber(2);
        stage2.setIsCompleted(false);
        stage2.setMaterialId(null);
        stage2.setLastWatchedPosition(0);

        given(educationMapper.findStagesWithProgressByEducationIdAndUserId(educationId, userId))
                .willReturn(List.of(stage1, stage2));

        // when
        EducationDetailResponseDto result = educationService.getEducationDetail(userId, educationId);

        // then
        assertThat(result.educationId()).isEqualTo(educationId);
        assertThat(result.stages()).hasSize(2);
        assertThat(result.progressRate()).isEqualTo(50);  // 1/2 완료
        assertThat(result.isCompleted()).isFalse();       // 50 < 80 (수료 기준)
        assertThat(result.stages().get(0).isCompleted()).isTrue();
        assertThat(result.stages().get(0).material()).isNotNull();
        assertThat(result.stages().get(1).material()).isNull();  // 자료 없는 단계
    }

    @Test
    @DisplayName("교육 과정 상세 조회 - 존재하지 않는 educationId면 EducationNotFoundException 발생")
    void getEducationDetail_notFound() {
        // given
        Long userId = 1L;
        Long educationId = 999L;
        given(educationRepository.findById(educationId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> educationService.getEducationDetail(userId, educationId))
                .isInstanceOf(EducationNotFoundException.class);
    }

    @Test
    @DisplayName("교육 과정 상세 조회 - 모든 단계 완료 시 수료 처리된다")
    void getEducationDetail_completed() {
        // given
        Long userId = 1L;
        Long educationId = 1L;

        Education education = mock(Education.class);
        given(education.getId()).willReturn(educationId);
        given(education.getTitle()).willReturn("신입사원 온보딩 교육");
        given(education.getCompletionCriteria()).willReturn(80);

        given(educationRepository.findById(educationId)).willReturn(Optional.of(education));

        StageWithProgressDto stage1 = new StageWithProgressDto();
        stage1.setStageId(1L);
        stage1.setIsCompleted(true);
        stage1.setOrderNumber(1);
        stage1.setTitle("회사 소개");

        StageWithProgressDto stage2 = new StageWithProgressDto();
        stage2.setStageId(2L);
        stage2.setIsCompleted(true);
        stage2.setOrderNumber(2);
        stage2.setTitle("보안 교육");

        given(educationMapper.findStagesWithProgressByEducationIdAndUserId(educationId, userId))
                .willReturn(List.of(stage1, stage2));

        // when
        EducationDetailResponseDto result = educationService.getEducationDetail(userId, educationId);

        // then
        assertThat(result.progressRate()).isEqualTo(100);
        assertThat(result.isCompleted()).isTrue();  // 100 >= 80 (수료 기준)
    }

    // ==================== EDU-FR-003: 단계 자료 조회 ====================

    @Test
    @DisplayName("단계 자료 조회 - 자료 정보와 이어보기 위치를 함께 반환한다")
    void getStageMaterial_success() {
        // given
        Long userId = 1L;
        Long stageId = 1L;

        EducationMaterial material = mock(EducationMaterial.class);
        given(material.getId()).willReturn(1L);
        given(material.getTitle()).willReturn("회사 소개 영상");
        given(material.getVideoUrl()).willReturn("https://youtube.com/example");
        given(material.getTotalDuration()).willReturn(600);
        given(educationMaterialRepository.findByStageId(stageId)).willReturn(Optional.of(material));

        VideoProgress videoProgress = mock(VideoProgress.class);
        given(videoProgress.getWatchedPosition()).willReturn(120);
        given(videoProgressRepository.findByUserIdAndMaterialId(userId, 1L))
                .willReturn(Optional.of(videoProgress));

        // when
        StageMaterialResponseDto result = educationService.getStageMaterial(userId, stageId);

        // then
        assertThat(result.materialId()).isEqualTo(1L);
        assertThat(result.title()).isEqualTo("회사 소개 영상");
        assertThat(result.lastWatchedPosition()).isEqualTo(120);
        assertThat(result.totalDuration()).isEqualTo(600);
    }

    @Test
    @DisplayName("단계 자료 조회 - 시청 기록이 없으면 이어보기 위치는 0이다")
    void getStageMaterial_noProgress() {
        // given
        Long userId = 1L;
        Long stageId = 1L;

        EducationMaterial material = mock(EducationMaterial.class);
        given(material.getId()).willReturn(1L);
        given(educationMaterialRepository.findByStageId(stageId)).willReturn(Optional.of(material));
        given(videoProgressRepository.findByUserIdAndMaterialId(userId, 1L))
                .willReturn(Optional.empty());

        // when
        StageMaterialResponseDto result = educationService.getStageMaterial(userId, stageId);

        // then
        assertThat(result.lastWatchedPosition()).isEqualTo(0);
    }

    @Test
    @DisplayName("단계 자료 조회 - 존재하지 않는 stageId면 MaterialNotFoundException 발생")
    void getStageMaterial_notFound() {
        // given
        Long userId = 1L;
        Long stageId = 999L;
        given(educationMaterialRepository.findByStageId(stageId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> educationService.getStageMaterial(userId, stageId))
                .isInstanceOf(MaterialNotFoundException.class);
    }

    // ==================== EDU-FR-007: 관리자 과정 CRUD ====================

    @Test
    @DisplayName("과정 등록 - 저장 후 educationId와 title을 반환한다")
    void createEducation_success() {
        // given
        EducationCreateRequestDto request = mock(EducationCreateRequestDto.class);
        given(request.getTitle()).willReturn("새 과정");
        given(request.getDescription()).willReturn("설명");
        given(request.getCompletionCriteria()).willReturn(80);

        Education saved = mock(Education.class);
        given(saved.getId()).willReturn(10L);
        given(saved.getTitle()).willReturn("새 과정");
        given(educationRepository.save(any(Education.class))).willReturn(saved);

        // when
        EducationCreateResponseDto result = educationService.createEducation(request);

        // then
        assertThat(result.educationId()).isEqualTo(10L);
        assertThat(result.title()).isEqualTo("새 과정");
    }

    @Test
    @DisplayName("과정 수정 - 존재하는 과정이면 update가 호출된다")
    void updateEducation_success() {
        // given
        Long educationId = 1L;
        EducationUpdateRequestDto request = mock(EducationUpdateRequestDto.class);
        given(request.getTitle()).willReturn("수정 과정");
        given(request.getDescription()).willReturn("수정 설명");
        given(request.getCompletionCriteria()).willReturn(90);

        Education education = mock(Education.class);
        given(educationRepository.findById(educationId)).willReturn(Optional.of(education));

        // when
        educationService.updateEducation(educationId, request);

        // then
        verify(education).update("수정 과정", "수정 설명", 90);
    }

    @Test
    @DisplayName("과정 수정 - 존재하지 않는 과정이면 EducationNotFoundException 발생")
    void updateEducation_notFound() {
        // given
        Long educationId = 999L;
        EducationUpdateRequestDto request = mock(EducationUpdateRequestDto.class);
        given(educationRepository.findById(educationId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> educationService.updateEducation(educationId, request))
                .isInstanceOf(EducationNotFoundException.class);
    }

    @Test
    @DisplayName("과정 삭제 - 단계/진도가 없으면 삭제된다")
    void deleteEducation_success() {
        // given
        Long educationId = 1L;
        Education education = mock(Education.class);
        given(educationRepository.findById(educationId)).willReturn(Optional.of(education));
        given(educationStageRepository.countByEducationId(educationId)).willReturn(0L);
        given(educationProgressRepository.existsByEducationId(educationId)).willReturn(false);

        // when
        educationService.deleteEducation(educationId);

        // then
        verify(educationRepository).delete(education);
    }

    @Test
    @DisplayName("과정 삭제 - 단계 또는 진도가 있으면 EducationInUseException 발생(삭제 안 함)")
    void deleteEducation_inUse() {
        // given
        Long educationId = 1L;
        Education education = mock(Education.class);
        given(educationRepository.findById(educationId)).willReturn(Optional.of(education));
        given(educationStageRepository.countByEducationId(educationId)).willReturn(3L);

        // when & then
        assertThatThrownBy(() -> educationService.deleteEducation(educationId))
                .isInstanceOf(EducationInUseException.class);
        verify(educationRepository, never()).delete(any(Education.class));
    }
}
