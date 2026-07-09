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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
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
    private UserRepository userRepository;

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
}
