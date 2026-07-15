package com.visited.www.edu.service;

import com.visited.www.edu.EducationNotFoundException;
import com.visited.www.edu.MaterialNotFoundException;
import com.visited.www.edu.StageLockedException;
import com.visited.www.edu.StageNotFoundException;
import com.visited.www.edu.dto.response.MyProgressResponseDto;
import com.visited.www.edu.dto.response.StageCompleteResponseDto;
import com.visited.www.edu.entity.Education;
import com.visited.www.edu.entity.EducationMaterial;
import com.visited.www.edu.entity.EducationProgress;
import com.visited.www.edu.entity.EducationStage;
import com.visited.www.edu.entity.StageCompletion;
import com.visited.www.edu.entity.VideoProgress;
import com.visited.www.edu.enums.ProgressStatus;
import com.visited.www.entity.Department;
import com.visited.www.edu.repository.EducationMaterialRepository;
import com.visited.www.edu.repository.EducationProgressRepository;
import com.visited.www.edu.repository.EducationRepository;
import com.visited.www.edu.repository.EducationStageRepository;
import com.visited.www.edu.repository.StageCompletionRepository;
import com.visited.www.edu.repository.VideoProgressRepository;
import com.visited.www.entity.User;
import com.visited.www.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ProgressServiceTest {

    @InjectMocks
    private ProgressServiceImpl progressService;

    @Mock
    private EducationStageRepository educationStageRepository;

    @Mock
    private StageCompletionRepository stageCompletionRepository;

    @Mock
    private EducationProgressRepository educationProgressRepository;

    @Mock
    private EducationMaterialRepository educationMaterialRepository;

    @Mock
    private VideoProgressRepository videoProgressRepository;

    @Mock
    private EducationRepository educationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StageAccessPolicy stageAccessPolicy;

    @Test
    @DisplayName("단계 완료 처리 - 신규 완료 시 완료 기록을 저장하고 진도율을 갱신한다")
    void completeStage_success() {
        // given
        Long userId = 1L;
        Long stageId = 1L;

        Education education = mock(Education.class);
        given(education.getId()).willReturn(10L);
        given(education.getCompletionCriteria()).willReturn(80);

        EducationStage stage = mock(EducationStage.class);
        given(stage.getEducation()).willReturn(education);

        given(educationStageRepository.findById(stageId)).willReturn(Optional.of(stage));
        given(userRepository.getReferenceById(userId)).willReturn(mock(User.class));
        given(stageCompletionRepository.existsByUserIdAndStageId(userId, stageId)).willReturn(false);
        given(educationStageRepository.countByEducationId(10L)).willReturn(4L);
        given(stageCompletionRepository.countByUserIdAndStage_Education_Id(userId, 10L)).willReturn(2L);

        EducationProgress progress = EducationProgress.create(mock(User.class), education);
        given(educationProgressRepository.findByUserIdAndEducationId(userId, 10L))
                .willReturn(Optional.of(progress));

        // when
        StageCompleteResponseDto result = progressService.completeStage(userId, stageId);

        // then
        assertThat(result.progressRate()).isEqualTo(50);   // 2/4
        assertThat(result.isCompleted()).isFalse();        // 50 < 80
        assertThat(result.completedAt()).isNull();
        verify(stageCompletionRepository, times(1)).save(any(StageCompletion.class));
    }

    @Test
    @DisplayName("단계 완료 처리 - 수료 기준 이상이면 수료 처리되고 수료 시각이 기록된다")
    void completeStage_completed() {
        // given
        Long userId = 1L;
        Long stageId = 4L;

        Education education = mock(Education.class);
        given(education.getId()).willReturn(10L);
        given(education.getCompletionCriteria()).willReturn(80);

        EducationStage stage = mock(EducationStage.class);
        given(stage.getEducation()).willReturn(education);

        given(educationStageRepository.findById(stageId)).willReturn(Optional.of(stage));
        given(userRepository.getReferenceById(userId)).willReturn(mock(User.class));
        given(stageCompletionRepository.existsByUserIdAndStageId(userId, stageId)).willReturn(false);
        given(educationStageRepository.countByEducationId(10L)).willReturn(4L);
        given(stageCompletionRepository.countByUserIdAndStage_Education_Id(userId, 10L)).willReturn(4L);

        EducationProgress progress = EducationProgress.create(mock(User.class), education);
        given(educationProgressRepository.findByUserIdAndEducationId(userId, 10L))
                .willReturn(Optional.of(progress));

        // when
        StageCompleteResponseDto result = progressService.completeStage(userId, stageId);

        // then
        assertThat(result.progressRate()).isEqualTo(100);  // 4/4
        assertThat(result.isCompleted()).isTrue();         // 100 >= 80
        assertThat(result.completedAt()).isNotNull();
    }

    @Test
    @DisplayName("단계 완료 처리 - 이미 완료한 단계면 완료 기록을 새로 저장하지 않는다 (멱등)")
    void completeStage_idempotent() {
        // given
        Long userId = 1L;
        Long stageId = 1L;

        Education education = mock(Education.class);
        given(education.getId()).willReturn(10L);
        given(education.getCompletionCriteria()).willReturn(80);

        EducationStage stage = mock(EducationStage.class);
        given(stage.getEducation()).willReturn(education);

        given(educationStageRepository.findById(stageId)).willReturn(Optional.of(stage));
        given(userRepository.getReferenceById(userId)).willReturn(mock(User.class));
        given(stageCompletionRepository.existsByUserIdAndStageId(userId, stageId)).willReturn(true);
        given(educationStageRepository.countByEducationId(10L)).willReturn(4L);
        given(stageCompletionRepository.countByUserIdAndStage_Education_Id(userId, 10L)).willReturn(1L);

        EducationProgress progress = EducationProgress.create(mock(User.class), education);
        given(educationProgressRepository.findByUserIdAndEducationId(userId, 10L))
                .willReturn(Optional.of(progress));

        // when
        StageCompleteResponseDto result = progressService.completeStage(userId, stageId);

        // then
        assertThat(result.progressRate()).isEqualTo(25);   // 1/4
        verify(stageCompletionRepository, never()).save(any(StageCompletion.class));
    }

    @Test
    @DisplayName("단계 완료 처리 - 직전 단계 미완료로 잠긴 단계면 StageLockedException이 발생한다")
    void completeStage_locked() {
        // given
        Long userId = 1L;
        Long stageId = 2L;
        EducationStage stage = mock(EducationStage.class);
        given(educationStageRepository.findById(stageId)).willReturn(Optional.of(stage));
        willThrow(new StageLockedException()).given(stageAccessPolicy).assertUnlocked(userId, stage);

        // when & then
        assertThatThrownBy(() -> progressService.completeStage(userId, stageId))
                .isInstanceOf(StageLockedException.class);
    }

    @Test
    @DisplayName("단계 완료 처리 - 존재하지 않는 stageId면 StageNotFoundException이 발생한다")
    void completeStage_notFound() {
        // given
        Long userId = 1L;
        Long stageId = 999L;
        given(educationStageRepository.findById(stageId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> progressService.completeStage(userId, stageId))
                .isInstanceOf(StageNotFoundException.class);
    }

    // ==================== EDU-FR-003: 영상 시청 위치 저장 ====================

    @Test
    @DisplayName("영상 시청 위치 저장 - 기존 기록이 없으면 새로 생성한다")
    void saveVideoProgress_create() {
        // given
        Long userId = 1L;
        Long materialId = 1L;

        given(educationMaterialRepository.findById(materialId))
                .willReturn(Optional.of(mock(EducationMaterial.class)));
        given(videoProgressRepository.findByUserIdAndMaterialId(userId, materialId))
                .willReturn(Optional.empty());
        given(userRepository.getReferenceById(userId)).willReturn(mock(User.class));

        // when
        progressService.saveVideoProgress(userId, materialId, 120);

        // then
        verify(videoProgressRepository, times(1)).save(any(VideoProgress.class));
    }

    @Test
    @DisplayName("영상 시청 위치 저장 - 기존 기록이 있으면 위치만 갱신한다 (신규 저장 없음)")
    void saveVideoProgress_update() {
        // given
        Long userId = 1L;
        Long materialId = 1L;

        VideoProgress existing = VideoProgress.create(mock(User.class), mock(EducationMaterial.class), 30);
        given(educationMaterialRepository.findById(materialId))
                .willReturn(Optional.of(mock(EducationMaterial.class)));
        given(videoProgressRepository.findByUserIdAndMaterialId(userId, materialId))
                .willReturn(Optional.of(existing));

        // when
        progressService.saveVideoProgress(userId, materialId, 200);

        // then
        assertThat(existing.getWatchedPosition()).isEqualTo(200);
        verify(videoProgressRepository, never()).save(any(VideoProgress.class));
    }

    @Test
    @DisplayName("영상 시청 위치 저장 - 존재하지 않는 materialId면 MaterialNotFoundException이 발생한다")
    void saveVideoProgress_materialNotFound() {
        // given
        Long userId = 1L;
        Long materialId = 999L;
        given(educationMaterialRepository.findById(materialId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> progressService.saveVideoProgress(userId, materialId, 120))
                .isInstanceOf(MaterialNotFoundException.class);
    }

    // ==================== 수강 시작(enroll) ====================

    @Test
    @DisplayName("수강 시작 - 진도 레코드가 없으면 진행중(IN_PROGRESS)으로 생성한다")
    void enroll_createsProgress() {
        // given
        Long userId = 1L;
        Long educationId = 10L;
        given(educationRepository.findById(educationId)).willReturn(Optional.of(mock(Education.class)));
        given(educationProgressRepository.findByUserIdAndEducationId(userId, educationId))
                .willReturn(Optional.empty());
        given(userRepository.getReferenceById(userId)).willReturn(mock(User.class));

        // when
        progressService.enroll(userId, educationId);

        // then
        ArgumentCaptor<EducationProgress> captor = ArgumentCaptor.forClass(EducationProgress.class);
        verify(educationProgressRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(ProgressStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("수강 시작 - 이미 진도 레코드가 있으면 새로 저장하지 않는다 (멱등)")
    void enroll_idempotent() {
        // given
        Long userId = 1L;
        Long educationId = 10L;
        given(educationRepository.findById(educationId)).willReturn(Optional.of(mock(Education.class)));
        given(educationProgressRepository.findByUserIdAndEducationId(userId, educationId))
                .willReturn(Optional.of(mock(EducationProgress.class)));

        // when
        progressService.enroll(userId, educationId);

        // then
        verify(educationProgressRepository, never()).save(any(EducationProgress.class));
    }

    @Test
    @DisplayName("수강 시작 - 존재하지 않는 과정이면 EducationNotFoundException이 발생한다")
    void enroll_educationNotFound() {
        // given
        Long userId = 1L;
        Long educationId = 999L;
        given(educationRepository.findById(educationId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> progressService.enroll(userId, educationId))
                .isInstanceOf(EducationNotFoundException.class);
    }

    // ==================== EDU-FR-005: 내 진도 조회 ====================

    // 부서를 가진 사용자 mock (getMyProgress 는 사용자 부서로 노출 범위를 판단한다)
    private User userWithDepartment(Long departmentId) {
        Department department = mock(Department.class);
        given(department.getId()).willReturn(departmentId);
        User user = mock(User.class);
        given(user.getDepartment()).willReturn(department);
        return user;
    }

    // departmentId 가 있으면 부서 과정, null 이면 공통 과정(부서 미지정)으로 취급되는 Education mock
    private Education educationOfDepartment(Long educationId, String title, Long departmentId) {
        Education education = mock(Education.class);
        given(education.getId()).willReturn(educationId);
        given(education.getTitle()).willReturn(title);
        if (departmentId != null) {
            Department department = mock(Department.class);
            given(department.getId()).willReturn(departmentId);
            given(education.getDepartment()).willReturn(department);
        }
        return education;
    }

    @Test
    @DisplayName("내 진도 조회 - 진도 기록이 있는 과정을 과정명과 함께 반환한다")
    void getMyProgress_success() {
        // given
        Long userId = 1L;
        User user = userWithDepartment(100L);
        given(userRepository.findById(userId)).willReturn(Optional.of(user));

        Education education1 = mock(Education.class);
        given(education1.getId()).willReturn(1L);
        given(education1.getTitle()).willReturn("신입사원 온보딩 교육");

        EducationProgress progress1 = mock(EducationProgress.class);
        given(progress1.getEducation()).willReturn(education1);
        given(progress1.getProgressRate()).willReturn(100);
        given(progress1.isCompleted()).willReturn(true);

        Education education2 = mock(Education.class);
        given(education2.getId()).willReturn(2L);
        given(education2.getTitle()).willReturn("백엔드 기초 교육");

        EducationProgress progress2 = mock(EducationProgress.class);
        given(progress2.getEducation()).willReturn(education2);
        given(progress2.getProgressRate()).willReturn(40);
        given(progress2.isCompleted()).willReturn(false);

        given(educationProgressRepository.findAllByUserId(userId))
                .willReturn(List.of(progress1, progress2));

        // when
        List<MyProgressResponseDto> result = progressService.getMyProgress(userId);

        // then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).educationId()).isEqualTo(1L);
        assertThat(result.get(0).title()).isEqualTo("신입사원 온보딩 교육");
        assertThat(result.get(0).progressRate()).isEqualTo(100);
        assertThat(result.get(0).isCompleted()).isTrue();
        assertThat(result.get(1).educationId()).isEqualTo(2L);
        assertThat(result.get(1).isCompleted()).isFalse();
    }

    @Test
    @DisplayName("내 진도 조회 - 공통 + 내 부서 과정만 반환하고 다른 부서 과정은 제외한다")
    void getMyProgress_excludesOtherDepartment() {
        // given
        Long userId = 1L;
        Long myDeptId = 100L;
        User user = userWithDepartment(myDeptId);
        given(userRepository.findById(userId)).willReturn(Optional.of(user));

        Education commonEdu = educationOfDepartment(1L, "공통 교육", null);
        Education mineEdu = educationOfDepartment(2L, "개발 부서 교육", myDeptId);
        // 다른 부서(200) 과정 - 필터로 제외되어 id/title 은 조회되지 않으므로 부서 정보만 스텁한다
        Department otherDept = mock(Department.class);
        given(otherDept.getId()).willReturn(200L);
        Education otherEdu = mock(Education.class);
        given(otherEdu.getDepartment()).willReturn(otherDept);

        EducationProgress common = mock(EducationProgress.class);
        given(common.getEducation()).willReturn(commonEdu);
        given(common.getProgressRate()).willReturn(30);

        EducationProgress mine = mock(EducationProgress.class);
        given(mine.getEducation()).willReturn(mineEdu);
        given(mine.getProgressRate()).willReturn(50);

        EducationProgress other = mock(EducationProgress.class);
        given(other.getEducation()).willReturn(otherEdu);

        given(educationProgressRepository.findAllByUserId(userId))
                .willReturn(List.of(common, mine, other));

        // when
        List<MyProgressResponseDto> result = progressService.getMyProgress(userId);

        // then - 공통(1) + 내 부서(2)만, 다른 부서(3)는 제외
        assertThat(result).extracting(MyProgressResponseDto::educationId)
                .containsExactly(1L, 2L)
                .doesNotContain(3L);
    }

    @Test
    @DisplayName("내 진도 조회 - 진도 기록이 없으면 빈 목록을 반환한다")
    void getMyProgress_empty() {
        // given
        Long userId = 1L;
        User user = userWithDepartment(100L);
        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(educationProgressRepository.findAllByUserId(userId)).willReturn(List.of());

        // when
        List<MyProgressResponseDto> result = progressService.getMyProgress(userId);

        // then
        assertThat(result).isEmpty();
    }
}
