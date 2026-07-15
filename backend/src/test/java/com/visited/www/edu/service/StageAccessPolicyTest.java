package com.visited.www.edu.service;

import com.visited.www.edu.StageLockedException;
import com.visited.www.edu.entity.Education;
import com.visited.www.edu.entity.EducationStage;
import com.visited.www.edu.repository.EducationStageRepository;
import com.visited.www.edu.repository.StageCompletionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
@DisplayName("순차 수강 잠금 정책")
class StageAccessPolicyTest {

    @InjectMocks
    private StageAccessPolicy stageAccessPolicy;

    @Mock
    private EducationStageRepository educationStageRepository;

    @Mock
    private StageCompletionRepository stageCompletionRepository;

    private EducationStage stageWith(Long educationId, int orderNumber) {
        Education education = mock(Education.class);
        given(education.getId()).willReturn(educationId);
        EducationStage stage = mock(EducationStage.class);
        given(stage.getEducation()).willReturn(education);
        given(stage.getOrderNumber()).willReturn(orderNumber);
        return stage;
    }

    @Test
    @DisplayName("첫 단계(직전 단계 없음)는 항상 열려 있다")
    void firstStage_unlocked() {
        EducationStage stage = stageWith(10L, 1);
        given(educationStageRepository
                .findFirstByEducationIdAndOrderNumberLessThanOrderByOrderNumberDesc(10L, 1))
                .willReturn(Optional.empty());

        assertThatCode(() -> stageAccessPolicy.assertUnlocked(1L, stage))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("직전 단계를 완료했으면 통과한다")
    void previousCompleted_unlocked() {
        EducationStage stage = stageWith(10L, 2);
        EducationStage previous = mock(EducationStage.class);
        given(previous.getId()).willReturn(1L);
        given(educationStageRepository
                .findFirstByEducationIdAndOrderNumberLessThanOrderByOrderNumberDesc(10L, 2))
                .willReturn(Optional.of(previous));
        given(stageCompletionRepository.existsByUserIdAndStageId(1L, 1L)).willReturn(true);

        assertThatCode(() -> stageAccessPolicy.assertUnlocked(1L, stage))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("직전 단계를 완료하지 않았으면 StageLockedException이 발생한다")
    void previousNotCompleted_locked() {
        EducationStage stage = stageWith(10L, 2);
        EducationStage previous = mock(EducationStage.class);
        given(previous.getId()).willReturn(1L);
        given(educationStageRepository
                .findFirstByEducationIdAndOrderNumberLessThanOrderByOrderNumberDesc(10L, 2))
                .willReturn(Optional.of(previous));
        given(stageCompletionRepository.existsByUserIdAndStageId(1L, 1L)).willReturn(false);

        assertThatThrownBy(() -> stageAccessPolicy.assertUnlocked(1L, stage))
                .isInstanceOf(StageLockedException.class);
    }
}
