package com.visited.www.edu.service;

import com.visited.www.edu.dto.request.StageCreateRequestDto;
import com.visited.www.edu.entity.EducationProgress;
import com.visited.www.edu.repository.EducationProgressRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 이슈 #242 — 단계 추가 시 기존 사용자 진도 재계산 검증.
 *
 * 시드: 교육2(백엔드 기초, 단계 4·5, 수료 기준 100%)를 사용자 id=2가 모두 완료해 100%·COMPLETED.
 * 관리자가 단계를 추가하면 총 단계 수가 3이 되어 2/3=66%로 수료가 해제돼야 한다.
 */
@SpringBootTest
@ActiveProfiles("local")
@Transactional
@DisplayName("단계 추가 시 진도 재계산 (이슈 #242)")
class EducationProgressRecalcTest {

    @Autowired
    private EducationService educationService;
    @Autowired
    private EducationProgressRepository educationProgressRepository;

    @Test
    @DisplayName("완료(100%)였던 사용자에게 단계가 추가되면 진도율이 재계산되고 수료가 해제된다")
    void createStage_recalculatesExistingUserProgress() {
        // given — 사용자2는 교육2를 100% 완료한 상태
        EducationProgress before = educationProgressRepository
                .findByUserIdAndEducationId(2L, 2L).orElseThrow();
        assertThat(before.getProgressRate()).isEqualTo(100);
        assertThat(before.isCompleted()).isTrue();

        StageCreateRequestDto request = new StageCreateRequestDto();
        ReflectionTestUtils.setField(request, "educationId", 2L);
        ReflectionTestUtils.setField(request, "title", "추가 단계");
        ReflectionTestUtils.setField(request, "orderNumber", 3);
        ReflectionTestUtils.setField(request, "videoTitle", "추가 영상");
        ReflectionTestUtils.setField(request, "videoUrl", "https://cdn.example.com/x.mp4");

        // when — 관리자가 교육2에 단계 추가
        educationService.createStage(request);

        // then — 완료 2 / 전체 3 = 66% < 기준 100% → 수료 해제, 완료 시각 초기화
        EducationProgress after = educationProgressRepository
                .findByUserIdAndEducationId(2L, 2L).orElseThrow();
        assertThat(after.getProgressRate()).isEqualTo(66);
        assertThat(after.isCompleted()).isFalse();
        assertThat(after.getCompletedAt()).isNull();
    }
}
